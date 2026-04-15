import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildActivitySnapshot } from './activity-log';
import { buildControlTowerSnapshot } from './control-tower';
import { buildIntakeDashboardSnapshot } from './intake-dashboard';
import { buildInviteQueue } from './invite-queue';
import type { LeadRecord } from './leads';
import { buildSeasonControlSnapshot } from './season-control';
import { buildSignalsSnapshot } from './signals';
import { buildStorefrontSnapshot } from './storefront';

export type ReleaseDecision = 'go' | 'hold' | 'blocked';

export type ReleaseRoomNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type ReleaseRoomState = {
  decision: ReleaseDecision;
  owner: string;
  nextMilestone: string;
  updatedAt: string;
  notes: ReleaseRoomNote[];
};

const defaultState: ReleaseRoomState = {
  decision: 'hold',
  owner: 'Release command',
  nextMilestone: 'Founder wave readiness review',
  updatedAt: new Date(0).toISOString(),
  notes: [],
};

function getReleaseRoomFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'release-room.json'),
  };
}

export async function readReleaseRoomState(): Promise<ReleaseRoomState> {
  const { filePath } = getReleaseRoomFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ReleaseRoomState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is ReleaseRoomNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveReleaseRoomState(state: ReleaseRoomState) {
  const { dataDir, filePath } = getReleaseRoomFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildReleaseRoomSnapshot(leads: LeadRecord[]) {
  const [state, seasonControl, controlTower, inviteQueue, intake, signals, storefront, activity] = await Promise.all([
    readReleaseRoomState(),
    buildSeasonControlSnapshot(leads),
    buildControlTowerSnapshot(leads),
    buildInviteQueue(leads),
    buildIntakeDashboardSnapshot(leads),
    buildSignalsSnapshot(leads),
    buildStorefrontSnapshot(leads),
    buildActivitySnapshot(30),
  ]);

  const checklist = [
    {
      slug: 'season-anchor',
      title: 'Season anchor is selected',
      status: seasonControl.state.status === 'live' ? 'ready' : 'watch',
      detail: seasonControl.featuredEvent ? `${seasonControl.featuredEvent.name} is attached to the current beat.` : 'No featured event is selected yet.',
      owner: seasonControl.state.owner,
      surface: '/command-center',
    },
    {
      slug: 'qualified-wave',
      title: 'Qualified invite wave exists',
      status: inviteQueue.summary.selectedNow > 0 || inviteQueue.summary.invitesSent > 0 ? 'ready' : signals.metrics.recommendedWaveQualified > 0 ? 'watch' : 'blocked',
      detail: `${signals.metrics.recommendedWaveQualified} leads qualify for ${signals.metrics.recommendedWave}. ${inviteQueue.summary.selectedNow} are selected and ${inviteQueue.summary.invitesSent} are sent.`,
      owner: 'Growth ops',
      surface: '/invite-queue',
    },
    {
      slug: 'cross-functional-command',
      title: 'Cross-functional command lane is active',
      status: controlTower.state.status === 'blocked' ? 'blocked' : controlTower.state.status === 'executing' ? 'ready' : 'watch',
      detail: `${controlTower.state.focusLane} is the active lane and ${controlTower.statusSummary.blockedCampaigns} campaigns are currently blocked.`,
      owner: controlTower.state.owner,
      surface: '/control-tower',
    },
    {
      slug: 'inbound-followup',
      title: 'Inbound follow-up is under control',
      status: intake.summary.directInbound > 0 ? 'watch' : 'ready',
      detail: `${intake.summary.directInbound} direct inbound requests and ${intake.summary.highPriorityLeads} high-priority leads still need follow-up.`,
      owner: 'Growth ops',
      surface: '/intake',
    },
    {
      slug: 'store-hook',
      title: 'Monetization hook is ready',
      status: storefront.summary.activeEvent ? 'ready' : 'watch',
      detail: storefront.summary.activeEvent
        ? `${storefront.summary.featuredOffer.name} is aligned to ${storefront.summary.activeEvent.name}.`
        : `${storefront.summary.featuredOffer.name} is featured, but no active event hook is selected yet.`,
      owner: storefront.state.owner,
      surface: '/storefront',
    },
  ] as const;

  const blockers = Array.from(new Set([
    ...controlTower.blockers,
    ...signals.pressureSignals.filter((signal) => signal.severity === 'high').map((signal) => `${signal.title}: ${signal.detail}`),
    ...(inviteQueue.summary.invitesSent === 0 ? ['No playtest invites are marked sent yet.'] : []),
  ])).slice(0, 8);

  const readyCount = checklist.filter((item) => item.status === 'ready').length;
  const blockedCount = checklist.filter((item) => item.status === 'blocked').length;

  return {
    generatedAt: new Date().toISOString(),
    state,
    summary: {
      decision: state.decision,
      owner: state.owner,
      nextMilestone: state.nextMilestone,
      readyCount,
      watchCount: checklist.filter((item) => item.status === 'watch').length,
      blockedCount,
      recommendedWave: signals.metrics.recommendedWave,
      recommendedWaveQualified: signals.metrics.recommendedWaveQualified,
      selectedInvites: inviteQueue.summary.selectedNow,
      invitesSent: inviteQueue.summary.invitesSent,
      activeFocusLane: controlTower.state.focusLane,
    },
    headline: blockedCount > 0
      ? `Release posture is ${state.decision}. ${blockedCount} hard blocker${blockedCount === 1 ? '' : 's'} still need clearance.`
      : `${state.nextMilestone} is the next gate, with ${readyCount} of ${checklist.length} readiness checks already green.`,
    checklist,
    blockers,
    recommendedActions: Array.from(new Set([
      ...controlTower.recommendedActions,
      ...intake.actions,
      ...storefront.recommendations,
    ])).slice(0, 6),
    recentActivity: activity.entries.slice(0, 8),
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
