import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { siteContent } from './content';
import { buildPlaytestSummary, scoreLead } from './funnel';
import type { LeadRecord } from './leads';
import { summarizeLeads } from './leads';
import { buildSignalsSnapshot } from './signals';

export type StorefrontNote = {
  id: string;
  text: string;
  createdAt: string;
  status: 'open' | 'done';
};

export type StorefrontState = {
  status: 'draft' | 'active' | 'watch';
  owner: string;
  featuredOfferSlug: string;
  updatedAt: string;
  notes: StorefrontNote[];
};

const defaultState: StorefrontState = {
  status: 'draft',
  owner: 'Monetization ops',
  featuredOfferSlug: 'founder-command-pack',
  updatedAt: new Date(0).toISOString(),
  notes: [],
};

const offerCatalog = [
  {
    slug: 'founder-command-pack',
    name: 'Founder Command Pack',
    segment: 'founder',
    trigger: 'First 72 hours after prereg conversion',
    value: 'Founder badge, premium crates, early commander shards',
    priceBand: '$19.99',
    objective: 'Convert high-intent founder leads before the first playtest invite wave.',
  },
  {
    slug: 'alliance-war-chest',
    name: 'Alliance War Chest',
    segment: 'alliance',
    trigger: 'Alliance joins or rally role selection',
    value: 'Shared logistics boosts, rally stamina, rebuild materials',
    priceBand: '$29.99',
    objective: 'Turn social coordination into spend without hiding power fantasy behind a hard wall.',
  },
  {
    slug: 'ashfall-siege-bundle',
    name: 'Ashfall Siege Bundle',
    segment: 'raider',
    trigger: 'Ashfall Salvage Rush participation or Iron Rebellion preference',
    value: 'Siege materials, salvage accelerants, raid speedups',
    priceBand: '$9.99',
    objective: 'Match fast aggression players with a mid-ticket event bundle tied to visible map pressure.',
  },
  {
    slug: 'crown-ascension-pass',
    name: 'Crown Ascension Pass',
    segment: 'season',
    trigger: 'Season countdown and Crown of Null War week',
    value: 'Prestige track, exclusive cosmetics, end-of-season resource reserve',
    priceBand: '$14.99',
    objective: 'Anchor the seasonal monetization layer around prestige, not raw stats inflation.',
  },
] as const;

function getStorefrontFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'storefront.json'),
  };
}

export async function readStorefrontState(): Promise<StorefrontState> {
  const { filePath } = getStorefrontFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StorefrontState>;

    return {
      ...defaultState,
      ...parsed,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is StorefrontNote => Boolean(note && typeof note.id === 'string' && typeof note.text === 'string'))
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveStorefrontState(state: StorefrontState) {
  const { dataDir, filePath } = getStorefrontFilePath();
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildStorefrontSnapshot(leads: LeadRecord[]) {
  const state = await readStorefrontState();
  const leadSummary = summarizeLeads(leads);
  const playtest = buildPlaytestSummary(leads);
  const signals = await buildSignalsSnapshot(leads);
  const scoredLeads = leads.map((lead) => scoreLead(lead));
  const activeEvent = siteContent.events.find((event) => event.status === 'active') ?? null;

  const segmentCounts = {
    founder: scoredLeads.filter((lead) => lead.wave === 'wave-0-founder').length,
    alliance: scoredLeads.filter((lead) => lead.allianceRole !== 'unassigned').length,
    raider: scoredLeads.filter((lead) => lead.playStyle === 'raider').length,
    season: scoredLeads.filter((lead) => lead.invitePriority === 'priority').length,
  };

  const offers = offerCatalog.map((offer) => ({
    ...offer,
    targetableLeads:
      offer.segment === 'founder'
        ? segmentCounts.founder
        : offer.segment === 'alliance'
          ? segmentCounts.alliance
          : offer.segment === 'raider'
            ? segmentCounts.raider
            : segmentCounts.season,
    status: state.featuredOfferSlug === offer.slug ? 'featured' : 'queued',
  }));

  const featuredOffer = offers.find((offer) => offer.slug === state.featuredOfferSlug) ?? offers[0];
  const weakestFaction = playtest.factionCoverage.slice().sort((a, b) => a.leads - b.leads || a.name.localeCompare(b.name))[0] ?? null;

  return {
    generatedAt: new Date().toISOString(),
    state,
    summary: {
      status: state.status,
      owner: state.owner,
      featuredOffer,
      totalLeads: leadSummary.total,
      founderReady: segmentCounts.founder,
      allianceReady: segmentCounts.alliance,
      raiderReady: segmentCounts.raider,
      seasonalPriority: segmentCounts.season,
      activeEvent,
      weakestFaction,
      leadVelocityDelta: signals.metrics.leadVelocityDelta,
    },
    offers,
    merchSignals: [
      {
        slug: 'founder-conversion',
        title: `${segmentCounts.founder} founder-ready leads can see a conversion offer now`,
        detail: `${playtest.byWave['wave-0-founder']} leads already qualify for the founder wave, making a founder pack the clearest monetization bridge before launch.`,
      },
      {
        slug: 'alliance-pressure',
        title: `${segmentCounts.alliance} alliance-role leads justify a social bundle`,
        detail: 'Alliance-tagged players already form a meaningful segment for a war chest or logistics bundle tied to social retention.',
      },
      {
        slug: 'event-anchor',
        title: activeEvent ? `${activeEvent.name} is the live store hook` : 'No live event hook selected yet',
        detail: activeEvent
          ? `${activeEvent.window} gives the store a clean timing anchor for an event pass or timed bundle.`
          : 'Define the first event-linked offer trigger before scaling spend.',
      },
      {
        slug: 'coverage-gap',
        title: weakestFaction ? `${weakestFaction.name} needs offer-aware messaging support` : 'Faction demand is balanced',
        detail: weakestFaction
          ? `Only ${weakestFaction.leads} tagged leads are tied to this faction right now, so its themed offers need stronger top-of-funnel support.`
          : 'Faction interest is balanced enough to support broad offer exposure.',
      },
    ],
    recommendations: [
      `Feature ${featuredOffer.name} until a stronger live-op conversion hook appears.`,
      activeEvent
        ? `Tie the next timed offer beat to ${activeEvent.name} and mirror it across event, war-room, and homepage copy.`
        : 'Pick the first live event anchor before finalizing the timed offer ladder.',
      signals.recommendedActions[0],
    ],
    notes: state.notes.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
  };
}
