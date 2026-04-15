import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { siteContent } from './content';
import { buildDashboardSnapshot } from './dashboard';
import type { LeadRecord } from './leads';

export type LaunchPlanNote = {
  id: string;
  text: string;
  createdAt: string;
  status: 'open' | 'done';
};

export type LaunchPlanState = {
  status: 'draft' | 'active' | 'blocked';
  owner: string;
  targetWave: string;
  updatedAt: string;
  notes: LaunchPlanNote[];
};

const defaultState: LaunchPlanState = {
  status: 'draft',
  owner: 'Dominion Nexus operators',
  targetWave: 'wave-0-founder',
  updatedAt: new Date(0).toISOString(),
  notes: [],
};

function getLaunchPlanFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'launch-plan.json'),
  };
}

export async function readLaunchPlanState(): Promise<LaunchPlanState> {
  const { filePath } = getLaunchPlanFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LaunchPlanState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is LaunchPlanNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveLaunchPlanState(state: LaunchPlanState) {
  const { dataDir, filePath } = getLaunchPlanFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildLaunchPlan(leads: LeadRecord[]) {
  const dashboard = await buildDashboardSnapshot(leads);
  const state = await readLaunchPlanState();
  const weakestFaction = dashboard.summary.weakestFaction;
  const hottestFront = dashboard.summary.hottestFront;
  const activeEvent = siteContent.events.find((event) => event.status === 'active') ?? siteContent.events[0] ?? null;
  const founderReady = dashboard.playtest.byWave['wave-0-founder'];
  const criticalFronts = dashboard.warRoom.criticalFronts;

  const launchChecklist = [
    {
      slug: 'invite-wave',
      title: `Stand up ${dashboard.summary.recommendedWave.label}`,
      status: dashboard.summary.recommendedWave.qualifiedLeads > 0 ? 'ready' : 'blocked',
      owner: 'Growth + playtest ops',
      detail: `${dashboard.summary.recommendedWave.qualifiedLeads} qualified leads are available for the current recommended cohort.`,
    },
    {
      slug: 'world-anchor',
      title: hottestFront ? `Anchor launch messaging to ${hottestFront.zone}` : 'Anchor launch messaging to the first frontline conflict',
      status: hottestFront ? 'ready' : 'blocked',
      owner: 'Website + narrative surfaces',
      detail: hottestFront
        ? `${hottestFront.priority} pressure is already mapped with ${hottestFront.commander} as the clearest commander hook.`
        : 'No frontline anchor has been selected yet.',
    },
    {
      slug: 'faction-balance',
      title: weakestFaction ? `Strengthen ${weakestFaction.name} demand` : 'Keep faction demand balanced',
      status: weakestFaction && weakestFaction.leads === 0 ? 'blocked' : 'watch',
      owner: 'Website + growth surfaces',
      detail: weakestFaction
        ? `${weakestFaction.leads} leads are tagged to the weakest faction queue right now.`
        : 'Faction coverage is not reporting yet.',
    },
    {
      slug: 'event-hook',
      title: activeEvent ? `Ship ${activeEvent.name} as the live event hook` : 'Define first live event hook',
      status: activeEvent ? 'ready' : 'blocked',
      owner: 'Live ops + content',
      detail: activeEvent
        ? `${activeEvent.window} window and ${activeEvent.reward.toLowerCase()} are already available for campaign copy.`
        : 'No active event is currently available.',
    },
  ] as const;

  return {
    generatedAt: new Date().toISOString(),
    state,
    summary: {
      status: state.status,
      owner: state.owner,
      targetWave: state.targetWave,
      founderReady,
      recommendedWave: dashboard.summary.recommendedWave,
      hottestFront,
      weakestFaction,
      activeEvent,
      criticalFrontCount: criticalFronts.length,
    },
    launchChecklist,
    launchWindows: siteContent.events.map((event) => ({
      slug: event.slug,
      name: event.name,
      window: event.window,
      status: event.status,
      objective: event.objective,
    })),
    factionCoverage: dashboard.playtest.factionCoverage,
    founderQueue: dashboard.summary.founderQueue,
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
