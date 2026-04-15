import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { explainLeadScore, scoreLead } from './funnel';
import type { LeadRecord } from './leads';

export type FounderPipelineStage = 'new' | 'contacting' | 'qualified' | 'invited' | 'archived';
export type FounderPipelineChannel = 'email' | 'discord' | 'testflight' | 'waitlist';

export type FounderPipelineEntry = {
  email: string;
  stage: FounderPipelineStage;
  owner: string;
  channel: FounderPipelineChannel;
  note?: string;
  updatedAt: string;
};

export type FounderPipelineState = {
  updatedAt: string;
  entries: FounderPipelineEntry[];
};

const defaultState: FounderPipelineState = {
  updatedAt: new Date(0).toISOString(),
  entries: [],
};

function getFounderPipelineFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'founder-pipeline.json'),
  };
}

export async function readFounderPipelineState(): Promise<FounderPipelineState> {
  const { filePath } = getFounderPipelineFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as FounderPipelineState;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.filter((entry) => typeof entry?.email === 'string')
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveFounderPipelineEntry(input: {
  email: string;
  stage: FounderPipelineStage;
  owner?: string;
  channel: FounderPipelineChannel;
  note?: string;
}) {
  const { dataDir, filePath } = getFounderPipelineFilePath();
  const state = await readFounderPipelineState();
  const updatedAt = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();

  const nextEntry: FounderPipelineEntry = {
    email: normalizedEmail,
    stage: input.stage,
    owner: input.owner?.trim() || 'Unassigned',
    channel: input.channel,
    note: input.note?.trim() || undefined,
    updatedAt,
  };

  const entries = [
    nextEntry,
    ...state.entries.filter((entry) => entry.email !== normalizedEmail),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const nextState: FounderPipelineState = {
    updatedAt,
    entries,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}

export async function buildFounderPipeline(leads: LeadRecord[]) {
  const state = await readFounderPipelineState();
  const entriesByEmail = new Map(state.entries.map((entry) => [entry.email, entry]));
  const scoredLeads = leads
    .map(scoreLead)
    .sort((a, b) => b.score - a.score || b.ts.localeCompare(a.ts))
    .slice(0, 18)
    .map((lead) => {
      const entry = entriesByEmail.get(lead.email);
      const defaultStage: FounderPipelineStage = lead.invitePriority === 'priority'
        ? 'qualified'
        : lead.invitePriority === 'standard'
          ? 'contacting'
          : 'new';

      return {
        ...lead,
        stage: entry?.stage ?? defaultStage,
        owner: entry?.owner ?? 'Unassigned',
        channel: entry?.channel ?? (lead.platform === 'ios' ? 'testflight' : 'email'),
        note: entry?.note ?? '',
        updatedAt: entry?.updatedAt ?? null,
        reasons: explainLeadScore(lead),
      };
    });

  const summary = {
    totalTracked: scoredLeads.length,
    qualified: scoredLeads.filter((lead) => lead.stage === 'qualified').length,
    contacting: scoredLeads.filter((lead) => lead.stage === 'contacting').length,
    invited: scoredLeads.filter((lead) => lead.stage === 'invited').length,
    archived: scoredLeads.filter((lead) => lead.stage === 'archived').length,
  };

  const stageBoard = [
    { stage: 'new', label: 'New', count: scoredLeads.filter((lead) => lead.stage === 'new').length },
    { stage: 'contacting', label: 'Contacting', count: scoredLeads.filter((lead) => lead.stage === 'contacting').length },
    { stage: 'qualified', label: 'Qualified', count: scoredLeads.filter((lead) => lead.stage === 'qualified').length },
    { stage: 'invited', label: 'Invited', count: scoredLeads.filter((lead) => lead.stage === 'invited').length },
    { stage: 'archived', label: 'Archived', count: scoredLeads.filter((lead) => lead.stage === 'archived').length },
  ] as const;

  const handoffQueue = scoredLeads
    .filter((lead) => lead.stage === 'qualified' || lead.stage === 'contacting')
    .slice(0, 6)
    .map((lead) => ({
      email: lead.email,
      owner: lead.owner,
      stage: lead.stage,
      channel: lead.channel,
      score: lead.score,
      nextMove: lead.stage === 'qualified'
        ? `Move ${lead.email} into invite prep.`
        : `Follow up with ${lead.email} through ${lead.channel}.`,
    }));

  return {
    generatedAt: new Date().toISOString(),
    updatedAt: state.updatedAt,
    summary,
    stageBoard,
    handoffQueue,
    queue: scoredLeads,
    actions: [
      summary.qualified > 0
        ? `${summary.qualified} founder leads are qualified and ready for operator review.`
        : 'No founder leads are marked qualified yet.',
      handoffQueue[0]?.nextMove ?? 'No immediate founder follow-up is queued.',
      summary.invited > 0
        ? `${summary.invited} leads have already moved into invite status.`
        : 'No founder leads are marked invited yet.',
    ],
  };
}
