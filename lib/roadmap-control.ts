import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildActivitySnapshot } from './activity-log';
import { siteContent } from './content';
import { buildControlTowerSnapshot } from './control-tower';
import type { LeadRecord } from './leads';
import { buildReleaseRoomSnapshot } from './release-room';
import { buildRouteInventory } from './routes';

export type RoadmapPhaseStatus = 'active' | 'next' | 'planned' | 'watch' | 'blocked' | 'done';

export type RoadmapControlNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type RoadmapPhaseOverride = {
  phase: string;
  status: RoadmapPhaseStatus;
  owner: string;
  nextDeliverable?: string;
  note?: string;
  updatedAt: string;
};

export type RoadmapControlState = {
  owner: string;
  updatedAt: string;
  notes: RoadmapControlNote[];
  phaseOverrides: RoadmapPhaseOverride[];
};

const defaultState: RoadmapControlState = {
  owner: 'Dominion Nexus product command',
  updatedAt: new Date(0).toISOString(),
  notes: [],
  phaseOverrides: [],
};

function getRoadmapControlFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'roadmap-control.json'),
  };
}

export async function readRoadmapControlState(): Promise<RoadmapControlState> {
  const { filePath } = getRoadmapControlFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<RoadmapControlState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is RoadmapControlNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
      phaseOverrides: Array.isArray(parsed.phaseOverrides)
        ? parsed.phaseOverrides.filter((item): item is RoadmapPhaseOverride => Boolean(item && typeof item.phase === 'string' && typeof item.status === 'string' && typeof item.owner === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveRoadmapControlState(state: RoadmapControlState) {
  const { dataDir, filePath } = getRoadmapControlFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

function buildDefaultPhaseMeta(phase: string, leads: LeadRecord[]) {
  const routeInventory = buildRouteInventory();

  if (phase === 'Phase 1') {
    return {
      owner: 'Web command',
      nextDeliverable: 'Keep expanding website and APIs',
      status: routeInventory.counts.pages >= 20 && routeInventory.counts.api >= 20 ? 'active' : 'watch',
      completion: Math.min(100, Math.round(((routeInventory.counts.pages + routeInventory.counts.api) / 60) * 100)),
      metrics: [
        `${routeInventory.counts.pages} pages live`,
        `${routeInventory.counts.api} APIs live`,
        `${leads.length} lead records captured`,
      ],
      dependencies: ['Preregister flow', 'Route inventory', 'Public content model'],
    };
  }

  if (phase === 'Phase 2') {
    return {
      owner: 'Prototype command',
      nextDeliverable: 'Connect prototype loop to richer live data',
      status: 'next' as const,
      completion: 42,
      metrics: ['Prototype route live', 'Commander and world data exposed', 'Campaign and event scaffolds connected'],
      dependencies: ['Prototype board', 'Campaign data', 'World zones'],
    };
  }

  return {
    owner: 'Launch command',
    nextDeliverable: 'Turn ops surfaces into launch automation',
    status: 'planned' as const,
    completion: 28,
    metrics: ['Control tower live', 'Release room live', 'Storefront and signals surfaces live'],
    dependencies: ['Release room', 'Control tower', 'Mission control'],
  };
}

export async function buildRoadmapSnapshot(leads: LeadRecord[]) {
  const [state, releaseRoom, controlTower, activity] = await Promise.all([
    readRoadmapControlState(),
    buildReleaseRoomSnapshot(leads),
    buildControlTowerSnapshot(leads),
    buildActivitySnapshot(24),
  ]);

  const overrideMap = new Map(state.phaseOverrides.map((item) => [item.phase, item]));

  const phases = siteContent.roadmap.map((item) => {
    const base = buildDefaultPhaseMeta(item.phase, leads);
    const override = overrideMap.get(item.phase);
    const status = override?.status ?? base.status ?? item.status;
    const owner = override?.owner || base.owner;
    const nextDeliverable = override?.nextDeliverable ?? base.nextDeliverable;
    const operatorNote = override?.note;

    return {
      ...item,
      status,
      owner,
      nextDeliverable,
      operatorNote,
      updatedAt: override?.updatedAt ?? state.updatedAt,
      completion: base.completion,
      metrics: base.metrics,
      dependencies: base.dependencies,
    };
  });

  const blockers = Array.from(new Set([
    ...releaseRoom.blockers,
    ...controlTower.blockers,
  ])).slice(0, 8);

  const activePhase = phases.find((phase) => phase.status === 'active') ?? phases[0];
  const nextPhase = phases.find((phase) => phase.phase !== activePhase.phase && (phase.status === 'next' || phase.status === 'planned' || phase.status === 'watch')) ?? phases[1] ?? null;

  return {
    generatedAt: new Date().toISOString(),
    state,
    summary: {
      owner: state.owner,
      activePhase: activePhase?.title ?? null,
      nextPhase: nextPhase?.title ?? null,
      releaseDecision: releaseRoom.summary.decision,
      controlTowerStatus: controlTower.state.status,
      totalBlockers: blockers.length,
      recentActivity: activity.summary.total,
    },
    headline: `${activePhase?.title ?? 'Roadmap'} is the active delivery lane, while ${nextPhase?.title ?? 'the next milestone'} is the next product gate.`,
    phases,
    blockers,
    recommendedActions: Array.from(new Set([
      activePhase?.nextDeliverable,
      nextPhase?.nextDeliverable,
      ...releaseRoom.recommendedActions,
      ...controlTower.recommendedActions,
    ].filter((item): item is string => Boolean(item)))).slice(0, 8),
    recentActivity: activity.entries.slice(0, 10),
    releaseSummary: releaseRoom.summary,
    controlTowerSummary: controlTower.statusSummary,
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
