import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type RecruitmentCampaignStatus = 'todo' | 'active' | 'blocked' | 'done';

export type RecruitmentCampaignState = {
  slug: string;
  status: RecruitmentCampaignStatus;
  owner?: string;
  note?: string;
  updatedAt: string;
};

export type RecruitmentBoardState = {
  updatedAt: string;
  campaigns: RecruitmentCampaignState[];
};

const defaultState: RecruitmentBoardState = {
  updatedAt: new Date(0).toISOString(),
  campaigns: [],
};

function getRecruitmentBoardFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'recruitment-board.json'),
  };
}

export async function readRecruitmentBoardState(): Promise<RecruitmentBoardState> {
  const { filePath } = getRecruitmentBoardFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<RecruitmentBoardState>;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      campaigns: Array.isArray(parsed.campaigns)
        ? parsed.campaigns.filter(
            (entry): entry is RecruitmentCampaignState => Boolean(entry && typeof entry.slug === 'string' && typeof entry.status === 'string'),
          )
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveRecruitmentCampaignState(input: {
  slug: string;
  status: RecruitmentCampaignStatus;
  owner?: string;
  note?: string;
}) {
  const { dataDir, filePath } = getRecruitmentBoardFilePath();
  const current = await readRecruitmentBoardState();
  const updatedAt = new Date().toISOString();

  const nextCampaign: RecruitmentCampaignState = {
    slug: input.slug,
    status: input.status,
    owner: input.owner?.trim() || undefined,
    note: input.note?.trim() || undefined,
    updatedAt,
  };

  const nextState: RecruitmentBoardState = {
    updatedAt,
    campaigns: [
      nextCampaign,
      ...current.campaigns.filter((entry) => entry.slug !== input.slug),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}
