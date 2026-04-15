import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { siteContent } from './content';
import type { LeadRecord } from './leads';
import { buildOperationsSnapshot } from './operations';

export type AllianceHQStatus = 'forming' | 'mobilizing' | 'war-ready';
export type AlliancePriority = 'recruitment' | 'frontline' | 'logistics';
export type AllianceCampaignStatus = 'planned' | 'active' | 'blocked' | 'done';

export type AllianceHQNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type AllianceHQCampaignOverride = {
  slug: string;
  status: AllianceCampaignStatus;
  owner: string;
  note?: string;
  updatedAt: string;
};

export type AllianceHQState = {
  status: AllianceHQStatus;
  owner: string;
  priority: AlliancePriority;
  updatedAt: string;
  notes: AllianceHQNote[];
  campaignOverrides: AllianceHQCampaignOverride[];
};

export type AllianceHQCampaign = {
  slug: string;
  title: string;
  lane: string;
  owner: string;
  detail: string;
  target: string;
  surface: string;
  status: AllianceCampaignStatus;
  operatorNote: string;
  updatedAt?: string;
};

export type AllianceHQSnapshot = {
  generatedAt: string;
  state: AllianceHQState;
  summary: {
    activeCampaigns: number;
    blockedCampaigns: number;
    warReadySystems: number;
    topRole: string;
  };
  readiness: Awaited<ReturnType<typeof buildOperationsSnapshot>>['allianceReadiness'];
  fronts: Awaited<ReturnType<typeof buildOperationsSnapshot>>['activeOperations'];
  campaigns: AllianceHQCampaign[];
  notes: AllianceHQNote[];
  headline: string;
};

const defaultState: AllianceHQState = {
  status: 'forming',
  owner: 'Alliance command',
  priority: 'recruitment',
  updatedAt: new Date(0).toISOString(),
  notes: [],
  campaignOverrides: [],
};

function getAllianceHQFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'alliance-hq.json'),
  };
}

export async function readAllianceHQState(): Promise<AllianceHQState> {
  const { filePath } = getAllianceHQFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AllianceHQState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is AllianceHQNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
      campaignOverrides: Array.isArray(parsed.campaignOverrides)
        ? parsed.campaignOverrides.filter((item): item is AllianceHQCampaignOverride => Boolean(item && typeof item.slug === 'string' && typeof item.status === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveAllianceHQState(state: AllianceHQState) {
  const { dataDir, filePath } = getAllianceHQFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

function normalizeCampaignStatus(status: string): AllianceCampaignStatus {
  if (status === 'active') return 'active';
  if (status === 'blocked') return 'blocked';
  if (status === 'done') return 'done';
  return 'planned';
}

export async function buildAllianceHQSnapshot(leads: LeadRecord[]): Promise<AllianceHQSnapshot> {
  const [operations, state] = await Promise.all([
    buildOperationsSnapshot(leads),
    readAllianceHQState(),
  ]);

  const allianceRoleCounts = {
    'shot-caller': operations.playtest.totals.allianceRoleCoverage.shotCallers,
    logistics: operations.playtest.totals.allianceRoleCoverage.logistics,
    scout: operations.playtest.totals.allianceRoleCoverage.scouts,
  };
  const topRole = Object.entries(allianceRoleCounts).sort((a, b) => b[1] - a[1])[0] ?? null;
  const mostPressuredFront = operations.activeOperations[0] ?? null;
  const campaignOverrides = new Map(state.campaignOverrides.map((item) => [item.slug, item]));

  const campaigns: AllianceHQCampaign[] = [
    {
      slug: 'alliance-intake',
      title: 'Alliance intake sprint',
      lane: 'Recruitment',
      owner: 'Growth ops',
      detail: `Build a better mix of shot callers, logistics, and scouts around ${operations.playtest.recommendedNextWave}.`,
      target: topRole ? `Current strongest role is ${topRole[0]} with ${topRole[1]} tagged leads.` : 'Alliance role demand still needs a baseline.',
      surface: '/playtest',
      status: (operations.playtest.totals.leads >= 12 ? 'active' : 'planned') as AllianceCampaignStatus,
      operatorNote: '',
    },
    {
      slug: 'frontline-rally-plan',
      title: 'Frontline rally plan',
      lane: 'Frontline',
      owner: mostPressuredFront?.recommendedCommander ?? 'War room',
      detail: mostPressuredFront
        ? `${mostPressuredFront.zone} is the best current alliance pressure lane.`
        : 'Choose the first pressure lane for alliance objective testing.',
      target: mostPressuredFront
        ? `Target ${mostPressuredFront.priority} pressure and ${mostPressuredFront.reward.toLowerCase()}.`
        : 'No frontline selected yet.',
      surface: '/war-room',
      status: (mostPressuredFront?.priority === 'critical' ? 'active' : 'planned') as AllianceCampaignStatus,
      operatorNote: '',
    },
    {
      slug: 'convoy-logistics',
      title: 'Shared logistics convoy',
      lane: 'Logistics',
      owner: 'Alliance systems',
      detail: 'Turn the shared-logistics feature into a visible prototype support loop with convoy boosts and rebuild support.',
      target: `${siteContent.allianceFeatures.find((feature) => feature.slug === 'shared-logistics')?.title ?? 'Shared Logistics'} is the current logistics anchor.`,
      surface: '/prototype',
      status: (operations.allianceReadiness.some((item) => item.slug === 'shared-logistics' && item.readiness !== 'forming') ? 'active' : 'planned') as AllianceCampaignStatus,
      operatorNote: '',
    },
  ].map((campaign) => {
    const override = campaignOverrides.get(campaign.slug);
    return override
      ? {
          ...campaign,
          status: normalizeCampaignStatus(override.status),
          owner: override.owner || campaign.owner,
          operatorNote: override.note ?? campaign.operatorNote,
          updatedAt: override.updatedAt,
        }
      : campaign;
  });

  const summary = {
    activeCampaigns: campaigns.filter((campaign) => campaign.status === 'active').length,
    blockedCampaigns: campaigns.filter((campaign) => campaign.status === 'blocked').length,
    warReadySystems: operations.allianceReadiness.filter((item) => item.readiness === 'surging').length,
    topRole: topRole ? `${topRole[0]} (${topRole[1]})` : 'No alliance-role signal yet',
  };

  return {
    generatedAt: new Date().toISOString(),
    state,
    summary,
    readiness: operations.allianceReadiness,
    fronts: operations.activeOperations.slice(0, 3),
    campaigns,
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
    headline: mostPressuredFront
      ? `${mostPressuredFront.zone} is the best alliance proving ground and ${operations.playtest.recommendedNextWave} is the current intake target.`
      : 'Alliance HQ is ready to orchestrate intake, frontline pressure, and logistics.',
  };
}
