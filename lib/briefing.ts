import type { LeadRecord } from './leads';
import { buildControlTowerSnapshot } from './control-tower';
import { buildDashboardSnapshot } from './dashboard';
import { buildSeasonControlSnapshot } from './season-control';

export async function buildDailyBriefing(leads: LeadRecord[]) {
  const [dashboard, seasonControl, controlTower] = await Promise.all([
    buildDashboardSnapshot(leads),
    buildSeasonControlSnapshot(leads),
    buildControlTowerSnapshot(leads),
  ]);

  const hottestFront = dashboard.summary.hottestFront;
  const weakestFaction = dashboard.summary.weakestFaction;
  const recommendedWave = dashboard.summary.recommendedWave;
  const activeEvent = seasonControl.featuredEvent;
  const featuredZone = seasonControl.featuredZone;

  const topCalls = [
    hottestFront
      ? `Build the next playable combat objective around ${hottestFront.commander} in ${hottestFront.zone}.`
      : null,
    recommendedWave.qualifiedLeads > 0
      ? `Stage ${recommendedWave.qualifiedLeads} ${recommendedWave.label} leads for manual invite flow.`
      : `Keep filling ${recommendedWave.label} until at least one lead qualifies.`,
    weakestFaction
      ? `Push ${weakestFaction.name} harder across public surfaces, it only has ${weakestFaction.leads} tagged leads.`
      : null,
  ].filter((item): item is string => Boolean(item));

  return {
    generatedAt: new Date().toISOString(),
    headline: hottestFront && activeEvent
      ? `${activeEvent.name} and ${hottestFront.zone} are the clearest live product story right now.`
      : 'Dominion Nexus now has a cross-surface operator briefing.',
    summary: {
      recommendedWave,
      hottestFront,
      weakestFaction,
      activeEvent: activeEvent
        ? {
            slug: activeEvent.slug,
            name: activeEvent.name,
            window: activeEvent.window,
            status: activeEvent.status,
          }
        : null,
      featuredZone: featuredZone
        ? {
            slug: featuredZone.slug,
            name: 'zone' in featuredZone ? featuredZone.zone : featuredZone.name,
            objective: featuredZone.objective,
          }
        : null,
      towerStatus: controlTower.state.status,
      focusLane: controlTower.state.focusLane,
    },
    topCalls,
    queue: controlTower.executionQueue.slice(0, 8),
    blockers: controlTower.blockers,
    recentFounderLeads: dashboard.founderPipeline.handoffQueue.slice(0, 5),
    recentNotes: {
      seasonControl: seasonControl.notes.slice(0, 4),
      controlTower: controlTower.notes.slice(0, 4),
    },
  };
}
