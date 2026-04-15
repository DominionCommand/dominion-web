import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { siteContent } from './content';
import { buildOperationsSnapshot } from './operations';
import type { LeadRecord } from './leads';

export type SeasonControlNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type SeasonControlState = {
  status: 'planning' | 'live' | 'cooldown';
  activeBeat: string;
  featuredEventSlug: string;
  featuredZoneSlug: string;
  owner: string;
  updatedAt: string;
  notes: SeasonControlNote[];
};

const defaultState: SeasonControlState = {
  status: 'planning',
  activeBeat: siteContent.seasonBeats[0]?.phase ?? 'Opening Conflict',
  featuredEventSlug: siteContent.events[0]?.slug ?? '',
  featuredZoneSlug: siteContent.worldZones.find((zone) => zone.control === 'contested')?.slug ?? siteContent.worldZones[0]?.slug ?? '',
  owner: 'Live ops command',
  updatedAt: new Date(0).toISOString(),
  notes: [],
};

function getSeasonControlFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'season-control.json'),
  };
}

export async function readSeasonControlState(): Promise<SeasonControlState> {
  const { filePath } = getSeasonControlFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SeasonControlState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is SeasonControlNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveSeasonControlState(state: SeasonControlState) {
  const { dataDir, filePath } = getSeasonControlFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildSeasonControlSnapshot(leads: LeadRecord[]) {
  const state = await readSeasonControlState();
  const operations = await buildOperationsSnapshot(leads);
  const activeBeat = siteContent.seasonBeats.find((beat) => beat.phase === state.activeBeat) ?? siteContent.seasonBeats[0] ?? null;
  const featuredEvent = siteContent.events.find((event) => event.slug === state.featuredEventSlug) ?? siteContent.events[0] ?? null;
  const featuredZone = siteContent.worldZones.find((zone) => zone.slug === state.featuredZoneSlug) ?? operations.activeOperations[0] ?? null;
  const recommendedZone = operations.activeOperations.find((operation) => operation.priority === 'critical') ?? operations.activeOperations[0] ?? null;
  const linkedEvent = featuredZone && 'linkedEventSlug' in featuredZone && featuredZone.linkedEventSlug
    ? siteContent.events.find((event) => event.slug === featuredZone.linkedEventSlug) ?? null
    : null;

  const beatProgress = siteContent.seasonBeats.map((beat, index) => ({
    phase: beat.phase,
    focus: beat.focus,
    status: beat.phase === state.activeBeat ? 'active' : index < siteContent.seasonBeats.findIndex((entry) => entry.phase === state.activeBeat) ? 'completed' : 'upcoming',
    body: beat.body,
  }));

  return {
    generatedAt: new Date().toISOString(),
    state,
    headline: featuredEvent && featuredZone
      ? `${featuredEvent.name} is the live event hook and ${'zone' in featuredZone ? featuredZone.zone : featuredZone.name} is the season pressure anchor.`
      : 'Season control is ready for live event and frontline assignment.',
    activeBeat,
    featuredEvent,
    featuredZone,
    linkedEvent,
    recommendedZone,
    beatProgress,
    pressureSummary: {
      activeFronts: operations.activeOperations.length,
      criticalFronts: operations.activeOperations.filter((operation) => operation.priority === 'critical').length,
      highPressureZones: operations.activeOperations.filter((operation) => operation.pressure === 'high').length,
    },
    recommendedActions: [
      featuredEvent ? `Keep ${featuredEvent.name} synced across website copy, launch timing, and operator messaging.` : null,
      recommendedZone ? `Use ${recommendedZone.zone} as the next prototype and live-ops pressure story.` : null,
      linkedEvent ? `Align ${linkedEvent.name} rewards with the featured zone so the seasonal story reads clearly.` : null,
    ].filter((item): item is string => Boolean(item)),
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
