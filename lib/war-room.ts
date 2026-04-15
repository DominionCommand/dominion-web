import { siteContent } from './content';
import { buildPlaytestSummary } from './funnel';
import type { LeadRecord } from './leads';
import { buildOperationsSnapshot } from './operations';
import { readWarRoomBoardState } from './war-room-board';
import { getWaveLabel } from './waves';

export type WarRoomFocus = {
  slug: string;
  title: string;
  reason: string;
  action: string;
  owner: string;
  urgency: 'now' | 'next' | 'watch';
  operatorStatus: 'todo' | 'active' | 'blocked' | 'done';
  operatorOwner: string;
  operatorNote: string;
  operatorUpdatedAt: string | null;
};

export type WarRoomBriefing = {
  generatedAt: string;
  headline: string;
  statusLine: string;
  nextWave: {
    slug: string;
    label: string;
    qualifiedLeads: number;
    shortage: string;
  };
  criticalFronts: Array<{
    slug: string;
    zone: string;
    priority: string;
    faction: string;
    commander: string;
    reward: string;
  }>;
  eventAlignment: Array<{
    slug: string;
    name: string;
    status: string;
    zone: string;
    reward: string;
  }>;
  factionDemand: Array<{
    slug: string;
    name: string;
    leads: number;
    demandStatus: 'strong' | 'building' | 'thin';
  }>;
  focusQueue: WarRoomFocus[];
  board: {
    updatedAt: string;
    summary: {
      todo: number;
      active: number;
      blocked: number;
      done: number;
    };
  };
};

export async function buildWarRoomBriefing(leads: LeadRecord[]): Promise<WarRoomBriefing> {
  const operations = await buildOperationsSnapshot(leads);
  const playtest = buildPlaytestSummary(leads);
  const boardState = await readWarRoomBoardState();
  const criticalFronts = operations.activeOperations
    .filter((operation) => operation.priority !== 'steady')
    .slice(0, 3)
    .map((operation) => ({
      slug: operation.slug,
      zone: operation.zone,
      priority: operation.priority,
      faction: operation.faction,
      commander: operation.recommendedCommander,
      reward: operation.reward,
    }));

  const factionDemand: WarRoomBriefing['factionDemand'] = playtest.factionCoverage.map((entry) => ({
    ...entry,
    demandStatus: entry.leads >= 3 ? 'strong' : entry.leads >= 1 ? 'building' : 'thin',
  }));

  const weakestFaction = factionDemand
    .slice()
    .sort((a, b) => a.leads - b.leads || a.name.localeCompare(b.name))[0];

  const hottestFront = criticalFronts[0] ?? null;
  const nextWave = playtest.recommendedNextWave;
  const nextWaveCount = playtest.byWave[nextWave];

  const eventAlignment = siteContent.events.map((event, index) => ({
    slug: event.slug,
    name: event.name,
    status: event.status,
    zone: criticalFronts[index % Math.max(criticalFronts.length, 1)]?.zone ?? siteContent.worldZones[0]?.name ?? 'Unassigned front',
    reward: event.reward,
  }));

  const boardBySlug = new Map(boardState.focusItems.map((item) => [item.slug, item]));

  const generatedFocusQueue: Array<Omit<WarRoomFocus, 'operatorStatus' | 'operatorOwner' | 'operatorNote' | 'operatorUpdatedAt'>> = [
    hottestFront
      ? {
          slug: `front-${hottestFront.slug}`,
          title: `Stabilize ${hottestFront.zone}`,
          reason: `${hottestFront.priority} pressure is already live and this front is the clearest prototype-ready conflict surface.`,
          action: `Build the first playable objective loop around ${hottestFront.commander} and ${hottestFront.reward.toLowerCase()}.`,
          owner: 'World map + combat shell',
          urgency: 'now',
        }
      : {
          slug: 'front-fallback',
          title: 'Stage the first frontline loop',
          reason: 'The world layer exists, but it still needs a preferred prototype conflict anchor.',
          action: 'Pick the first zone, attach a commander, and wire it into a repeatable objective loop.',
          owner: 'World map + combat shell',
          urgency: 'now',
        },
    {
      slug: 'wave-conversion',
      title: `Convert ${getWaveLabel(nextWave)}`,
      reason: `${nextWaveCount} leads already qualify for the currently recommended invite cohort.`,
      action: 'Use the playtest intake and ops shortlist as the first manual invite list.',
      owner: 'Growth + playtest ops',
      urgency: nextWaveCount > 0 ? 'next' : 'watch',
    },
    {
      slug: 'faction-balance',
      title: `Strengthen ${weakestFaction?.name ?? 'faction'} demand coverage`,
      reason: weakestFaction
        ? `${weakestFaction.leads} prereg leads currently map to this faction, making the prototype cohort less balanced.`
        : 'Faction demand coverage is missing and needs to be rebuilt.',
      action: 'Feature this faction more aggressively on the homepage, prereg path, and next content drop.',
      owner: 'Website + growth surfaces',
      urgency: weakestFaction && weakestFaction.leads === 0 ? 'now' : 'next',
    },
  ];

  const focusQueue: WarRoomFocus[] = generatedFocusQueue.map((focus) => {
    const operatorState = boardBySlug.get(focus.slug);

    return {
      ...focus,
      operatorStatus: operatorState?.status ?? 'todo',
      operatorOwner: operatorState?.owner ?? '',
      operatorNote: operatorState?.note ?? '',
      operatorUpdatedAt: operatorState?.updatedAt ?? null,
    };
  });

  const headline = hottestFront
    ? `${hottestFront.zone} is the live center of gravity for Dominion Nexus right now.`
    : 'Dominion Nexus now has enough implementation to generate a live war-room briefing.';

  const statusLine = `${operations.summary.activeFronts} fronts mapped, ${operations.summary.contestedFronts} critical, ${nextWaveCount} leads in ${getWaveLabel(nextWave)}.`;

  return {
    generatedAt: new Date().toISOString(),
    headline,
    statusLine,
    nextWave: {
      slug: nextWave,
      label: getWaveLabel(nextWave),
      qualifiedLeads: nextWaveCount,
      shortage: weakestFaction
        ? `${weakestFaction.name} is the thinnest faction queue at ${weakestFaction.leads} leads.`
        : 'Faction balance looks healthy.',
    },
    criticalFronts,
    eventAlignment,
    factionDemand,
    focusQueue,
    board: {
      updatedAt: boardState.updatedAt,
      summary: {
        todo: focusQueue.filter((item) => item.operatorStatus === 'todo').length,
        active: focusQueue.filter((item) => item.operatorStatus === 'active').length,
        blocked: focusQueue.filter((item) => item.operatorStatus === 'blocked').length,
        done: focusQueue.filter((item) => item.operatorStatus === 'done').length,
      },
    },
  };
}
