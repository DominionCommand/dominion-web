import { buildActivitySnapshot } from './activity-log';
import { buildControlTowerSnapshot } from './control-tower';
import { buildIntakeDashboardSnapshot } from './intake-dashboard';
import { buildInviteQueue } from './invite-queue';
import type { LeadRecord } from './leads';
import { buildReleaseRoomSnapshot } from './release-room';
import { buildSeasonControlSnapshot } from './season-control';
import { buildSignalsSnapshot } from './signals';
import { buildStorefrontSnapshot } from './storefront';
import { buildWarRoomBriefing } from './war-room';

export async function buildMissionControlSnapshot(leads: LeadRecord[]) {
  const [seasonControl, controlTower, releaseRoom, inviteQueue, signals, warRoom, intake, storefront, activity] = await Promise.all([
    buildSeasonControlSnapshot(leads),
    buildControlTowerSnapshot(leads),
    buildReleaseRoomSnapshot(leads),
    buildInviteQueue(leads),
    buildSignalsSnapshot(leads),
    buildWarRoomBriefing(leads),
    buildIntakeDashboardSnapshot(leads),
    buildStorefrontSnapshot(leads),
    buildActivitySnapshot(24),
  ]);

  const priorityBoard = [
    {
      slug: 'release-decision',
      lane: 'Release',
      title: `Release posture is ${releaseRoom.summary.decision}`,
      status: releaseRoom.summary.blockedCount > 0 ? 'blocked' : releaseRoom.summary.readyCount >= 3 ? 'active' : 'watch',
      detail: `${releaseRoom.summary.readyCount} green checks, ${releaseRoom.summary.watchCount} watch items, ${releaseRoom.summary.blockedCount} blockers.`,
      owner: releaseRoom.summary.owner,
      href: '/release-room',
    },
    {
      slug: 'season-anchor',
      lane: 'Command',
      title: seasonControl.featuredEvent ? `${seasonControl.featuredEvent.name} is the live event anchor` : 'Season anchor still needs event assignment',
      status: seasonControl.state.status === 'live' ? 'active' : 'watch',
      detail: seasonControl.headline,
      owner: seasonControl.state.owner,
      href: '/command-center',
    },
    {
      slug: 'tower-focus',
      lane: controlTower.state.focusLane,
      title: `${controlTower.state.focusLane} is the active tower lane`,
      status: controlTower.state.status === 'blocked' ? 'blocked' : controlTower.state.status === 'executing' ? 'active' : 'watch',
      detail: controlTower.headline,
      owner: controlTower.state.owner,
      href: '/control-tower',
    },
    {
      slug: 'invite-wave',
      lane: 'Launch',
      title: `${inviteQueue.summary.selectedNow} invites selected for ${inviteQueue.recommendedWave}`,
      status: inviteQueue.summary.invitesSent > 0 ? 'active' : inviteQueue.summary.selectedNow > 0 ? 'watch' : 'blocked',
      detail: `${inviteQueue.summary.invitesSent} sent, ${inviteQueue.summary.onHold} on hold, ${signals.metrics.recommendedWaveQualified} qualified leads available.`,
      owner: 'Growth ops',
      href: '/invite-queue',
    },
    {
      slug: 'war-pressure',
      lane: 'War Room',
      title: warRoom.criticalFronts[0] ? `${warRoom.criticalFronts[0].zone} is the critical frontline` : 'No frontline pressure highlighted yet',
      status: warRoom.criticalFronts.length > 0 ? 'active' : 'watch',
      detail: warRoom.headline,
      owner: warRoom.focusQueue[0]?.operatorOwner || warRoom.focusQueue[0]?.owner || 'War room command',
      href: '/war-room',
    },
    {
      slug: 'monetization-hook',
      lane: 'Commerce',
      title: storefront.summary.activeEvent ? `${storefront.summary.featuredOffer.name} is aligned to live event timing` : `${storefront.summary.featuredOffer.name} needs a stronger event hook`,
      status: storefront.summary.activeEvent ? 'active' : 'watch',
      detail: storefront.recommendations[0] ?? 'No storefront recommendation surfaced yet.',
      owner: storefront.state.owner,
      href: '/storefront',
    },
  ];

  const systemPulse = [
    {
      label: 'Release call',
      value: releaseRoom.summary.decision,
      detail: releaseRoom.summary.nextMilestone,
    },
    {
      label: 'Season status',
      value: seasonControl.state.status,
      detail: seasonControl.activeBeat?.phase ?? 'No active beat selected',
    },
    {
      label: 'Tower lane',
      value: controlTower.state.focusLane,
      detail: controlTower.state.status,
    },
    {
      label: 'Invite flow',
      value: `${inviteQueue.summary.selectedNow} selected`,
      detail: `${inviteQueue.summary.invitesSent} sent`,
    },
    {
      label: 'Inbound pressure',
      value: `${intake.summary.directInbound} direct inbound`,
      detail: `${intake.summary.highPriorityLeads} high-priority leads`,
    },
    {
      label: 'Frontline pressure',
      value: `${warRoom.criticalFronts.length} critical fronts`,
      detail: `${signals.pressureSignals.filter((signal) => signal.severity === 'high').length} high-severity signals`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      releaseDecision: releaseRoom.summary.decision,
      nextMilestone: releaseRoom.summary.nextMilestone,
      activeBeat: seasonControl.activeBeat?.phase ?? null,
      focusLane: controlTower.state.focusLane,
      recommendedWave: inviteQueue.recommendedWave,
      recommendedWaveQualified: signals.metrics.recommendedWaveQualified,
      criticalFronts: warRoom.criticalFronts.length,
      directInbound: intake.summary.directInbound,
    },
    systemPulse,
    priorityBoard,
    blockers: Array.from(new Set([
      ...releaseRoom.blockers,
      ...controlTower.blockers,
      ...signals.pressureSignals.filter((signal) => signal.severity === 'high').map((signal) => `${signal.title}: ${signal.detail}`),
    ])).slice(0, 10),
    recommendedActions: Array.from(new Set([
      ...releaseRoom.recommendedActions,
      ...controlTower.recommendedActions,
      ...seasonControl.recommendedActions,
      ...storefront.recommendations,
    ])).slice(0, 8),
    recentActivity: activity.entries.slice(0, 10),
  };
}
