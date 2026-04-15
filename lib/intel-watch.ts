import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildActivitySnapshot } from './activity-log';
import { buildControlTowerSnapshot } from './control-tower';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildSeasonControlSnapshot } from './season-control';
import { buildSignalsSnapshot } from './signals';

export type IntelWatchStatus = 'monitoring' | 'action-needed' | 'resolved';

export type IntelWatchItem = {
  slug: string;
  title: string;
  status: IntelWatchStatus;
  owner: string;
  note?: string;
  updatedAt: string;
};

export type IntelWatchNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type IntelWatchState = {
  owner: string;
  posture: 'stable' | 'watch' | 'escalated';
  updatedAt: string;
  notes: IntelWatchNote[];
  watchItems: IntelWatchItem[];
};

const defaultState: IntelWatchState = {
  owner: 'Intel command',
  posture: 'watch',
  updatedAt: new Date(0).toISOString(),
  notes: [],
  watchItems: [],
};

function getIntelWatchFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'intel-watch.json'),
  };
}

export async function readIntelWatchState(): Promise<IntelWatchState> {
  const { filePath } = getIntelWatchFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<IntelWatchState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is IntelWatchNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
      watchItems: Array.isArray(parsed.watchItems)
        ? parsed.watchItems.filter((item): item is IntelWatchItem => Boolean(item && typeof item.slug === 'string' && typeof item.title === 'string' && typeof item.status === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveIntelWatchState(state: IntelWatchState) {
  const { dataDir, filePath } = getIntelWatchFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildIntelWatchSnapshot(leads: LeadRecord[]) {
  const [signals, seasonControl, controlTower, activity, state] = await Promise.all([
    buildSignalsSnapshot(leads),
    buildSeasonControlSnapshot(leads),
    buildControlTowerSnapshot(leads),
    buildActivitySnapshot(20),
    readIntelWatchState(),
  ]);

  const leadSummary = summarizeLeads(leads);
  const activityBurst = activity.summary.total >= 8 ? 'high' : activity.summary.total >= 3 ? 'medium' : 'low';
  const unresolvedCount = state.watchItems.filter((item) => item.status !== 'resolved').length;

  const systemWatchlist: Array<{
    slug: string;
    title: string;
    detail: string;
    severity: 'high' | 'medium' | 'low';
    suggestedOwner: string;
  }> = [
    {
      slug: 'funnel-velocity',
      title: 'Funnel velocity',
      detail: `${signals.metrics.last7dLeads} leads landed in the last 7 days, with a ${signals.metrics.leadVelocityDelta >= 0 ? '+' : ''}${signals.metrics.leadVelocityDelta} delta versus the prior 7-day window.`,
      severity: signals.metrics.last7dLeads === 0 ? 'high' : signals.metrics.leadVelocityDelta < 0 ? 'medium' : 'low',
      suggestedOwner: 'Growth',
    },
    {
      slug: 'frontline-pressure',
      title: 'Frontline pressure',
      detail: controlTower.statusSummary.criticalFronts > 0
        ? `${controlTower.statusSummary.criticalFronts} critical fronts are live and ${seasonControl.recommendedZone?.zone ?? 'the frontline'} remains the recommended anchor.`
        : 'No critical fronts are currently flagged by the war-room data flow.',
      severity: controlTower.statusSummary.criticalFronts > 0 ? 'high' : 'low',
      suggestedOwner: 'War Room',
    },
    {
      slug: 'launch-readiness',
      title: 'Launch readiness',
      detail: `${controlTower.statusSummary.qualifiedWaveLeads} qualified leads are ready for ${signals.metrics.recommendedWave}, and tower status is ${controlTower.statusSummary.towerStatus}.`,
      severity: controlTower.statusSummary.launchStatus === 'blocked' ? 'high' : controlTower.statusSummary.invitesSent === 0 ? 'medium' : 'low',
      suggestedOwner: 'Launch',
    },
    {
      slug: 'activity-burst',
      title: 'Operator activity burst',
      detail: `${activity.summary.total} recent operator events were captured across the shared activity log.`,
      severity: activityBurst,
      suggestedOwner: 'Control Tower',
    },
    {
      slug: 'coverage-gaps',
      title: 'Audience coverage gaps',
      detail: `${Object.keys(leadSummary.byFaction).length || 0} factions and ${Object.keys(leadSummary.byAllianceRole).length || 0} alliance roles currently show up in lead data.`,
      severity: signals.weakestFaction?.leads === 0 ? 'high' : signals.weakestRole && signals.weakestRole.count < signals.weakestRole.target ? 'medium' : 'low',
      suggestedOwner: 'Recruitment',
    },
  ];

  const overrides = new Map(state.watchItems.map((item) => [item.slug, item]));

  const watchlist = systemWatchlist.map((item) => {
    const override = overrides.get(item.slug);
    return {
      ...item,
      status: override?.status ?? (item.severity === 'high' ? 'action-needed' : 'monitoring'),
      owner: override?.owner || item.suggestedOwner,
      note: override?.note,
      updatedAt: override?.updatedAt,
    };
  }).sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity] || a.title.localeCompare(b.title);
  });

  const blockers = watchlist.filter((item) => item.severity === 'high' || item.status === 'action-needed');

  return {
    generatedAt: new Date().toISOString(),
    state,
    headline: blockers[0]
      ? `${blockers[0].title} is the top intel watch right now.`
      : 'Intel posture is stable and no urgent watch items are open.',
    summary: {
      posture: state.posture,
      owner: state.owner,
      unresolvedCount,
      leadVelocity: signals.metrics.last7dLeads,
      velocityDelta: signals.metrics.leadVelocityDelta,
      criticalFronts: controlTower.statusSummary.criticalFronts,
      activityBurst,
    },
    watchlist,
    blockers: blockers.map((item) => `${item.title}: ${item.detail}`),
    recommendedActions: [
      blockers[0] ? `Escalate ${blockers[0].title.toLowerCase()} until the owning surface clears it.` : null,
      signals.recommendedActions[0],
      seasonControl.recommendedActions[0],
      controlTower.recommendedActions[0],
    ].filter((item): item is string => Boolean(item)),
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
    modules: {
      signals,
      seasonControl,
      controlTower,
      activity,
    },
  };
}
