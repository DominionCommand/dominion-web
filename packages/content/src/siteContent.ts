export type Faction = {
  slug: string;
  name: string;
  summary: string;
  fantasy: string;
  strengths: string[];
  signatureUnits: string[];
};

export type Commander = {
  slug: string;
  name: string;
  factionSlug: string;
  faction: string;
  role: string;
  summary: string;
  specialty: string;
  traits: string[];
};

export type NewsItem = {
  slug: string;
  title: string;
  body: string;
  date: string;
  tag: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type MediaItem = {
  slug: string;
  title: string;
  body: string;
  type: 'key-art' | 'screenshot' | 'trailer' | 'ui';
  status: 'planned' | 'in-progress' | 'ready';
};

export type RoadmapItem = {
  phase: string;
  title: string;
  body: string;
  status: 'active' | 'next' | 'planned';
};

export type WorldZone = {
  slug: string;
  name: string;
  control: 'contested' | 'dominion' | 'rebellion' | 'syndicate' | 'neutral';
  pressure: 'low' | 'medium' | 'high';
  objective: string;
  reward: string;
  strategicValue: string;
  recommendedCommanderSlug: string;
  linkedEventSlug?: string;
};

export type AllianceFeature = {
  slug: string;
  title: string;
  summary: string;
  impact: string;
};

export type SeasonBeat = {
  phase: string;
  focus: string;
  body: string;
};

export type EventCampaign = {
  slug: string;
  name: string;
  cadence: string;
  window: string;
  objective: string;
  reward: string;
  status: 'active' | 'queued' | 'planned';
  linkedZoneSlug?: string;
  featuredCommanderSlug?: string;
  summary: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type PressAsset = {
  slug: string;
  title: string;
  type: 'logo' | 'key-art' | 'fact-sheet' | 'screens' | 'trailer';
  status: 'available' | 'in-progress';
  summary: string;
};

export const siteContent = {
  hero: {
    eyebrow: 'Dominion Nexus',
    title: 'Command the war. Rule the Dominion.',
    description:
      'A large-scale mobile strategy game where elite commanders, alliance warfare, ruthless progression, and seasonal conquest decide who controls the map.',
  },
  factions: [
    {
      slug: 'dominion-core',
      name: 'The Dominion Core',
      summary: 'Disciplined expansion, elite command, industrial war power.',
      fantasy: 'A machine-state empire that overwhelms rivals through fortified growth, efficient logistics, and superior battlefield discipline.',
      strengths: ['Base fortification', 'Resource scaling', 'Frontline command'],
      signatureUnits: ['Aegis Guard', 'Siegebreaker Column', 'Helios Drone Wing'],
    },
    {
      slug: 'iron-rebellion',
      name: 'The Iron Rebellion',
      summary: 'Momentum, aggression, salvage, and relentless pressure.',
      fantasy: 'A war culture built around smash-and-take momentum, rapid assaults, and recycling battlefield destruction into fresh power.',
      strengths: ['Raid pressure', 'Fast rebuilds', 'Siege aggression'],
      signatureUnits: ['Scrapfire Bruisers', 'Ravager Bikes', 'Breakline Rams'],
    },
    {
      slug: 'eclipse-syndicate',
      name: 'The Eclipse Syndicate',
      summary: 'Sabotage, intelligence, manipulation, and precision force.',
      fantasy: 'A covert network that bends wars before they begin through intel denial, timing traps, and highly efficient strikes.',
      strengths: ['Recon control', 'Disruption', 'Precision burst'],
      signatureUnits: ['Shade Operatives', 'Nullcasters', 'Ghost Lancer Cells'],
    },
  ] satisfies Faction[],
  commanders: [
    {
      slug: 'general-varik',
      name: 'General Varik',
      factionSlug: 'dominion-core',
      faction: 'The Dominion Core',
      role: 'Frontline Command',
      summary: 'A disciplined war architect built for pressure and control.',
      specialty: 'Turns defended territory into a force multiplier for alliance pushes and hard-point wars.',
      traits: ['Fortified formations', 'Defensive scaling', 'Siege endurance'],
    },
    {
      slug: 'kaine-drex',
      name: 'Kaine Drex',
      factionSlug: 'iron-rebellion',
      faction: 'The Iron Rebellion',
      role: 'Siege Assault',
      summary: 'Breaks defenses fast and turns chaos into momentum.',
      specialty: 'Converts successful assaults into tempo spikes that let alliances chain attacks before enemies can stabilize.',
      traits: ['Wall-break burst', 'Salvage loops', 'Rally damage'],
    },
    {
      slug: 'nyra-veil',
      name: 'Nyra Veil',
      factionSlug: 'eclipse-syndicate',
      faction: 'The Eclipse Syndicate',
      role: 'Control / Sabotage',
      summary: 'Wins wars by shaping the battlefield before the first strike.',
      specialty: 'Weakens enemy formations, scrambles intel, and creates tactical openings for precision kill windows.',
      traits: ['Debuff timing', 'Scout denial', 'Ambush setup'],
    },
  ] satisfies Commander[],
  allianceFeatures: [
    {
      slug: 'war-council',
      title: 'War Council Ops',
      summary: 'Alliance leadership stages objectives, tags pressure lanes, and aligns commanders around timed campaigns.',
      impact: 'Turns loose social groups into coordinated war machines with shared targets and rally discipline.',
    },
    {
      slug: 'shared-logistics',
      title: 'Shared Logistics',
      summary: 'Members feed frontline pushes with convoy boosts, rebuild support, and territory-linked economy bonuses.',
      impact: 'Makes alliance membership materially stronger than solo play and reinforces long-term retention.',
    },
    {
      slug: 'citadel-raids',
      title: 'Citadel Raids',
      summary: 'High-value strongholds require layered rallies, role clarity, and faction-specific counterplay.',
      impact: 'Creates prestige moments, replayable competition, and monetizable urgency without needing full PvE campaigns.',
    },
  ] satisfies AllianceFeature[],
  worldZones: [
    {
      slug: 'solgate-bastion',
      name: 'Solgate Bastion',
      control: 'dominion',
      pressure: 'high',
      objective: 'Anchor the western war lane and reinforce shielded supply routes.',
      reward: 'Fortification speed and alliance defense buffs',
      strategicValue: 'Solgate is the safest production spine on the map. Whoever owns it can absorb losses, reinforce adjacent fronts, and extend alliance hold times.',
      recommendedCommanderSlug: 'general-varik',
    },
    {
      slug: 'ashfall-rim',
      name: 'Ashfall Rim',
      control: 'rebellion',
      pressure: 'medium',
      objective: 'Raid exposed convoy routes and convert wreckage into salvage power spikes.',
      reward: 'Siege materials and rebuild acceleration',
      strategicValue: 'Ashfall turns aggression into economy. It is the best place to prove raid pressure, salvage loops, and rebound pacing in early alliance wars.',
      recommendedCommanderSlug: 'kaine-drex',
      linkedEventSlug: 'ashfall-salvage-rush',
    },
    {
      slug: 'veil-crossing',
      name: 'Veil Crossing',
      control: 'syndicate',
      pressure: 'high',
      objective: 'Disrupt intel visibility and create ambush windows around neutral objectives.',
      reward: 'Recon denial and ambush damage bonuses',
      strategicValue: 'Veil Crossing defines the information war. It creates a reason for scouting, deception, and precision timing to matter before a fight even starts.',
      recommendedCommanderSlug: 'nyra-veil',
      linkedEventSlug: 'veil-blackout',
    },
    {
      slug: 'crown-of-null',
      name: 'Crown of Null',
      control: 'contested',
      pressure: 'high',
      objective: 'Seasonal prestige objective with server-wide scoring and alliance ownership swings.',
      reward: 'Season banner, premium resources, and commander shards',
      strategicValue: 'Crown of Null is the capstone prestige surface. It is where the game proves its alliance leadership fantasy, comeback pressure, and seasonal climax.',
      recommendedCommanderSlug: 'general-varik',
      linkedEventSlug: 'crown-of-null-war',
    },
  ] satisfies WorldZone[],
  seasonBeats: [
    {
      phase: 'Opening Conflict',
      focus: 'Expansion and route control',
      body: 'Players establish their first command footprint, lock logistics lanes, and decide how aggressively to contest nearby neutral zones.',
    },
    {
      phase: 'Alliance Escalation',
      focus: 'Rallies and hard-point warfare',
      body: 'Alliance-level timing, supply pressure, and counter-rally coordination become the main skill expression layer.',
    },
    {
      phase: 'Dominion Reckoning',
      focus: 'Seasonal crown objective',
      body: 'The final map state converges around one prestige objective that decides season bragging rights, conversion urgency, and reset narratives.',
    },
  ] satisfies SeasonBeat[],
  events: [
    {
      slug: 'crown-of-null-war',
      name: 'Crown of Null War',
      cadence: 'Weekly prestige flashpoint',
      window: 'Friday, 19:00 to 21:00 EST',
      objective: 'Contest the central crown objective through timed rallies, territory locks, and alliance score swings.',
      reward: 'Founder-era prestige banner, commander shards, premium resource crates',
      status: 'active',
      linkedZoneSlug: 'crown-of-null',
      featuredCommanderSlug: 'general-varik',
      summary: 'The weekly flagship event for proving the seasonal prestige loop. This is the clearest expression of timed alliance warfare and map ownership drama.',
    },
    {
      slug: 'ashfall-salvage-rush',
      name: 'Ashfall Salvage Rush',
      cadence: 'Midweek economy spike',
      window: 'Tuesday, 18:00 to 22:00 EST',
      objective: 'Chain raids into salvage routes and see which faction converts battlefield wreckage into power fastest.',
      reward: 'Rebuild acceleration, siege materials, alliance logistics boosts',
      status: 'queued',
      linkedZoneSlug: 'ashfall-rim',
      featuredCommanderSlug: 'kaine-drex',
      summary: 'A shorter economy-and-aggression event built to make raid loops, rebuild velocity, and faction asymmetry immediately legible.',
    },
    {
      slug: 'veil-blackout',
      name: 'Veil Blackout',
      cadence: 'Faction control disruption event',
      window: 'Prototype queue',
      objective: 'Force scout denial and intel warfare into a readable seasonal pressure event for Syndicate-led play.',
      reward: 'Recon denial buffs, ambush damage windows, covert cosmetics',
      status: 'planned',
      linkedZoneSlug: 'veil-crossing',
      featuredCommanderSlug: 'nyra-veil',
      summary: 'A control-focused event shell that gives the Syndicate a distinct strategic identity instead of just another damage race.',
    },
  ] satisfies EventCampaign[],
  faq: [
    {
      question: 'What is Dominion Nexus?',
      answer: 'Dominion Nexus is a mobile-first war strategy game focused on commanders, alliance rivalry, and seasonal conquest across a persistent world map.',
    },
    {
      question: 'Is the game live yet?',
      answer: 'Not yet. The current build is a prereg, content, and operational scaffold that is feeding into a focused prototype and playtest pipeline.',
    },
    {
      question: 'What platforms are planned?',
      answer: 'The current implementation is centered on iPhone and iPad, with lead capture already tagging platform readiness for future invite waves.',
    },
    {
      question: 'How do alliances matter?',
      answer: 'Alliances are a core retention and prestige layer. Shared logistics, war council objectives, and rally timing are being treated as first-class systems.',
    },
  ] satisfies FaqItem[],
  press: {
    contactEmail: 'press@playdominionnexus.com',
    boilerplate:
      'Dominion Nexus is an original mobile war strategy IP built around elite commanders, alliance coordination, and seasonal conquest pressure.',
    assets: [
      {
        slug: 'brand-marks',
        title: 'Brand marks',
        type: 'logo',
        status: 'available',
        summary: 'Primary wordmark and dark-background lockups for previews, decks, and store-facing mockups.',
      },
      {
        slug: 'alpha-key-art',
        title: 'Alpha key art',
        type: 'key-art',
        status: 'in-progress',
        summary: 'Hero image set built around faction conflict and large-scale command fantasy.',
      },
      {
        slug: 'press-fact-sheet',
        title: 'Fact sheet',
        type: 'fact-sheet',
        status: 'available',
        summary: 'Platform, genre, core pillars, and current build-stage summary for press and partner outreach.',
      },
    ] satisfies PressAsset[],
  },
  news: [
    {
      slug: 'world-surface-online',
      title: 'World-state surface online',
      body: 'Dominion Nexus now exposes world-zone control, alliance loop scaffolds, and seasonal beats across both the website and APIs.',
      date: '2026-04-08',
      tag: 'Build Progress',
      ctaLabel: 'Open world state',
      ctaHref: '/world',
    },
    {
      slug: 'lead-funnel-online',
      title: 'Lead funnel online',
      body: 'Founder prereg capture is live with local persistence, duplicate protection, and count reporting for quick validation.',
      date: '2026-04-08',
      tag: 'Growth',
      ctaLabel: 'Open playtest intake',
      ctaHref: '/playtest',
    },
    {
      slug: 'prototype-track-defined',
      title: 'Prototype track defined',
      body: 'The roadmap is now shaped around a web-to-prototype path focused on product surfaces, data flow, and live implementation scaffolds.',
      date: '2026-04-08',
      tag: 'Roadmap',
      ctaLabel: 'Open prototype',
      ctaHref: '/prototype',
    },
  ] satisfies NewsItem[],
  media: [
    {
      slug: 'key-art-alpha',
      title: 'Key art alpha frame',
      body: 'Primary key art slot for faction-driven launch creative and store-facing reveal assets.',
      type: 'key-art',
      status: 'in-progress',
    },
    {
      slug: 'command-screen-ui',
      title: 'Command screen UI preview',
      body: 'Reserved for first in-engine command, roster, and battle-prep interface captures.',
      type: 'ui',
      status: 'planned',
    },
    {
      slug: 'world-map-screenshot',
      title: 'World map screenshot',
      body: 'Reserved for persistent war-map imagery highlighting conflict lanes, objectives, and alliance pressure.',
      type: 'screenshot',
      status: 'planned',
    },
  ] satisfies MediaItem[],
  roadmap: [
    {
      phase: 'Phase 1',
      title: 'Web + prereg foundation',
      body: 'Landing pages, structured content, lead capture, route inventory, and operational APIs.',
      status: 'active',
    },
    {
      phase: 'Phase 2',
      title: 'Prototype scaffolds',
      body: 'Gameplay loop shell, commander progression hooks, and first backend-backed live data contracts.',
      status: 'next',
    },
    {
      phase: 'Phase 3',
      title: 'Soft-launch readiness',
      body: 'Analytics, monetization surfaces, alliance operations, and live-ops controls.',
      status: 'planned',
    },
  ] satisfies RoadmapItem[],
  playtest: {
    currentState: 'Web foundation and lead funnel are live. The next testing layer is a narrow gameplay prototype with faction, commander, alliance, and world-objective loop validation.',
    goals: [
      'Validate commander fantasy clarity',
      'Measure faction appeal before art lock',
      'Test prereg-to-playtest conversion flow',
      'Test alliance objective comprehension and seasonal urgency',
    ],
  },
};

export function getFactionBySlug(slug: string) {
  return siteContent.factions.find((faction) => faction.slug === slug);
}

export function getCommanderBySlug(slug: string) {
  return siteContent.commanders.find((commander) => commander.slug === slug);
}

export function getFactionCommanders(factionSlug: string) {
  return siteContent.commanders.filter((commander) => commander.factionSlug === factionSlug);
}

export function getWorldZoneBySlug(slug: string) {
  return siteContent.worldZones.find((zone) => zone.slug === slug);
}

export function getEventBySlug(slug: string) {
  return siteContent.events.find((event) => event.slug === slug);
}

export function getNewsItemBySlug(slug: string) {
  return siteContent.news.find((item) => item.slug === slug);
}
