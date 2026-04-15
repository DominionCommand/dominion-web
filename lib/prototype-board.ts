import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { LeadRecord } from './leads';
import { buildPrototypeSnapshot } from './prototype';

export type PrototypeBoardNote = {
  id: string;
  text: string;
  createdAt: string;
  status: 'open' | 'done';
};

export type PrototypeBoardState = {
  status: 'draft' | 'active' | 'blocked';
  owner: string;
  selectedScenario: string;
  updatedAt: string;
  notes: PrototypeBoardNote[];
};

const defaultState: PrototypeBoardState = {
  status: 'draft',
  owner: 'Prototype strike team',
  selectedScenario: 'secure-crown-of-null',
  updatedAt: new Date(0).toISOString(),
  notes: [],
};

function getPrototypeBoardFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'prototype-board.json'),
  };
}

export async function readPrototypeBoardState(): Promise<PrototypeBoardState> {
  const { filePath } = getPrototypeBoardFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PrototypeBoardState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is PrototypeBoardNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function savePrototypeBoardState(state: PrototypeBoardState) {
  const { dataDir, filePath } = getPrototypeBoardFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildPrototypeBoard(leads: LeadRecord[]) {
  const snapshot = await buildPrototypeSnapshot(leads);
  const state = await readPrototypeBoardState();
  const selectedScenario = snapshot.prototypeScenarios.find((scenario) => scenario.slug === state.selectedScenario) ?? snapshot.prototypeScenarios[0] ?? null;
  const completedNotes = state.notes.filter((note) => note.status === 'done').length;
  const openNotes = state.notes.filter((note) => note.status === 'open').length;

  const deliveryChecklist = [
    {
      slug: 'scenario-anchor',
      title: selectedScenario ? `Anchor build around ${selectedScenario.title}` : 'Pick a prototype scenario anchor',
      status: selectedScenario ? 'ready' : 'blocked',
      detail: selectedScenario
        ? `${selectedScenario.phase} is the currently selected validation lane.`
        : 'No scenario is currently selected for the prototype board.',
    },
    {
      slug: 'ios-cohort',
      title: 'Keep iOS cohort strong enough for testing',
      status: snapshot.readiness.iosReady >= 10 ? 'ready' : 'watch',
      detail: `${snapshot.readiness.iosReady} iOS-ready leads are currently available for prototype invites.`,
    },
    {
      slug: 'faction-coverage',
      title: 'Maintain faction demand coverage',
      status: snapshot.readiness.factionCoverageComplete ? 'ready' : 'blocked',
      detail: snapshot.readiness.factionCoverageComplete
        ? 'Every faction has tagged prereg demand.'
        : 'At least one faction still has no tagged prereg demand.',
    },
    {
      slug: 'operator-notes',
      title: 'Capture operator decisions in the board',
      status: openNotes + completedNotes > 0 ? 'ready' : 'watch',
      detail: `${openNotes} open notes and ${completedNotes} completed notes are currently saved.`,
    },
  ] as const;

  return {
    generatedAt: new Date().toISOString(),
    state,
    selectedScenario,
    summary: {
      status: state.status,
      owner: state.owner,
      selectedScenarioTitle: selectedScenario?.title ?? 'No scenario selected',
      recommendedWave: snapshot.readiness.recommendedWave,
      qualifiedLeads: snapshot.readiness.qualifiedLeads,
      iosReady: snapshot.readiness.iosReady,
      openNotes,
      completedNotes,
    },
    deliveryChecklist,
    scenarios: snapshot.prototypeScenarios,
    commanderLoadout: snapshot.commanderLoadout,
    coreLoop: snapshot.coreLoop,
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20),
    headline: snapshot.headline,
    readiness: snapshot.readiness,
  };
}
