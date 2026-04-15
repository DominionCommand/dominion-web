import { siteContent } from './content';
import { buildPlaytestSummary, type ScoredLead, type WaveName } from './funnel';
import type { LeadRecord } from './leads';
import { getWaveLabel } from './waves';

const waveTargets: Record<WaveName, number> = {
  'wave-0-founder': 12,
  'wave-1-mobile-core': 20,
  'wave-2-alliance-pressure': 30,
  'wave-3-broader-market': 40,
};

const roleLabels: Record<string, string> = {
  'shot-caller': 'Shot caller',
  frontliner: 'Frontliner',
  logistics: 'Logistics',
  scout: 'Scout',
};

const platformLabels: Record<string, string> = {
  ios: 'iPhone / iPad',
  android: 'Android',
  web: 'Web follow-along',
};

export async function buildCohortPlanner(leads: LeadRecord[]) {
  const playtest = buildPlaytestSummary(leads);
  const recommendedWave = playtest.recommendedNextWave;
  const recommendedTarget = waveTargets[recommendedWave];
  const recommendedPool = playtest.shortlist.filter((lead) => lead.wave === recommendedWave);
  const selectedCohort = recommendedPool.slice(0, recommendedTarget);

  const factionSlots = siteContent.factions.map((faction) => {
    const assigned = selectedCohort.filter((lead) => lead.faction === faction.slug);
    const target = Math.max(1, Math.ceil(recommendedTarget / siteContent.factions.length));

    return {
      slug: faction.slug,
      name: faction.name,
      assigned: assigned.length,
      target,
      gap: Math.max(target - assigned.length, 0),
      status: assigned.length >= target ? 'covered' : assigned.length > 0 ? 'thin' : 'missing',
    };
  });

  const roleSlots = ['shot-caller', 'frontliner', 'logistics', 'scout'].map((role) => {
    const assigned = selectedCohort.filter((lead) => lead.allianceRole === role);
    const target = role === 'frontliner' ? 3 : 2;

    return {
      slug: role,
      label: roleLabels[role] ?? role,
      assigned: assigned.length,
      target,
      gap: Math.max(target - assigned.length, 0),
      status: assigned.length >= target ? 'covered' : assigned.length > 0 ? 'thin' : 'missing',
    };
  });

  const platformMix = ['ios', 'android', 'web'].map((platform) => ({
    slug: platform,
    label: platformLabels[platform] ?? platform,
    assigned: selectedCohort.filter((lead) => lead.platform === platform).length,
  }));

  const gaps = [
    ...factionSlots.filter((slot) => slot.gap > 0).map((slot) => `${slot.name} needs ${slot.gap} more cohort slot${slot.gap === 1 ? '' : 's'}.`),
    ...roleSlots.filter((slot) => slot.gap > 0).map((slot) => `${slot.label} coverage needs ${slot.gap} more slot${slot.gap === 1 ? '' : 's'}.`),
  ];

  const reserveQueue = playtest.shortlist
    .filter((lead) => lead.wave !== recommendedWave)
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    recommendedWave: {
      slug: recommendedWave,
      label: getWaveLabel(recommendedWave),
      targetSize: recommendedTarget,
      qualifiedLeads: playtest.byWave[recommendedWave],
      fillRate: recommendedTarget > 0 ? Math.min(100, Math.round((selectedCohort.length / recommendedTarget) * 100)) : 0,
    },
    selectedCohort,
    reserveQueue,
    factionSlots,
    roleSlots,
    platformMix,
    actions: [
      selectedCohort.length >= recommendedTarget
        ? `Open ${getWaveLabel(recommendedWave)} invites now. ${selectedCohort.length} leads are already selected.`
        : `Keep filling ${getWaveLabel(recommendedWave)}. ${recommendedTarget - selectedCohort.length} more qualified leads are needed.` ,
      factionSlots.some((slot) => slot.gap > 0)
        ? 'Push the weakest faction harder on homepage, faction briefs, and playtest copy.'
        : 'Faction balance is healthy enough for the next cohort.',
      roleSlots.some((slot) => slot.gap > 0)
        ? 'Recruit more missing alliance roles before broader invite expansion.'
        : 'Alliance-role mix is ready for pressure testing.',
    ],
    gaps,
  };
}
