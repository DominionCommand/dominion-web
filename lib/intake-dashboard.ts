import { buildActivitySnapshot } from './activity-log';
import { buildContactQueueSnapshot } from './contact-queue';
import { readContactRequests, summarizeContactRequests } from './contact-intake';
import { buildPlaytestSummary, explainLeadScore, scoreLead } from './funnel';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { getWaveLabel } from './waves';

function getTopBuckets(entries: Record<string, number>, limit = 4) {
  return Object.entries(entries)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export async function buildIntakeDashboardSnapshot(leads: LeadRecord[]) {
  const [activity, contactRequests] = await Promise.all([
    buildActivitySnapshot(20),
    readContactRequests(),
  ]);

  const leadSummary = summarizeLeads(leads);
  const playtest = buildPlaytestSummary(leads);
  const contactSummary = summarizeContactRequests(contactRequests);
  const contactQueue = await buildContactQueueSnapshot(contactRequests);
  const scoredShortlist = playtest.shortlist.slice(0, 8).map((lead) => ({
    ...lead,
    scoreReasons: explainLeadScore(lead),
  }));

  const recentlyQualified = leads
    .map(scoreLead)
    .sort((a, b) => b.ts.localeCompare(a.ts) || b.score - a.score)
    .slice(0, 10);

  const topicPressure = getTopBuckets(contactSummary.byTopic, 4);
  const sourcePressure = getTopBuckets(leadSummary.bySource, 4);

  const readyForFollowup = scoredShortlist.filter((lead) => lead.invitePriority !== 'watchlist').length;
  const directInbound = (contactSummary.byTopic['founder-access'] ?? 0) + (contactSummary.byTopic.partnership ?? 0) + (contactSummary.byTopic.press ?? 0);

  return {
    generatedAt: new Date().toISOString(),
    headline: `${getWaveLabel(playtest.recommendedNextWave)} is the current intake target, with ${readyForFollowup} high-priority leads and ${directInbound} non-support inbound requests already captured.`,
    summary: {
      totalLeads: leadSummary.total,
      uniqueLeads: leadSummary.unique,
      recommendedWave: playtest.recommendedNextWave,
      recommendedWaveLabel: getWaveLabel(playtest.recommendedNextWave),
      recommendedWaveQualified: playtest.byWave[playtest.recommendedNextWave],
      highPriorityLeads: readyForFollowup,
      contactRequests: contactSummary.total,
      directInbound,
      supportLoad: contactSummary.byTopic.support ?? 0,
      openContactRequests: contactQueue.summary.open,
      unownedContactRequests: contactQueue.summary.unowned,
      recentActivity: activity.summary.total,
    },
    pressure: {
      topSources: sourcePressure,
      topTopics: topicPressure,
      factionCoverage: playtest.factionCoverage,
    },
    actions: [
      playtest.byWave[playtest.recommendedNextWave] > 0
        ? `Prepare ${getWaveLabel(playtest.recommendedNextWave)} follow-up. ${playtest.byWave[playtest.recommendedNextWave]} leads already qualify.`
        : `Keep filling ${getWaveLabel(playtest.recommendedNextWave)} before any invite send.`,
      directInbound > 0
        ? `Work the founder, partnership, and press queue. ${directInbound} direct inbound requests are waiting for response.`
        : 'No direct inbound requests are queued yet, so keep public intake visible on the site.',
      contactQueue.summary.unowned > 0
        ? `${contactQueue.summary.unowned} contact requests still have no owner. Assign them before they stall.`
        : 'Every open contact request currently has an owner attached.',
      contactSummary.byTopic.support
        ? `Support load is active. ${contactSummary.byTopic.support} support requests are already sitting in the queue.`
        : 'Support queue is currently clear.',
    ],
    shortlist: scoredShortlist,
    recentLeads: recentlyQualified,
    latestContactRequests: contactQueue.recentUpdates,
    recentActivity: activity.entries.slice(0, 8),
  };
}
