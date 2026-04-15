import { siteContent } from './content';
import { buildPlaytestSummary, explainLeadScore } from './funnel';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildOperationsSnapshot } from './operations';
import { readRecruitmentBoardState } from './recruitment-board';
import { buildSignalsSnapshot } from './signals';
import { getWaveLabel } from './waves';

type CampaignPriority = 'now' | 'next' | 'watch';

type CampaignRecommendation = {
  slug: string;
  title: string;
  priority: CampaignPriority;
  audience: string;
  message: string;
  cta: string;
  supportSurface: string;
  whyNow: string;
};

type RecruitLead = {
  email: string;
  score: number;
  wave: string;
  reasons: string[];
};

const factionAudienceFallback: Record<string, string> = {
  'dominion-core': 'players who prefer fortified growth and disciplined progression',
  'iron-rebellion': 'aggressive raiders who want fast rebuilds and siege momentum',
  'eclipse-syndicate': 'tacticians who care about intel control and sabotage play',
};

export async function buildRecruitmentSnapshot(leads: LeadRecord[]) {
  const leadSummary = summarizeLeads(leads);
  const playtest = buildPlaytestSummary(leads);
  const operations = await buildOperationsSnapshot(leads);
  const signals = await buildSignalsSnapshot(leads);
  const boardState = await readRecruitmentBoardState();

  const weakestFaction = signals.weakestFaction ?? playtest.factionCoverage[0] ?? null;
  const strongestSource = signals.topSources[0] ?? null;
  const activeEvent = signals.activeEvent;
  const criticalFront = signals.criticalFront;
  const recommendedWave = playtest.recommendedNextWave;
  const recommendedWaveLabel = getWaveLabel(recommendedWave);
  const waveQualified = playtest.byWave[recommendedWave];

  const weakestFactionContent = weakestFaction
    ? siteContent.factions.find((faction) => faction.slug === weakestFaction.slug) ?? null
    : null;

  const campaigns: CampaignRecommendation[] = [
    {
      slug: 'wave-conversion-push',
      title: `Convert ${recommendedWaveLabel}`,
      priority: waveQualified > 0 ? 'now' : 'next',
      audience:
        recommendedWave === 'wave-0-founder'
          ? 'founder-caliber leads ready for early access'
          : 'the highest scoring mobile-ready leads already in the funnel',
      message: waveQualified > 0
        ? `${waveQualified} leads already qualify. Move from passive capture into invite and follow-up mode.`
        : `No leads qualify yet. Keep building toward ${recommendedWaveLabel} before opening invites.`,
      cta: waveQualified > 0 ? 'Prepare invite queue and follow-up copy' : 'Keep driving qualified intake',
      supportSurface: '/cohorts and /playtest',
      whyNow: signals.recommendedActions[0] ?? 'Current cohort readiness is the clearest growth constraint.',
    },
    {
      slug: 'faction-gap-fill',
      title: weakestFactionContent ? `Fill the ${weakestFactionContent.name} gap` : 'Fill the softest faction gap',
      priority: weakestFaction && weakestFaction.leads <= 1 ? 'now' : 'next',
      audience: weakestFactionContent
        ? factionAudienceFallback[weakestFactionContent.slug] ?? weakestFactionContent.summary
        : 'underrepresented faction demand',
      message: weakestFactionContent
        ? `${weakestFactionContent.name} only has ${weakestFaction?.leads ?? 0} tagged leads. Push ${weakestFactionContent.signatureUnits[0]} and ${weakestFactionContent.strengths[0].toLowerCase()} fantasy harder.`
        : 'Faction coverage is uneven enough to justify a targeted acquisition swing.',
      cta: 'Update homepage, faction page, and paid angles around this faction',
      supportSurface: weakestFactionContent ? `/factions/${weakestFactionContent.slug}` : '/factions',
      whyNow: signals.recommendedActions[1] ?? 'Balanced faction demand matters before prototype invite waves open.',
    },
    {
      slug: 'event-hook-campaign',
      title: activeEvent ? `Center messaging on ${activeEvent.name}` : 'Define the next event hook',
      priority: activeEvent ? 'now' : 'watch',
      audience: criticalFront
        ? `${criticalFront.faction} leaning players who react to visible map pressure`
        : 'players who respond to prestige conflict and timed windows',
      message: activeEvent
        ? `${activeEvent.window} gives the funnel a concrete urgency hook. Tie campaign copy to ${criticalFront?.zone ?? 'the current frontline'} and its reward loop.`
        : 'A clear timed event hook will make the pitch sharper across homepage, news, and war-room surfaces.',
      cta: activeEvent ? 'Thread the event into all public-facing copy' : 'Lock the next event narrative',
      supportSurface: '/events, /war-room, and /news',
      whyNow: signals.recommendedActions[2] ?? 'The product story is stronger when the war has a visible center.',
    },
  ];

  const recruitQueue: RecruitLead[] = playtest.shortlist.slice(0, 8).map((lead) => ({
    email: lead.email,
    score: lead.score,
    wave: getWaveLabel(lead.wave),
    reasons: explainLeadScore(lead).slice(0, 4),
  }));

  const boardBySlug = new Map(boardState.campaigns.map((campaign) => [campaign.slug, campaign]));
  const campaignsWithExecution = campaigns.map((campaign) => {
    const operatorState = boardBySlug.get(campaign.slug);

    return {
      ...campaign,
      operatorStatus: operatorState?.status ?? 'todo',
      operatorOwner: operatorState?.owner ?? '',
      operatorNote: operatorState?.note ?? '',
      operatorUpdatedAt: operatorState?.updatedAt ?? null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalLeads: leadSummary.total,
      uniqueLeads: leadSummary.unique,
      strongestSource: strongestSource?.source ?? null,
      strongestSourceCount: strongestSource?.count ?? 0,
      weakestFaction: weakestFaction
        ? {
            slug: weakestFaction.slug,
            name: weakestFaction.name,
            leads: weakestFaction.leads,
          }
        : null,
      recommendedWave: {
        slug: recommendedWave,
        label: recommendedWaveLabel,
        qualifiedLeads: waveQualified,
      },
      hottestFront: operations.activeOperations[0]
        ? {
            slug: operations.activeOperations[0].slug,
            zone: operations.activeOperations[0].zone,
            priority: operations.activeOperations[0].priority,
          }
        : null,
    },
    campaigns: campaignsWithExecution,
    recruitQueue,
    board: {
      updatedAt: boardState.updatedAt,
      summary: {
        todo: campaignsWithExecution.filter((campaign) => campaign.operatorStatus === 'todo').length,
        active: campaignsWithExecution.filter((campaign) => campaign.operatorStatus === 'active').length,
        blocked: campaignsWithExecution.filter((campaign) => campaign.operatorStatus === 'blocked').length,
        done: campaignsWithExecution.filter((campaign) => campaign.operatorStatus === 'done').length,
      },
    },
  };
}
