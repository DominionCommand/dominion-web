import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type CampaignExecutionStatus = 'planned' | 'ready' | 'live' | 'blocked' | 'complete';
export type CampaignExecutionChannel = 'liveops' | 'community' | 'paid' | 'crm' | 'qa';

export type CampaignExecutionEntry = {
  slug: string;
  status: CampaignExecutionStatus;
  owner: string;
  channel: CampaignExecutionChannel;
  note?: string;
  updatedAt: string;
};

export type CampaignExecutionState = {
  updatedAt: string;
  entries: CampaignExecutionEntry[];
};

const defaultState: CampaignExecutionState = {
  updatedAt: new Date(0).toISOString(),
  entries: [],
};

function getCampaignOpsFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'campaign-ops.json'),
  };
}

export async function readCampaignExecutionState(): Promise<CampaignExecutionState> {
  const { filePath } = getCampaignOpsFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CampaignExecutionState>;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.filter((entry): entry is CampaignExecutionEntry => Boolean(entry && typeof entry.slug === 'string' && typeof entry.status === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveCampaignExecutionEntry(input: {
  slug: string;
  status: CampaignExecutionStatus;
  owner?: string;
  channel: CampaignExecutionChannel;
  note?: string;
}) {
  const { dataDir, filePath } = getCampaignOpsFilePath();
  const state = await readCampaignExecutionState();
  const updatedAt = new Date().toISOString();
  const normalizedSlug = input.slug.trim();

  const nextEntry: CampaignExecutionEntry = {
    slug: normalizedSlug,
    status: input.status,
    owner: input.owner?.trim() || 'Unassigned',
    channel: input.channel,
    note: input.note?.trim() || undefined,
    updatedAt,
  };

  const entries = [
    nextEntry,
    ...state.entries.filter((entry) => entry.slug !== normalizedSlug),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const nextState: CampaignExecutionState = {
    updatedAt,
    entries,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}
