import { siteContent } from './content';
import type { LeadRecord } from './leads';

export type WaveName = 'wave-0-founder' | 'wave-1-mobile-core' | 'wave-2-alliance-pressure' | 'wave-3-broader-market';

export type ScoredLead = LeadRecord & {
  score: number;
  wave: WaveName;
  factionLabel: string;
  platformLabel: string;
  playStyleLabel: string;
  invitePriority: 'priority' | 'standard' | 'watchlist';
};

const factionLabels: Record<string, string> = Object.fromEntries(
  siteContent.factions.map((faction) => [faction.slug, faction.name]),
);

const platformLabels: Record<string, string> = {
  ios: 'iPhone / iPad',
  android: 'Android',
  web: 'Web follow-along',
};

const playStyleLabels: Record<string, string> = {
  builder: 'Builder',
  raider: 'Raider',
  tactician: 'Tactician',
};

const allianceRoleScores: Record<string, number> = {
  'shot-caller': 16,
  frontliner: 10,
  logistics: 12,
  scout: 14,
};

const weeklyHoursScores: Record<string, number> = {
  '1-3': 2,
  '4-5': 6,
  '6-10': 10,
  '10-plus': 14,
};

const testIntentScores: Record<string, number> = {
  'day-one': 10,
  weekend: 5,
  spectator: 0,
};

export function explainLeadScore(lead: LeadRecord) {
  const reasons: string[] = [];

  if (lead.platform === 'ios') reasons.push('iOS-ready build fit');
  else if (lead.platform === 'android') reasons.push('Android interest captured');
  else if (lead.platform === 'web') reasons.push('Web-only follow-along');

  if (lead.playStyle === 'tactician') reasons.push('Tactician profile');
  else if (lead.playStyle === 'raider') reasons.push('Raider profile');
  else if (lead.playStyle === 'builder') reasons.push('Builder profile');

  if (lead.faction) reasons.push('Faction picked');
  if (lead.source === 'founder-page') reasons.push('Founder funnel');
  if (lead.source === 'playtest-page') reasons.push('Playtest intake');
  if (lead.allianceRole) reasons.push(`${lead.allianceRole} role tagged`);
  if (lead.weeklyHours) reasons.push(`${lead.weeklyHours} weekly hours`);
  if (lead.testIntent) reasons.push(`${lead.testIntent} access intent`);

  return reasons;
}

export function scoreLead(lead: LeadRecord): ScoredLead {
  let score = 20;

  if (lead.platform === 'ios') score += 30;
  else if (lead.platform === 'android') score += 20;
  else if (lead.platform === 'web') score += 5;

  if (lead.playStyle === 'tactician') score += 18;
  else if (lead.playStyle === 'raider') score += 14;
  else if (lead.playStyle === 'builder') score += 12;

  if (lead.faction) score += 10;
  if (lead.source === 'founder-page') score += 12;
  if (lead.source === 'playtest-page') score += 16;
  if (lead.allianceRole) score += allianceRoleScores[lead.allianceRole] ?? 4;
  if (lead.weeklyHours) score += weeklyHoursScores[lead.weeklyHours] ?? 0;
  if (lead.testIntent) score += testIntentScores[lead.testIntent] ?? 0;

  const wave: WaveName = score >= 72
    ? 'wave-0-founder'
    : score >= 58
      ? 'wave-1-mobile-core'
      : score >= 42
        ? 'wave-2-alliance-pressure'
        : 'wave-3-broader-market';

  const invitePriority: ScoredLead['invitePriority'] = score >= 72 ? 'priority' : score >= 58 ? 'standard' : 'watchlist';

  return {
    ...lead,
    score,
    wave,
    factionLabel: lead.faction ? factionLabels[lead.faction] || lead.faction : 'Unspecified',
    platformLabel: lead.platform ? platformLabels[lead.platform] || lead.platform : 'Unspecified',
    playStyleLabel: lead.playStyle ? playStyleLabels[lead.playStyle] || lead.playStyle : 'Unspecified',
    invitePriority,
  };
}

export function buildPlaytestSummary(leads: LeadRecord[]) {
  const scored = leads.map(scoreLead).sort((a, b) => b.score - a.score || b.ts.localeCompare(a.ts));
  const byWave = scored.reduce<Record<WaveName, number>>((acc, lead) => {
    acc[lead.wave] += 1;
    return acc;
  }, {
    'wave-0-founder': 0,
    'wave-1-mobile-core': 0,
    'wave-2-alliance-pressure': 0,
    'wave-3-broader-market': 0,
  });

  const iosReady = scored.filter((lead) => lead.platform === 'ios').length;
  const tacticians = scored.filter((lead) => lead.playStyle === 'tactician').length;
  const factionCoverage = siteContent.factions.map((faction) => ({
    slug: faction.slug,
    name: faction.name,
    leads: scored.filter((lead) => lead.faction === faction.slug).length,
  }));
  const allianceRoleCoverage = {
    shotCallers: scored.filter((lead) => lead.allianceRole === 'shot-caller').length,
    logistics: scored.filter((lead) => lead.allianceRole === 'logistics').length,
    scouts: scored.filter((lead) => lead.allianceRole === 'scout').length,
  };

  const nextWave: WaveName = byWave['wave-0-founder'] >= 12
    ? 'wave-0-founder'
    : byWave['wave-1-mobile-core'] >= 20
      ? 'wave-1-mobile-core'
      : byWave['wave-2-alliance-pressure'] >= 30
        ? 'wave-2-alliance-pressure'
        : 'wave-3-broader-market';

  return {
    totals: {
      leads: leads.length,
      iosReady,
      tacticians,
      factionCoverageComplete: factionCoverage.every((entry) => entry.leads > 0),
      allianceRoleCoverage,
    },
    byWave,
    factionCoverage,
    recommendedNextWave: nextWave,
    shortlist: scored.slice(0, 12),
    latest: scored.slice(0, 5),
  };
}
