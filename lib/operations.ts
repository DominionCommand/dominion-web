import { buildActivitySnapshot } from './activity-log';
import { buildContactQueueSnapshot } from './contact-queue';
import { readContactRequests } from './contact-intake';
import { readControlTowerState } from './control-tower';
import { siteContent } from './content';
import { buildPlaytestSummary } from './funnel';
import { buildInviteQueue } from './invite-queue';
import type { LeadRecord } from './leads';

const controlLabels: Record<string, string> = {
  dominion: 'Dominion Core control',
  rebellion: 'Iron Rebellion control',
  syndicate: 'Eclipse Syndicate control',
  contested: 'Contested',
  neutral: 'Neutral',
};

const pressureScores: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export type AllianceReadiness = {
  slug: string;
  title: string;
  readiness: 'forming' | 'ready' | 'surging';
  score: number;
  summary: string;
  requirement: string;
};

export type OperationBrief = {
  slug: string;
  zone: string;
  control: string;
  pressure: string;
  priority: 'critical' | 'elevated' | 'steady';
  recommendedCommander: string;
  faction: string;
  objective: string;
  reward: string;
  pressureScore: number;
};

export type MissionBrief = {
  slug: string;
  title: string;
  phase: string;
  objective: string;
  owner: string;
  dependency: string;
};

export type OperationsSnapshot = {
  generatedAt: string;
  summary: {
    activeFronts: number;
    contestedFronts: number;
    surgingAllianceSystems: number;
    recommendedWave: string;
    controlTowerStatus: string;
    focusLane: string;
    selectedInvites: number;
    directInbound: number;
    recentActivity: number;
  };
  commandPost: {
    status: string;
    owner: string;
    focusLane: string;
    updatedAt: string;
    headline: string;
  };
  intakeQueue: {
    recommendedWave: string;
    selectedInvites: number;
    invitesSent: number;
    onHold: number;
    openContacts: number;
    unownedContacts: number;
  };
  frontlineBoard: Array<OperationBrief & { owner: string; nextAction: string }>;
  activeOperations: OperationBrief[];
  allianceReadiness: AllianceReadiness[];
  prototypeMissions: MissionBrief[];
  executionRisks: string[];
  recommendedActions: string[];
  contactQueue: {
    summary: Awaited<ReturnType<typeof buildContactQueueSnapshot>>['summary'];
    recentUpdates: Awaited<ReturnType<typeof buildContactQueueSnapshot>>['recentUpdates'];
  };
  recentActivity: Awaited<ReturnType<typeof buildActivitySnapshot>>['entries'];
  playtest: ReturnType<typeof buildPlaytestSummary>;
};

