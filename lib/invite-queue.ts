import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildPlaytestSummary, explainLeadScore, scoreLead } from './funnel';
import type { LeadRecord } from './leads';
import { getWaveLabel, waveLabels } from './waves';

export type InviteDecisionStatus = 'selected' | 'queued' | 'sent' | 'hold';

export type InviteDecision = {
  email: string;
  status: InviteDecisionStatus;
  wave: keyof typeof waveLabels;
  note?: string;
  updatedAt: string;
};

export type InviteQueueState = {
  updatedAt: string;
  decisions: InviteDecision[];
};

const defaultState: InviteQueueState = {
  updatedAt: new Date(0).toISOString(),
  decisions: [],
};

function getInviteQueueFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'invite-queue.json'),
  };
}

export async function readInviteQueueState(): Promise<InviteQueueState> {
  const { filePath } = getInviteQueueFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as InviteQueueState;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      decisions: Array.isArray(parsed.decisions)
        ? parsed.decisions.filter((entry) => typeof entry?.email === 'string')
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveInviteQueueDecision(input: {
  email: string;
  status: InviteDecisionStatus;
  wave: keyof typeof waveLabels;
  note?: string;
}) {
  const { dataDir, filePath } = getInviteQueueFilePath();
  const state = await readInviteQueueState();
  const updatedAt = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();

  const nextDecision: InviteDecision = {
    email: normalizedEmail,
    status: input.status,
    wave: input.wave,
    note: input.note?.trim() || undefined,
    updatedAt,
  };

  const decisions = [
    nextDecision,
    ...state.decisions.filter((entry) => entry.email !== normalizedEmail),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const nextState: InviteQueueState = {
    updatedAt,
    decisions,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}

export async function buildInviteQueue(leads: LeadRecord[]) {
  const state = await readInviteQueueState();
  const playtest = buildPlaytestSummary(leads);
  const decisionsByEmail = new Map(state.decisions.map((entry) => [entry.email, entry]));

  const recommendedWave = playtest.recommendedNextWave;
  const shortlisted = playtest.shortlist.map((lead) => {
    const decision = decisionsByEmail.get(lead.email);
    const scoredLead = scoreLead(lead);

    return {
      ...scoredLead,
      decisionStatus: decision?.status ?? (scoredLead.wave === recommendedWave ? 'selected' : 'queued'),
      decisionWave: decision?.wave ?? scoredLead.wave,
      decisionNote: decision?.note ?? '',
      decisionUpdatedAt: decision?.updatedAt ?? null,
      scoreReasons: explainLeadScore(lead),
    };
  });

  const groupedQueue = Object.keys(waveLabels).map((waveKey) => {
    const wave = waveKey as keyof typeof waveLabels;
    const leadsForWave = shortlisted.filter((lead) => lead.decisionWave === wave || (!decisionsByEmail.has(lead.email) && lead.wave === wave));

    return {
      wave,
      label: getWaveLabel(wave),
      total: leadsForWave.length,
      selected: leadsForWave.filter((lead) => lead.decisionStatus === 'selected').length,
      sent: leadsForWave.filter((lead) => lead.decisionStatus === 'sent').length,
      queued: leadsForWave.filter((lead) => lead.decisionStatus === 'queued').length,
      hold: leadsForWave.filter((lead) => lead.decisionStatus === 'hold').length,
    };
  });

  const recentDecisions = state.decisions.slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    updatedAt: state.updatedAt,
    recommendedWave: {
      slug: recommendedWave,
      label: getWaveLabel(recommendedWave),
      qualifiedLeads: playtest.byWave[recommendedWave],
    },
    summary: {
      totalQualified: playtest.shortlist.length,
      selectedNow: shortlisted.filter((lead) => lead.decisionStatus === 'selected').length,
      invitesSent: shortlisted.filter((lead) => lead.decisionStatus === 'sent').length,
      onHold: shortlisted.filter((lead) => lead.decisionStatus === 'hold').length,
    },
    groupedQueue,
    queue: shortlisted,
    recentDecisions,
    actions: [
      groupedQueue.find((entry) => entry.wave === recommendedWave)?.selected
        ? `Recommended wave is ${getWaveLabel(recommendedWave)} and already has operators actively selecting candidates.`
        : `Start selecting candidates for ${getWaveLabel(recommendedWave)} now.`,
      shortlisted.some((lead) => lead.decisionStatus === 'hold')
        ? 'Review hold notes before the next invite push so strong leads do not stall in the queue.'
        : 'No held leads are blocking the immediate invite queue.',
      shortlisted.some((lead) => lead.decisionStatus === 'sent')
        ? 'Follow up with sent invites and track acceptance before expanding the next wave.'
        : 'No invites are marked sent yet, so the queue is still in staging mode.',
    ],
  };
}
