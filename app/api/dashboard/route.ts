import { siteContent } from '../../../lib/content';
import { buildDashboardSnapshot } from '../../../lib/dashboard';
import { buildIntelWatchSnapshot } from '../../../lib/intel-watch';
import { readLeads } from '../../../lib/leads';
import { buildRecruitmentSnapshot } from '../../../lib/recruitment';
import { buildSeasonControlSnapshot } from '../../../lib/season-control';

export async function GET() {
  const leads = await readLeads();
  const dashboard = await buildDashboardSnapshot(leads);
  const recruitment = await buildRecruitmentSnapshot(leads);
  const seasonControl = await buildSeasonControlSnapshot(leads);
  const intelWatch = await buildIntelWatchSnapshot(leads);

  return Response.json({
    ok: true,
    heroTitle: siteContent.hero.title,
    factionCount: siteContent.factions.length,
    commanderCount: siteContent.commanders.length,
    allianceFeatureCount: siteContent.allianceFeatures.length,
    worldZoneCount: siteContent.worldZones.length,
    seasonBeatCount: siteContent.seasonBeats.length,
    newsCount: siteContent.news.length,
    mediaCount: siteContent.media.length,
    roadmapActive: siteContent.roadmap.find((item) => item.status === 'active') || null,
    leads: dashboard.leadSummary,
    operations: {
      generatedAt: dashboard.operations.generatedAt,
      summary: dashboard.operations.summary,
      activeOperations: dashboard.operations.activeOperations,
      allianceReadiness: dashboard.operations.allianceReadiness,
      prototypeMissions: dashboard.operations.prototypeMissions,
    },
    prototype: {
      generatedAt: dashboard.prototype.generatedAt,
      headline: dashboard.prototype.headline,
      coreLoop: dashboard.prototype.coreLoop,
      commanderLoadout: dashboard.prototype.commanderLoadout,
      prototypeScenarios: dashboard.prototype.prototypeScenarios,
      readiness: dashboard.prototype.readiness,
    },
    warRoom: {
      generatedAt: dashboard.warRoom.generatedAt,
      headline: dashboard.warRoom.headline,
      statusLine: dashboard.warRoom.statusLine,
      nextWave: dashboard.warRoom.nextWave,
      criticalFronts: dashboard.warRoom.criticalFronts,
      focusQueue: dashboard.warRoom.focusQueue,
    },
    summary: dashboard.summary,
    playtest: {
      recommendedWave: dashboard.playtest.recommendedNextWave,
      byWave: dashboard.playtest.byWave,
      shortlist: dashboard.playtest.shortlist,
      latest: dashboard.playtest.latest,
    },
    recruitment: {
      generatedAt: recruitment.generatedAt,
      summary: recruitment.summary,
      campaigns: recruitment.campaigns,
      recruitQueue: recruitment.recruitQueue,
    },
    seasonControl: {
      generatedAt: seasonControl.generatedAt,
      state: seasonControl.state,
      headline: seasonControl.headline,
      activeBeat: seasonControl.activeBeat,
      featuredEvent: seasonControl.featuredEvent,
      featuredZone: seasonControl.featuredZone,
      linkedEvent: seasonControl.linkedEvent,
      recommendedZone: seasonControl.recommendedZone,
      beatProgress: seasonControl.beatProgress,
      pressureSummary: seasonControl.pressureSummary,
      recommendedActions: seasonControl.recommendedActions,
      notes: seasonControl.notes,
    },
    intelWatch: {
      generatedAt: intelWatch.generatedAt,
      state: intelWatch.state,
      headline: intelWatch.headline,
      summary: intelWatch.summary,
      watchlist: intelWatch.watchlist,
      blockers: intelWatch.blockers,
      recommendedActions: intelWatch.recommendedActions,
      notes: intelWatch.notes,
    },
    founderPipeline: {
      generatedAt: dashboard.founderPipeline.generatedAt,
      updatedAt: dashboard.founderPipeline.updatedAt,
      summary: dashboard.founderPipeline.summary,
      stageBoard: dashboard.founderPipeline.stageBoard,
      handoffQueue: dashboard.founderPipeline.handoffQueue,
      actions: dashboard.founderPipeline.actions,
    },
  });
}