export async function buildOperationsSnapshot(leads: LeadRecord[]): Promise<OperationsSnapshot> {
  const playtest = buildPlaytestSummary(leads);
  const [activity, controlTowerState, inviteQueue, contactRequests] = await Promise.all([
    buildActivitySnapshot(24),
    readControlTowerState(),
    buildInviteQueue(leads),
    readContactRequests(),
  ]);
  const contactQueue = await buildContactQueueSnapshot(contactRequests);
  const featuredCommanders = Object.fromEntries(siteContent.commanders.map((commander) => [commander.factionSlug, commander]));

  const activeOperations: OperationBrief[] = siteContent.worldZones
    .map((zone) => {
      const recommendedFactionSlug = zone.control === 'contested'
        ? 'dominion-core'
        : zone.control === 'rebellion'
          ? 'iron-rebellion'
          : zone.control === 'syndicate'
            ? 'eclipse-syndicate'
            : 'dominion-core';
      const commander = featuredCommanders[recommendedFactionSlug] ?? siteContent.commanders[0];
      const pressureScore = pressureScores[zone.pressure] ?? 1;
      const priority: OperationBrief['priority'] = zone.control === 'contested'
        ? 'critical'
        : pressureScore >= 3
          ? 'elevated'
          : 'steady';

      return {
        slug: zone.slug,
        zone: zone.name,
        control: controlLabels[zone.control] ?? zone.control,
        pressure: zone.pressure,
        priority,
        recommendedCommander: commander.name,
        faction: commander.faction,
        objective: zone.objective,
        reward: zone.reward,
        pressureScore,
      };
    })
    .sort((a, b) => b.pressureScore - a.pressureScore || a.zone.localeCompare(b.zone));

  const allianceReadiness: AllianceReadiness[] = siteContent.allianceFeatures.map((feature, index) => {
    const score = Math.min(
      100,
      28 + playtest.totals.leads * 3 + playtest.totals.tacticians * 2 + (playtest.totals.factionCoverageComplete ? 12 : 0) - index * 4,
    );
    const readiness: AllianceReadiness['readiness'] = score >= 75 ? 'surging' : score >= 50 ? 'ready' : 'forming';

    return {
      slug: feature.slug,
      title: feature.title,
      readiness,
      score,
      summary: feature.summary,
      requirement:
        readiness === 'surging'
          ? 'Can support live alliance objective testing now.'
          : readiness === 'ready'
            ? 'Strong enough for guided prototype sessions.'
            : 'Needs more tagged demand before external pressure tests.',
    };
  });

  const prototypeMissions: MissionBrief[] = [
    {
      slug: 'secure-crown-of-null',
      title: 'Secure Crown of Null',
      phase: 'Live war objective',
      objective: 'Drive the contested prestige zone into a repeatable rally and ownership loop.',
      owner: 'World map + alliance systems',
      dependency: 'Contested zone pressure and rally timing surface',
    },
    {
      slug: 'commander-specialty-validation',
      title: 'Validate commander specialties',
      phase: 'Combat readability',
      objective: 'Turn each commander brief into a prototype-ready battlefield role with clear strengths.',
      owner: 'Commander progression shell',
      dependency: 'Faction-tagged test cohort coverage',
    },
    {
      slug: 'invite-wave-conversion',
      title: 'Convert prereg into playable cohorts',
      phase: 'Growth to testing',
      objective: 'Move the strongest leads into a controlled wave with platform and play-style balance.',
      owner: 'Lead funnel + playtest ops',
      dependency: `Current recommendation: ${playtest.recommendedNextWave}`,
    },
  ];

  const frontlineBoard = activeOperations.slice(0, 5).map((operation, index) => ({
    ...operation,
    owner: index === 0 ? 'War room command' : index === 1 ? controlTowerState.owner : 'Alliance ops',
    nextAction:
      operation.priority === 'critical'
        ? 'Lock rally timing, featured commander, and alliance callout.'
        : operation.priority === 'elevated'
          ? 'Keep zone pressure visible in the current event loop.'
          : 'Monitor for escalation and keep reward framing updated.',
  }));

  const executionRisks = Array.from(new Set([
    ...(controlTowerState.status === 'blocked' ? ['Control tower is currently marked blocked and needs operator follow-through.'] : []),
    ...contactQueue.actions.filter((action) => action.includes('unowned') || action.includes('waiting') || action.includes('high-value')),
    ...activity.entries.slice(0, 4).map((entry) => `${entry.entity}: ${entry.summary}`),
  ])).slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      activeFronts: activeOperations.length,
      contestedFronts: activeOperations.filter((operation) => operation.priority === 'critical').length,
      surgingAllianceSystems: allianceReadiness.filter((item) => item.readiness === 'surging').length,
      recommendedWave: playtest.recommendedNextWave,
      controlTowerStatus: controlTowerState.status,
      focusLane: controlTowerState.focusLane,
      selectedInvites: inviteQueue.summary.selectedNow,
      directInbound: contactQueue.summary.byPriority.critical + contactQueue.summary.byPriority.high,
      recentActivity: activity.summary.total,
    },
    commandPost: {
      status: controlTowerState.status,
      owner: controlTowerState.owner,
      focusLane: controlTowerState.focusLane,
      updatedAt: controlTowerState.updatedAt,
      headline: `${controlTowerState.focusLane} is the active lane and ${inviteQueue.summary.selectedNow} invites are currently staged for ${playtest.recommendedNextWave}.`,
    },
    intakeQueue: {
      recommendedWave: playtest.recommendedNextWave,
      selectedInvites: inviteQueue.summary.selectedNow,
      invitesSent: inviteQueue.summary.invitesSent,
      onHold: inviteQueue.summary.onHold,
      openContacts: contactQueue.summary.open,
      unownedContacts: contactQueue.summary.unowned,
    },
    frontlineBoard,
    activeOperations,
    allianceReadiness,
    prototypeMissions,
    executionRisks,
    recommendedActions: Array.from(new Set([
      controlTowerState.status === 'blocked'
        ? `Clear the blocked control-tower posture under ${controlTowerState.owner || 'the current owner'} before stacking more launch work.`
        : `Keep ${controlTowerState.focusLane} as the active control-tower lane unless a harder blocker lands.`,
      ...inviteQueue.actions,
      ...contactQueue.actions,
    ])).slice(0, 8),
    contactQueue: {
      summary: contactQueue.summary,
      recentUpdates: contactQueue.recentUpdates.slice(0, 6),
    },
    recentActivity: activity.entries.slice(0, 8),
    playtest,
  };
}
