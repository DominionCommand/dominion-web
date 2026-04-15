import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { buildCampaignBriefs } from './campaigns';
import { getEventBySlug } from './content';
import type { LeadRecord } from './leads';

export type CampaignChecklistStatus = 'todo' | 'in-progress' | 'done';

export type CampaignChecklistItem = {
  key: string;
  label: string;
  team: 'product' | 'liveops' | 'growth' | 'community' | 'qa';
  status: CampaignChecklistStatus;
  owner: string;
  note?: string;
  updatedAt: string;
};

export type CampaignPacketState = {
  updatedAt: string;
  entries: Array<{
    slug: string;
    checklist: CampaignChecklistItem[];
  }>;
};

export type CampaignPacket = {
  generatedAt: string;
  campaign: Awaited<ReturnType<typeof buildCampaignBriefs>>['campaigns'][number];
  readiness: {
    score: number;
    done: number;
    total: number;
    blocked: boolean;
    headline: string;
  };
  checklist: CampaignChecklistItem[];
};

const defaultState: CampaignPacketState = {
  updatedAt: new Date(0).toISOString(),
  entries: [],
};

const baseChecklistTemplate: Omit<CampaignChecklistItem, 'status' | 'owner' | 'note' | 'updatedAt'>[] = [
  { key: 'brief', label: 'Finalize campaign brief and success metric', team: 'product' },
  { key: 'liveops', label: 'Configure event timing, rewards, and ops guardrails', team: 'liveops' },
  { key: 'growth', label: 'Align CRM, paid, or founder comms hook', team: 'growth' },
  { key: 'community', label: 'Prepare social and alliance-facing callout', team: 'community' },
  { key: 'qa', label: 'Run QA pass on linked frontline and reward payloads', team: 'qa' },
];

function getCampaignPacketsFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'campaign-packets.json'),
  };
}

function buildDefaultChecklist() {
  const updatedAt = new Date(0).toISOString();
  return baseChecklistTemplate.map((item) => ({
    ...item,
    status: 'todo' as CampaignChecklistStatus,
    owner: 'Unassigned',
    note: undefined,
    updatedAt,
  }));
}

export async function readCampaignPacketState(): Promise<CampaignPacketState> {
  const { filePath } = getCampaignPacketsFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CampaignPacketState>;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      entries: Array.isArray(parsed.entries)
        ? parsed.entries
            .filter((entry) => entry && typeof entry.slug === 'string')
            .map((entry) => ({
              slug: entry.slug,
              checklist: Array.isArray(entry.checklist)
                ? entry.checklist.filter((item): item is CampaignChecklistItem => Boolean(item && typeof item.key === 'string' && typeof item.label === 'string' && typeof item.team === 'string' && typeof item.status === 'string'))
                : [],
            }))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveCampaignPacketChecklist(input: { slug: string; checklist: CampaignChecklistItem[] }) {
  const { dataDir, filePath } = getCampaignPacketsFilePath();
  const state = await readCampaignPacketState();
  const normalizedSlug = input.slug.trim();
  const updatedAt = new Date().toISOString();

  const entry = {
    slug: normalizedSlug,
    checklist: input.checklist.map((item) => ({
      key: item.key,
      label: item.label,
      team: item.team,
      status: item.status,
      owner: item.owner?.trim() || 'Unassigned',
      note: item.note?.trim() || undefined,
      updatedAt,
    })),
  };

  const nextState: CampaignPacketState = {
    updatedAt,
    entries: [entry, ...state.entries.filter((current) => current.slug !== normalizedSlug)],
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}

function mergeChecklist(saved?: CampaignChecklistItem[]) {
  const defaults = buildDefaultChecklist();
  const savedByKey = new Map((saved || []).map((item) => [item.key, item]));

  return defaults.map((item) => {
    const persisted = savedByKey.get(item.key);
    return persisted
      ? {
          ...item,
          ...persisted,
          updatedAt: persisted.updatedAt || item.updatedAt,
        }
      : item;
  });
}

export async function buildCampaignPacket(slug: string, leads: LeadRecord[]): Promise<CampaignPacket | null> {
  const event = getEventBySlug(slug);
  if (!event) return null;

  const campaignsSnapshot = await buildCampaignBriefs(leads);
  const campaign = campaignsSnapshot.campaigns.find((entry) => entry.slug === slug);
  if (!campaign) return null;

  const state = await readCampaignPacketState();
  const saved = state.entries.find((entry) => entry.slug === slug);
  const checklist = mergeChecklist(saved?.checklist);
  const done = checklist.filter((item) => item.status === 'done').length;
  const blocked = campaign.executionStatus === 'blocked' || checklist.some((item) => item.status === 'todo' && item.team === 'qa');
  const total = checklist.length;
  const score = Math.round((done / total) * 100);

  return {
    generatedAt: new Date().toISOString(),
    campaign,
    readiness: {
      score,
      done,
      total,
      blocked,
      headline: blocked
        ? 'This campaign still has launch risk to clear.'
        : score >= 80
          ? 'This campaign is close to launch-ready.'
          : 'This campaign needs more execution before it can go live cleanly.',
    },
    checklist,
  };
}
