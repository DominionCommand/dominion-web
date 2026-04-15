import { buildFounderPipeline } from './founder-pipeline';
import { buildPlaytestSummary } from './funnel';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildOperationsSnapshot } from './operations';
import { buildPrototypeSnapshot } from './prototype';
import { buildWarRoomBriefing } from './war-room';
import { getWaveLabel } from './waves';

export async function buildDashboardSnapshot(leads: LeadRecord[]) {
  const leadSummary = summarizeLeads(leads);
  const playtest = buildPlaytestSummary(leads);
  const operations = await buildOperationsSnapshot(leads);
  const prototype = await buildPrototypeSnapshot(leads);
  const warRoom = await buildWarRoomBriefing(leads);
  const founderPipeline = await buildFounderPipeline(leads);

  const weakestFaction = playtest.factionCoverage
    .slice()
    .sort((a, b) => a.leads - b.leads || a.name.localeCompare(b.name))[0] ?? null;

  const hottestFront = operations.activeOperations[0] ?? null;
  const recommendedWave = playtest.recommendedNextWave;
  const recommendedWaveCount = playtest.byWave[recommendedWave];
  const topPriorityLeads = playtest.shortlist.slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),
    leadSummary,
    playtest,
    operations,
    prototype,
    warRoom,
    founderPipeline,
    summary: {
      hottestFront: hottestFront
        ? {
            slug: hottestFront.slug,
            zone: hottestFront.zone,
            priority: hottestFront.priority,
            commander: hottestFront.recommendedCommander,
            faction: hottestFront.faction,
          }
        : null,
      weakestFaction: weakestFaction
        ? {
            slug: weakestFaction.slug,
            name: weakestFaction.name,
            leads: weakestFaction.leads,
          }
        : null,
      recommendedWave: {
        slug: recommendedWave,
        label: getWaveLabel(recommendedWave),
        qualifiedLeads: recommendedWaveCount,
      },
      founderQueue: topPriorityLeads,
      blockers: [
        weakestFaction
          ? `${weakestFaction.name} only has ${weakestFaction.leads} tagged leads in the funnel.`
          : 'Faction coverage still needs a clean baseline.',
        recommendedWaveCount > 0
          ? `${recommendedWaveCount} leads are ready for ${getWaveLabel(recommendedWave)} invites.`
          : `No leads currently qualify for ${getWaveLabel(recommendedWave)}.`,
        prototype.readiness.factionCoverageComplete
          ? 'Faction coverage is complete enough for balanced prototype sessions.'
          : 'Prototype cohort balance is still uneven across factions.',
        founderPipeline.summary.qualified > 0
          ? `${founderPipeline.summary.qualified} founder leads are marked qualified for direct follow-up.`
          : 'No founder leads are marked qualified yet.',
      ],
    },
  };
}
