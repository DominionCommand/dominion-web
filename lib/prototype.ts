import { siteContent } from './content';
import { buildPlaytestSummary } from './funnel';
import type { LeadRecord } from './leads';
import { buildOperationsSnapshot } from './operations';

export type CoreLoopStage = {
  slug: string;
  title: string;
  summary: string;
  supportingSystem: string;
  kpi: string;
};

export type CommanderSlot = {
  slot: string;
  commander: string;
  faction: string;
  role: string;
  whyNow: string;
};

export type PrototypeScenario = {
  slug: string;
  title: string;
  phase: string;
  objective: string;
  successMetric: string;
  recommendedFaction: string;
  recommendedCommander: string;
};

export async function buildPrototypeSnapshot(leads: LeadRecord[]) {
  const operations = await buildOperationsSnapshot(leads);
  const playtest = buildPlaytestSummary(leads);
  const contested = operations.activeOperations.find((operation) => operation.priority === 'critical') ?? operations.activeOperations[0];

  const coreLoop: CoreLoopStage[] = [
    {
      slug: 'claim-footing',
      title: 'Claim a foothold',
      summary: 'Establish a base, secure your first resource lane, and lock in a faction identity quickly.',
      supportingSystem: 'Faction onboarding + base growth',
      kpi: 'Day-1 command post completion',
    },
    {
      slug: 'shape-roster',
      title: 'Shape your commander roster',
      summary: 'Choose a battlefield role and turn commander fantasy into a readable power spike.',
      supportingSystem: 'Commander progression + squad composition',
      kpi: 'First specialty upgrade equipped',
    },
    {
      slug: 'join-pressure',
      title: 'Join alliance pressure',
      summary: 'Coordinate rallies, feed logistics, and convert social coordination into map control.',
      supportingSystem: 'Alliance ops + shared logistics',
      kpi: 'First alliance objective contribution',
    },
    {
      slug: 'contest-prestige',
      title: 'Contest prestige objectives',
      summary: 'Push into season-defining zones and make the war map matter to retention.',
      supportingSystem: 'World control + seasonal scoring',
      kpi: 'Prestige zone participation rate',
    },
  ];

  const commanderLoadout: CommanderSlot[] = siteContent.commanders.map((commander, index) => ({
    slot: `Slot ${index + 1}`,
    commander: commander.name,
    faction: commander.faction,
    role: commander.role,
    whyNow:
      index === 0
        ? 'Best fit for defended expansion and holding early territory.'
        : index === 1
          ? 'Best fit for converting successful pushes into momentum.'
          : 'Best fit for intel denial and precision timing plays.',
  }));

  const prototypeScenarios: PrototypeScenario[] = operations.prototypeMissions.map((mission, index) => ({
    slug: mission.slug,
    title: mission.title,
    phase: mission.phase,
    objective: mission.objective,
    successMetric:
      index === 0
        ? 'Alliance rally completion and zone ownership swings'
        : index === 1
          ? 'Commander role comprehension and repeat usage'
          : 'Invite acceptance and day-3 retention by cohort',
    recommendedFaction:
      index === 0
        ? contested?.faction ?? siteContent.commanders[0].faction
        : siteContent.commanders[index % siteContent.commanders.length].faction,
    recommendedCommander:
      index === 0
        ? contested?.recommendedCommander ?? siteContent.commanders[0].name
        : siteContent.commanders[index % siteContent.commanders.length].name,
  }));

  return {
    generatedAt: new Date().toISOString(),
    headline: contested
      ? `${contested.zone} is the best current scenario for prototype pressure testing.`
      : 'Prototype pressure testing can start from the current world shell.',
    coreLoop,
    commanderLoadout,
    prototypeScenarios,
    readiness: {
      recommendedWave: playtest.recommendedNextWave,
      qualifiedLeads: playtest.byWave[playtest.recommendedNextWave],
      factionCoverageComplete: playtest.totals.factionCoverageComplete,
      iosReady: playtest.totals.iosReady,
    },
  };
}
