import { getCommanderBySlug, getFactionBySlug, getWorldZoneBySlug, siteContent } from './content';
import { readCampaignExecutionState } from './campaign-ops';
import { buildPlaytestSummary } from './funnel';
import type { LeadRecord } from './leads';

export type CampaignBrief = {
  slug: string;
  name: string;
  status: 'active' | 'queued' | 'planned';
  executionStatus: 'planned' | 'ready' | 'live' | 'blocked' | 'complete';
  executionOwner: string;
  executionChannel: 'liveops' | 'community' | 'paid' | 'crm' | 'qa';
  executionNote: string;
  executionUpdatedAt: string | null;
  cadence: string;
  window: string;
  summary: string;
  objective: string;
  reward: string;
  zone: {
    slug: string;
    name: string;
    control: string;
    pressure: string;
    strategicValue: string;
  } | null;
  commander: {
    slug: string;
    name: string;
    role: string;
    faction: string;
    specialty: string;
  } | null;
  factionDemand: {
    slug: string;
    name: string;
    leads: number;
    coverageState: 'strong' | 'building' | 'thin';
  } | null;
  playtestFit: {
    recommendedWave: string;
    qualifiedLeads: number;
    iosReady: number;
    tacticians: number;
  };
  actionLine: string;
};

const factionFromControl: Record<string, string> = {
  dominion: 'dominion-core',
  rebellion: 'iron-rebellion',
  syndicate: 'eclipse-syndicate',
  contested: 'dominion-core',
  neutral: 'dominion-core',
};

function getCoverageState(leads: number): 'strong' | 'building' | 'thin' {
  if (leads >= 4) return 'strong';
  if (leads >= 2) return 'building';
  return 'thin';
}

export async function buildCampaignBriefs(leads: LeadRecord[]) {
  const playtest = buildPlaytestSummary(leads);
  const factionCoverage = new Map(playtest.factionCoverage.map((entry) => [entry.slug, entry]));
  const state = await readCampaignExecutionState();
  const entriesBySlug = new Map(state.entries.map((entry) => [entry.slug, entry]));

  const campaigns: CampaignBrief[] = siteContent.events.map((event) => {
    const zone = event.linkedZoneSlug ? getWorldZoneBySlug(event.linkedZoneSlug) ?? null : null;
    const commander = event.featuredCommanderSlug ? getCommanderBySlug(event.featuredCommanderSlug) ?? null : null;
    const factionSlug = commander?.factionSlug ?? (zone ? factionFromControl[zone.control] : undefined);
    const faction = factionSlug ? getFactionBySlug(factionSlug) ?? null : null;
    const coverage = factionSlug ? factionCoverage.get(factionSlug) ?? null : null;
    const qualifiedLeads = playtest.byWave[playtest.recommendedNextWave];
    const entry = entriesBySlug.get(event.slug);

    return {
      slug: event.slug,
      name: event.name,
      status: event.status,
      executionStatus: entry?.status ?? (event.status === 'active' ? 'live' : event.status === 'queued' ? 'ready' : 'planned'),
      executionOwner: entry?.owner ?? 'Unassigned',
      executionChannel: entry?.channel ?? 'liveops',
      executionNote: entry?.note ?? '',
      executionUpdatedAt: entry?.updatedAt ?? null,
      cadence: event.cadence,
      window: event.window,
      summary: event.summary,
      objective: event.objective,
      reward: event.reward,
      zone: zone
        ? {
            slug: zone.slug,
            name: zone.name,
            control: zone.control,
            pressure: zone.pressure,
            strategicValue: zone.strategicValue,
          }
        : null,
      commander: commander
        ? {
            slug: commander.slug,
            name: commander.name,
            role: commander.role,
            faction: commander.faction,
            specialty: commander.specialty,
          }
        : null,
      factionDemand: faction && coverage
        ? {
            slug: faction.slug,
            name: faction.name,
            leads: coverage.leads,
            coverageState: getCoverageState(coverage.leads),
          }
        : null,
      playtestFit: {
        recommendedWave: playtest.recommendedNextWave,
        qualifiedLeads,
        iosReady: playtest.totals.iosReady,
        tacticians: playtest.totals.tacticians,
      },
      actionLine: zone && commander
        ? `Use ${commander.name} to anchor ${zone.name}, then convert ${qualifiedLeads} ${playtest.recommendedNextWave} leads into a live campaign test cohort.`
        : `Advance ${event.name} into a testable campaign surface and connect it to the current ${playtest.recommendedNextWave} cohort.`,
    };
  });

  const summary = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === 'active').length,
    liveCampaigns: campaigns.filter((campaign) => campaign.executionStatus === 'live').length,
    blockedCampaigns: campaigns.filter((campaign) => campaign.executionStatus === 'blocked').length,
    highPressureCampaigns: campaigns.filter((campaign) => campaign.zone?.pressure === 'high').length,
    factionCoverageGaps: campaigns.filter((campaign) => campaign.factionDemand?.coverageState === 'thin').map((campaign) => campaign.name),
    recommendedWave: playtest.recommendedNextWave,
    qualifiedLeads: playtest.byWave[playtest.recommendedNextWave],
  };

  return {
    generatedAt: new Date().toISOString(),
    summary,
    campaigns,
  };
}
