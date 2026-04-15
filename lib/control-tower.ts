import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildFounderPipeline } from './founder-pipeline';
import { buildInviteQueue } from './invite-queue';
import { buildLaunchPlan } from './launch-plan';
import type { LeadRecord } from './leads';
import { buildRecruitmentSnapshot } from './recruitment';
import { buildSignalsSnapshot } from './signals';
import { buildWarRoomBriefing } from './war-room';

export type ControlTowerItemStatus = 'todo' | 'active' | 'blocked' | 'done';
export type ControlTowerLane = 'Growth' | 'Launch' | 'War Room';

export type ControlTowerNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type ControlTowerQueueOverride = {
  slug: string;
  status: ControlTowerItemStatus;
  owner: string;
  note?: string;
  updatedAt: string;
};

export type ControlTowerState = {
  status: 'monitoring' | 'executing' | 'blocked';
  owner: string;
  focusLane: ControlTowerLane;
  updatedAt: string;
  notes: ControlTowerNote[];
  queueOverrides: ControlTowerQueueOverride[];
};

const defaultState: ControlTowerState = {
  status: 'monitoring',
  owner: 'Dominion Nexus command',
  focusLane: 'Launch',
  updatedAt: new Date(0).toISOString(),
  notes: [],
  queueOverrides: [],
};

function getControlTowerFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'control-tower.json'),
  };
}

export async function readControlTowerState(): Promise<ControlTowerState> {
  const { filePath } = getControlTowerFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ControlTowerState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is ControlTowerNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
      queueOverrides: Array.isArray(parsed.queueOverrides)
        ? parsed.queueOverrides.filter((item): item is ControlTowerQueueOverride => Boolean(item && typeof item.slug === 'string' && typeof item.status === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveControlTowerState(state: ControlTowerState) {
  const { dataDir, filePath } = getControlTowerFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

function normalizeQueueStatus(status: string): ControlTowerItemStatus {
  if (status === 'active') return 'active';
  if (status === 'blocked') return 'blocked';
  if (status === 'done') return 'done';
  return 'todo';
}

export async function buildControlTowerSnapshot(leads: LeadRecord[]) {
  const [signals, launchPlan, inviteQueue, recruitment, warRoom, founderPipeline, state] = await Promise.all([
    buildSignalsSnapshot(leads),
    buildLaunchPlan(leads),
    buildInviteQueue(leads),
    buildRecruitmentSnapshot(leads),
    buildWarRoomBriefing(leads),
    buildFounderPipeline(leads),
    readControlTowerState(),
  ]);

  const blockers = [
    launchPlan.launchChecklist.find((item) => item.status === 'blocked')
      ? `${launchPlan.launchChecklist.find((item) => item.status === 'blocked')?.title}: ${launchPlan.launchChecklist.find((item) => item.status === 'blocked')?.detail}`
      : null,
    signals.pressureSignals.find((signal) => signal.severity === 'high')
      ? `${signals.pressureSignals.find((signal) => signal.severity === 'high')?.title}: ${signals.pressureSignals.find((signal) => signal.severity === 'high')?.detail}`
      : null,
    inviteQueue.summary.invitesSent === 0
      ? 'No invites are marked sent yet, so the playtest queue is still in staging mode.'
      : null,
    founderPipeline.summary.qualified === 0
      ? 'No founder leads are marked qualified yet, so outreach handoff is still thin.'
      : null,
  ].filter((item): item is string => Boolean(item));

  const queueOverrides = new Map(state.queueOverrides.map((item) => [item.slug, item]));

  const executionQueue = [
    ...recruitment.campaigns.map((campaign) => ({
      slug: `campaign-${campaign.slug}`,
      lane: 'Growth' as ControlTowerLane,
      title: campaign.title,
      status: normalizeQueueStatus(campaign.operatorStatus),
      owner: campaign.operatorOwner || 'Unassigned',
      detail: campaign.whyNow,
      surface: campaign.supportSurface,
      operatorNote: campaign.operatorNote,
    })),
    ...launchPlan.launchChecklist.map((item) => ({
      slug: `launch-${item.slug}`,
      lane: 'Launch' as ControlTowerLane,
      status: (item.status === 'blocked' ? 'blocked' : item.status === 'ready' ? 'active' : 'todo') as ControlTowerItemStatus,
      title: item.title,
      owner: item.owner,
      detail: item.detail,
      surface: '/launch-plan',
      operatorNote: '',
    })),
    ...warRoom.focusQueue.map((item) => ({
      slug: `war-${item.slug}`,
      lane: 'War Room' as ControlTowerLane,
      title: item.title,
      status: normalizeQueueStatus(item.operatorStatus),
      owner: item.operatorOwner || item.owner,
      detail: item.action,
      surface: '/war-room',
      operatorNote: item.operatorNote,
    })),
  ].map((item) => {
    const override = queueOverrides.get(item.slug);

    return override
      ? {
          ...item,
          status: override.status,
          owner: override.owner || item.owner,
          operatorNote: override.note ?? item.operatorNote,
          updatedAt: override.updatedAt,
        }
      : item;
  }).sort((a, b) => {
    const focusDelta = Number(b.lane === state.focusLane) - Number(a.lane === state.focusLane);
    if (focusDelta !== 0) return focusDelta;

    const statusOrder: Record<ControlTowerItemStatus, number> = {
      active: 0,
      blocked: 1,
      todo: 2,
      done: 3,
    };

    return statusOrder[a.status] - statusOrder[b.status] || a.title.localeCompare(b.title);
  });

  const statusSummary = {
    totalLeads: signals.metrics.totalLeads,
    uniqueLeads: signals.metrics.uniqueLeads,
    qualifiedWaveLeads: signals.metrics.recommendedWaveQualified,
    selectedInvites: inviteQueue.summary.selectedNow,
    invitesSent: inviteQueue.summary.invitesSent,
    launchStatus: launchPlan.state.status,
    activeCampaigns: recruitment.board.summary.active,
    blockedCampaigns: recruitment.board.summary.blocked,
    criticalFronts: warRoom.criticalFronts.length,
    towerStatus: state.status,
    focusLane: state.focusLane,
  };

  return {
    generatedAt: new Date().toISOString(),
    state,
    headline: `${signals.metrics.recommendedWave} is the active launch cohort and ${warRoom.criticalFronts[0]?.zone ?? 'the frontline'} is the current war anchor.`,
    statusSummary,
    blockers,
    modules: {
      signals,
      launchPlan,
      inviteQueue,
      recruitment,
      warRoom,
      founderPipeline,
    },
    executionQueue,
    recommendedActions: [
      signals.recommendedActions[0],
      inviteQueue.actions[0],
      founderPipeline.actions[0],
      warRoom.focusQueue[0]?.action,
      recruitment.campaigns[0]?.cta,
    ].filter((item): item is string => Boolean(item)),
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
