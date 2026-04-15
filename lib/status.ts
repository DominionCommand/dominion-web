import { buildActivitySnapshot } from './activity-log';
import { buildControlTowerSnapshot } from './control-tower';
import { buildDashboardSnapshot } from './dashboard';
import { readContactRequests, summarizeContactRequests } from './contact-intake';
import { buildIntakeDashboardSnapshot } from './intake-dashboard';
import { buildInviteQueue } from './invite-queue';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildSeasonControlSnapshot } from './season-control';
import { buildRouteInventory } from './routes';

export async function buildStatusSnapshot(leads: LeadRecord[]) {
  const [leadSummary, inviteQueue, seasonControl, controlTower, dashboard, activity, contactRequests, intake] = await Promise.all([
    Promise.resolve(summarizeLeads(leads)),
    buildInviteQueue(leads),
    buildSeasonControlSnapshot(leads),
    buildControlTowerSnapshot(leads),
    buildDashboardSnapshot(leads),
    buildActivitySnapshot(20),
    readContactRequests(),
    buildIntakeDashboardSnapshot(leads),
  ]);

  const contactSummary = summarizeContactRequests(contactRequests);

  const routeInventory = buildRouteInventory();
  const routes = routeInventory.pages.map((route) => route.href);

  const surfaces = [
    {
      slug: 'season-control',
      label: 'Season control',
      href: '/command-center',
      status: seasonControl.state.status,
      owner: seasonControl.state.owner,
      summary: seasonControl.headline,
      updatedAt: seasonControl.state.updatedAt,
    },
    {
      slug: 'control-tower',
      label: 'Control tower',
      href: '/control-tower',
      status: controlTower.state.status,
      owner: controlTower.state.owner,
      summary: controlTower.headline,
      updatedAt: controlTower.state.updatedAt,
    },
    {
      slug: 'release-room',
      label: 'Release room',
      href: '/release-room',
      status: controlTower.state.status === 'blocked' ? 'blocked' : inviteQueue.summary.invitesSent > 0 ? 'go-check' : 'holding',
      owner: controlTower.state.owner,
      summary: `${inviteQueue.summary.selectedNow} selected invites, ${inviteQueue.summary.invitesSent} sent, and ${controlTower.blockers.length} release risks surfaced.`,
      updatedAt: controlTower.state.updatedAt,
    },
    {
      slug: 'invite-queue',
      label: 'Invite queue',
      href: '/invite-queue',
      status: inviteQueue.summary.invitesSent > 0 ? 'sending' : inviteQueue.summary.selectedNow > 0 ? 'staging' : 'idle',
      owner: 'Growth ops',
      summary: `${inviteQueue.summary.selectedNow} selected, ${inviteQueue.summary.invitesSent} sent, ${inviteQueue.summary.onHold} on hold.`,
      updatedAt: inviteQueue.updatedAt,
    },
    {
      slug: 'dashboard',
      label: 'Executive dashboard',
      href: '/dashboard',
      status: dashboard.summary.recommendedWave.qualifiedLeads > 0 ? 'ready' : 'monitoring',
      owner: 'Studio command',
      summary: `${dashboard.summary.recommendedWave.label} is recommended and ${dashboard.summary.recommendedWave.qualifiedLeads} leads currently qualify.`,
      updatedAt: dashboard.generatedAt,
    },
    {
      slug: 'mission-control',
      label: 'Mission control',
      href: '/mission-control',
      status: controlTower.state.status === 'blocked' ? 'blocked' : inviteQueue.summary.selectedNow > 0 ? 'active' : 'watch',
      owner: controlTower.state.owner,
      summary: `Top-level command snapshot rolls up ${controlTower.state.focusLane}, ${seasonControl.state.status} season state, and ${inviteQueue.summary.selectedNow} selected invites.`,
      updatedAt: controlTower.state.updatedAt,
    },
    {
      slug: 'intake',
      label: 'Intake dashboard',
      href: '/intake',
      status: intake.summary.highPriorityLeads > 0 || contactSummary.total > 0 ? 'active' : 'monitoring',
      owner: 'Growth ops',
      summary: `${intake.summary.highPriorityLeads} high-priority leads and ${contactSummary.total} contact requests are visible in one follow-up queue.`,
      updatedAt: intake.generatedAt,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    name: 'Dominion Nexus',
    routes,
    routeInventory: {
      counts: routeInventory.counts,
      groups: routeInventory.groups,
      featured: routeInventory.pages.slice(0, 24),
      apiFeatured: routeInventory.api.slice(0, 16),
    },
    leadSummary: {
      total: leadSummary.total,
      unique: leadSummary.unique,
      latestLeadTs: leadSummary.latest[0]?.ts ?? null,
      topFaction: Object.entries(leadSummary.byFaction).sort((a, b) => b[1] - a[1])[0] ?? null,
      topPlayStyle: Object.entries(leadSummary.byPlayStyle).sort((a, b) => b[1] - a[1])[0] ?? null,
    },
    inviteQueue: {
      updatedAt: inviteQueue.updatedAt,
      selectedNow: inviteQueue.summary.selectedNow,
      invitesSent: inviteQueue.summary.invitesSent,
      onHold: inviteQueue.summary.onHold,
      recommendedWave: inviteQueue.recommendedWave,
    },
    command: {
      activeBeat: seasonControl.activeBeat?.phase ?? null,
      featuredEvent: seasonControl.featuredEvent?.name ?? null,
      featuredZone: seasonControl.featuredZone
        ? 'zone' in seasonControl.featuredZone
          ? seasonControl.featuredZone.zone
          : seasonControl.featuredZone.name
        : null,
      seasonStatus: seasonControl.state.status,
      controlTowerStatus: controlTower.state.status,
      focusLane: controlTower.state.focusLane,
    },
    activity: activity.summary,
    intake: {
      contactRequests: contactSummary.total,
      directInbound: intake.summary.directInbound,
      supportLoad: intake.summary.supportLoad,
      highPriorityLeads: intake.summary.highPriorityLeads,
    },
    surfaces,
    blockers: Array.from(new Set([
      ...dashboard.summary.blockers,
      ...controlTower.blockers,
      ...activity.entries.slice(0, 3).map((entry) => `${entry.entity}: ${entry.summary}`),
    ])).slice(0, 8),
    recommendedActions: Array.from(new Set([
      ...controlTower.recommendedActions,
      ...seasonControl.recommendedActions,
      ...inviteQueue.actions,
      ...intake.actions,
    ])).slice(0, 6),
  };
}
