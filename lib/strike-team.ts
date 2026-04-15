import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { siteContent } from './content';
import { explainLeadScore, scoreLead } from './funnel';
import type { LeadRecord } from './leads';

export type StrikeTeamSlotStatus = 'candidate' | 'assigned' | 'confirmed' | 'hold';

export type StrikeTeamSlot = {
  slot: string;
  email?: string;
  commanderSlug: string;
  factionSlug: string;
  roleFocus: string;
  status: StrikeTeamSlotStatus;
  owner: string;
  note?: string;
  updatedAt: string;
};

export type StrikeTeamState = {
  updatedAt: string;
  slots: StrikeTeamSlot[];
};

const defaultSlots: Omit<StrikeTeamSlot, 'updatedAt'>[] = [
  {
    slot: 'command-lead',
    commanderSlug: 'general-varik',
    factionSlug: 'dominion-core',
    roleFocus: 'Shot caller and frontline commander',
    status: 'candidate',
    owner: 'Unassigned',
  },
  {
    slot: 'assault-lead',
    commanderSlug: 'kaine-drex',
    factionSlug: 'iron-rebellion',
    roleFocus: 'Aggressive raid and siege pressure',
    status: 'candidate',
    owner: 'Unassigned',
  },
  {
    slot: 'intel-lead',
    commanderSlug: 'nyra-veil',
    factionSlug: 'eclipse-syndicate',
    roleFocus: 'Scout denial and timing control',
    status: 'candidate',
    owner: 'Unassigned',
  },
  {
    slot: 'logistics-anchor',
    commanderSlug: 'general-varik',
    factionSlug: 'dominion-core',
    roleFocus: 'Logistics and reinforcement stability',
    status: 'candidate',
    owner: 'Unassigned',
  },
];

const defaultState: StrikeTeamState = {
  updatedAt: new Date(0).toISOString(),
  slots: defaultSlots.map((slot) => ({ ...slot, updatedAt: new Date(0).toISOString() })),
};

function getStrikeTeamFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'strike-team.json'),
  };
}

export async function readStrikeTeamState(): Promise<StrikeTeamState> {
  const { filePath } = getStrikeTeamFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as StrikeTeamState;
    const slots = Array.isArray(parsed.slots)
      ? parsed.slots.filter((slot) => typeof slot?.slot === 'string')
      : defaultState.slots;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      slots,
    };
  } catch {
    return defaultState;
  }
}

export async function saveStrikeTeamState(state: StrikeTeamState) {
  const { dataDir, filePath } = getStrikeTeamFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

function getCommanderName(slug: string) {
  return siteContent.commanders.find((commander) => commander.slug === slug)?.name ?? slug;
}

function getFactionName(slug: string) {
  return siteContent.factions.find((faction) => faction.slug === slug)?.name ?? slug;
}

export async function buildStrikeTeamBoard(leads: LeadRecord[]) {
  const state = await readStrikeTeamState();
  const scored = leads
    .map(scoreLead)
    .sort((a, b) => b.score - a.score || b.ts.localeCompare(a.ts));

  const assignedEmails = new Set(state.slots.map((slot) => slot.email).filter(Boolean));

  const candidates = scored
    .filter((lead) => !assignedEmails.has(lead.email))
    .slice(0, 12)
    .map((lead) => ({
      email: lead.email,
      score: lead.score,
      invitePriority: lead.invitePriority,
      factionLabel: lead.factionLabel,
      platformLabel: lead.platformLabel,
      playStyleLabel: lead.playStyleLabel,
      role: lead.allianceRole || 'unspecified',
      reasons: explainLeadScore(lead),
    }));

  const slots = state.slots.map((slot) => {
    const assignedLead = slot.email ? scored.find((lead) => lead.email === slot.email) : undefined;

    return {
      ...slot,
      commanderName: getCommanderName(slot.commanderSlug),
      factionName: getFactionName(slot.factionSlug),
      assignedLead: assignedLead
        ? {
            email: assignedLead.email,
            score: assignedLead.score,
            invitePriority: assignedLead.invitePriority,
            factionLabel: assignedLead.factionLabel,
            platformLabel: assignedLead.platformLabel,
            playStyleLabel: assignedLead.playStyleLabel,
            role: assignedLead.allianceRole || 'unspecified',
          }
        : null,
    };
  });

  const summary = {
    totalSlots: slots.length,
    assigned: slots.filter((slot) => slot.email).length,
    confirmed: slots.filter((slot) => slot.status === 'confirmed').length,
    open: slots.filter((slot) => !slot.email || slot.status === 'candidate').length,
    iosReadyCandidates: candidates.filter((lead) => lead.platformLabel === 'iPhone / iPad').length,
  };

  const coverage = siteContent.factions.map((faction) => ({
    faction: faction.name,
    assigned: slots.filter((slot) => slot.factionSlug === faction.slug && slot.email).length,
    candidatePool: candidates.filter((lead) => lead.factionLabel === faction.name).length,
  }));

  const actions = [
    summary.assigned < summary.totalSlots
      ? `${summary.totalSlots - summary.assigned} strike-team slots still need an assigned tester.`
      : 'Every strike-team slot now has an assigned tester.',
    summary.confirmed > 0
      ? `${summary.confirmed} strike-team slots are already confirmed for the next prototype wave.`
      : 'No strike-team slots are confirmed yet.',
    candidates[0]
      ? `${candidates[0].email} is the highest-scoring unassigned candidate right now.`
      : 'No unassigned candidates are available right now.',
  ];

  return {
    generatedAt: new Date().toISOString(),
    updatedAt: state.updatedAt,
    summary,
    coverage,
    actions,
    slots,
    candidates,
  };
}
