import { siteContent } from './content';
import { buildPlaytestSummary } from './funnel';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildOperationsSnapshot } from './operations';
import { getWaveLabel } from './waves';

export type PressureSignal = {
  slug: string;
  title: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  action: string;
};

function startOfDay(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export async function buildSignalsSnapshot(leads: LeadRecord[]) {
  const leadSummary = summarizeLeads(leads);
  const playtest = buildPlaytestSummary(leads);
  const operations = await buildOperationsSnapshot(leads);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const last7dLeads = leads.filter((lead) => {
    const ts = Date.parse(lead.ts);
    return Number.isFinite(ts) && now - ts <= 7 * dayMs;
  });

  const previous7dLeads = leads.filter((lead) => {
    const ts = Date.parse(lead.ts);
    return Number.isFinite(ts) && now - ts > 7 * dayMs && now - ts <= 14 * dayMs;
  });

  const leadVelocity = {
    last7d: last7dLeads.length,
    previous7d: previous7dLeads.length,
    delta: last7dLeads.length - previous7dLeads.length,
  };

  const dailyLeadFlow = Array.from({ length: 7 }, (_, index) => {
    const bucketStart = new Date(now - (6 - index) * dayMs);
    bucketStart.setHours(0, 0, 0, 0);
    const bucketTs = bucketStart.getTime();
    const count = last7dLeads.filter((lead) => startOfDay(lead.ts) === bucketTs).length;

    return {
      day: bucketStart.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    };
  });

  const weakestFaction = playtest.factionCoverage
    .slice()
    .sort((a, b) => a.leads - b.leads || a.name.localeCompare(b.name))[0] ?? null;

  const allianceRoleCounts = [
    { slug: 'shot-caller', label: 'Shot caller', count: playtest.totals.allianceRoleCoverage.shotCallers, target: 2 },
    { slug: 'logistics', label: 'Logistics', count: playtest.totals.allianceRoleCoverage.logistics, target: 2 },
    { slug: 'scout', label: 'Scout', count: playtest.totals.allianceRoleCoverage.scouts, target: 2 },
  ];

  const weakestRole = allianceRoleCounts
    .slice()
    .sort((a, b) => (a.count - a.target) - (b.count - b.target) || a.label.localeCompare(b.label))[0];

  const activeEvent = siteContent.events.find((event) => event.status === 'active') ?? null;
  const criticalFront = operations.activeOperations.find((operation) => operation.priority === 'critical') ?? operations.activeOperations[0] ?? null;

  const pressureSignals: PressureSignal[] = [
    weakestFaction
      ? {
          slug: 'faction-gap',
          title: `${weakestFaction.name} is the softest demand pocket`,
          detail: `${weakestFaction.leads} tagged leads currently sit in this faction, making it the clearest acquisition gap before the next push.`,
          severity: weakestFaction.leads === 0 ? 'high' : weakestFaction.leads < 2 ? 'medium' : 'low',
          action: 'Feature this faction harder on homepage modules, playtest copy, and faction-specific CTA surfaces.',
        }
      : null,
    weakestRole
      ? {
          slug: 'alliance-role-gap',
          title: `${weakestRole.label} coverage needs reinforcement`,
          detail: `${weakestRole.count} tagged ${weakestRole.label.toLowerCase()} leads are in the funnel against a target of ${weakestRole.target}.`,
          severity: weakestRole.count === 0 ? 'high' : weakestRole.count < weakestRole.target ? 'medium' : 'low',
          action: 'Tune playtest intake copy to call out this alliance role and route paid or community copy toward it.',
        }
      : null,
    criticalFront
      ? {
          slug: 'frontline-anchor',
          title: `${criticalFront.zone} is the best current campaign anchor`,
          detail: `${criticalFront.priority} pressure and ${criticalFront.recommendedCommander} make this the most legible conflict to center messaging around.`,
          severity: criticalFront.priority === 'critical' ? 'high' : 'medium',
          action: 'Thread this zone into world-state, event, and announcement copy so the product pitch has a clear center of gravity.',
        }
      : null,
  ].filter((signal): signal is PressureSignal => Boolean(signal));

  const topSources = Object.entries(leadSummary.bySource)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));

  return {
    generatedAt: new Date().toISOString(),
    headline: activeEvent
      ? `${activeEvent.name} is the live event hook, while ${getWaveLabel(playtest.recommendedNextWave)} remains the next playable cohort target.`
      : `${getWaveLabel(playtest.recommendedNextWave)} is the next playable cohort target.`,
    metrics: {
      totalLeads: leadSummary.total,
      uniqueLeads: leadSummary.unique,
      last7dLeads: leadVelocity.last7d,
      leadVelocityDelta: leadVelocity.delta,
      recommendedWave: getWaveLabel(playtest.recommendedNextWave),
      recommendedWaveQualified: playtest.byWave[playtest.recommendedNextWave],
    },
    dailyLeadFlow,
    topSources,
    weakestFaction,
    weakestRole,
    criticalFront,
    activeEvent,
    pressureSignals,
    recommendedActions: [
      playtest.byWave[playtest.recommendedNextWave] > 0
        ? `Prepare ${getWaveLabel(playtest.recommendedNextWave)} invites. ${playtest.byWave[playtest.recommendedNextWave]} leads already qualify.`
        : `Keep filling ${getWaveLabel(playtest.recommendedNextWave)} before invites open.`,
      weakestFaction
        ? `Increase ${weakestFaction.name} representation in acquisition creative until the funnel is more balanced.`
        : 'Maintain balanced faction messaging across acquisition surfaces.',
      activeEvent
        ? `Use ${activeEvent.name} as the live-op story hook across homepage, news, and war-room copy.`
        : 'Define the first live event hook before the next marketing push.',
    ],
  };
}
