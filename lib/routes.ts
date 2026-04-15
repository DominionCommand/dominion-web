import { siteContent } from './content';

export type RouteEntry = {
  href: string;
  label: string;
  type: 'page' | 'api';
  group:
    | 'core'
    | 'ops'
    | 'content'
    | 'game'
    | 'growth'
    | 'support'
    | 'system';
  summary: string;
  dynamic?: boolean;
};

const staticPageRoutes: RouteEntry[] = [
  { href: '/', label: 'Home', type: 'page', group: 'core', summary: 'Top-level brand, game pitch, and operator surface launchpad.' },
  { href: '/about', label: 'About', type: 'page', group: 'core', summary: 'Project shape, product direction, and platform intent.' },
  { href: '/status', label: 'Status', type: 'page', group: 'system', summary: 'Merged system health, route inventory, and operator status.' },
  { href: '/dashboard', label: 'Dashboard', type: 'page', group: 'ops', summary: 'Executive operating snapshot for leads, war pressure, and readiness.' },
  { href: '/mission-control', label: 'Mission Control', type: 'page', group: 'ops', summary: 'Top-level command board for release, launch, war, and commerce.' },
  { href: '/command-center', label: 'Command Center', type: 'page', group: 'ops', summary: 'Season control surface for featured beats, events, and zones.' },
  { href: '/control-tower', label: 'Control Tower', type: 'page', group: 'ops', summary: 'Cross-functional execution lane for launch, funnel, and frontline pressure.' },
  { href: '/release-room', label: 'Release Room', type: 'page', group: 'ops', summary: 'Persisted release call, blockers, and next milestone tracking.' },
  { href: '/briefing', label: 'Briefing', type: 'page', group: 'ops', summary: 'Daily summary layer for current build and live-ops posture.' },
  { href: '/activity', label: 'Activity', type: 'page', group: 'system', summary: 'Shared operator activity log across command surfaces.' },
  { href: '/war-room', label: 'War Room', type: 'page', group: 'ops', summary: 'Frontline priorities, critical zones, and execution queue.' },
  { href: '/prototype', label: 'Prototype', type: 'page', group: 'game', summary: 'First playable loop scaffold and prototype direction.' },
  { href: '/launch-plan', label: 'Launch Plan', type: 'page', group: 'ops', summary: 'Launch checklist, windows, and owner-driven notes.' },
  { href: '/storefront', label: 'Storefront', type: 'page', group: 'growth', summary: 'Offer ladder, monetization timing, and event hooks.' },
  { href: '/signals', label: 'Signals', type: 'page', group: 'growth', summary: 'Funnel pressure and operator signal board.' },
  { href: '/recruitment', label: 'Recruitment', type: 'page', group: 'growth', summary: 'Recruitment campaign planning from lead and coverage gaps.' },
  { href: '/cohorts', label: 'Cohorts', type: 'page', group: 'growth', summary: 'Playtest wave planning, reserve queues, and gaps.' },
  { href: '/intake/[email]', label: 'Lead dossier', type: 'page', group: 'support', summary: 'Per-lead intake dossier across prereg, founder, invite, contact, and activity data.', dynamic: true },
  { href: '/founder-pipeline', label: 'Founder Pipeline', type: 'page', group: 'growth', summary: 'Founder lead CRM and follow-up pipeline.' },
  { href: '/strike-team', label: 'Strike Team', type: 'page', group: 'growth', summary: 'Assigned playtest roster and role slotting.' },
  { href: '/invite-queue', label: 'Invite Queue', type: 'page', group: 'growth', summary: 'Persisted invite staging, hold, and send state.' },
  { href: '/campaigns', label: 'Campaigns', type: 'page', group: 'growth', summary: 'Campaign briefs tied to events, commanders, and waves.' },
  { href: '/factions', label: 'Factions', type: 'page', group: 'game', summary: 'Faction overview and fantasy positioning.' },
  { href: '/commanders', label: 'Commanders', type: 'page', group: 'game', summary: 'Commander roster and role positioning.' },
  { href: '/alliances', label: 'Alliance HQ', type: 'page', group: 'game', summary: 'Alliance operations, logistics, and intake pressure.' },
  { href: '/world', label: 'World', type: 'page', group: 'game', summary: 'World zones, control state, and strategic value.' },
  { href: '/nexus', label: 'Nexus', type: 'page', group: 'game', summary: 'Connected graph of factions, commanders, zones, events, and public updates.' },
  { href: '/preregister', label: 'Preregister', type: 'page', group: 'growth', summary: 'Primary founder and early-interest capture surface.' },
  { href: '/thank-you', label: 'Thank You', type: 'page', group: 'growth', summary: 'Post-intake confirmation surface.' },
  { href: '/roadmap', label: 'Roadmap', type: 'page', group: 'core', summary: 'Current milestone path from web to prototype to launch.' },
  { href: '/contact', label: 'Contact', type: 'page', group: 'support', summary: 'Founder, press, support, and partner intake surface.' },
  { href: '/contact-queue', label: 'Contact Queue', type: 'page', group: 'support', summary: 'Persisted inbound triage board for public contact requests.' },
  { href: '/playtest', label: 'Playtest', type: 'page', group: 'growth', summary: 'Playtest qualification and role capture flow.' },
  { href: '/news', label: 'News', type: 'page', group: 'content', summary: 'Build updates and public progress notes.' },
  { href: '/media', label: 'Media', type: 'page', group: 'content', summary: 'Media inventory for art, UI, and trailer-ready assets.' },
  { href: '/public-kit', label: 'Public Kit', type: 'page', group: 'content', summary: 'Single public-facing story hub for press, media, and latest updates.' },
  { href: '/events', label: 'Events', type: 'page', group: 'game', summary: 'Event cadence, windows, and reward framing.' },
  { href: '/faq', label: 'FAQ', type: 'page', group: 'support', summary: 'Public answers for launch, platform, and alliance questions.' },
  { href: '/press', label: 'Press', type: 'page', group: 'content', summary: 'Boilerplate, press contact, and asset readiness.' },
  { href: '/intel', label: 'Intel', type: 'page', group: 'ops', summary: 'Persisted watchlist for build, funnel, and operator signals.' },
  { href: '/ops', label: 'Ops', type: 'page', group: 'ops', summary: 'Internal operating view for leads, cohorts, and handoffs.' },
  { href: '/routes', label: 'Routes', type: 'page', group: 'system', summary: 'Human-readable directory of website and API surfaces.' },
];

const staticApiRoutes: RouteEntry[] = [
  { href: '/api/health', label: 'Health API', type: 'api', group: 'system', summary: 'Basic liveness check.' },
  { href: '/api/status', label: 'Status API', type: 'api', group: 'system', summary: 'Merged status snapshot for surfaces, leads, and activity.' },
  { href: '/api/routes', label: 'Routes API', type: 'api', group: 'system', summary: 'Structured route inventory with counts and metadata.' },
  { href: '/api/meta', label: 'Meta API', type: 'api', group: 'system', summary: 'Project meta payload for site and platform information.' },
  { href: '/api/site-content', label: 'Site Content API', type: 'api', group: 'content', summary: 'Structured content model for pages and dynamic routes.' },
  { href: '/api/briefing', label: 'Briefing API', type: 'api', group: 'ops', summary: 'Command snapshot for current day and build posture.' },
  { href: '/api/dashboard', label: 'Dashboard API', type: 'api', group: 'ops', summary: 'Executive dashboard payload.' },
  { href: '/api/mission-control', label: 'Mission Control API', type: 'api', group: 'ops', summary: 'Top-level operating picture for command and launch.' },
  { href: '/api/operations', label: 'Operations API', type: 'api', group: 'ops', summary: 'Internal operating snapshot for studio execution.' },
  { href: '/api/season-control', label: 'Season Control API', type: 'api', group: 'ops', summary: 'Read and update season state and featured hooks.' },
  { href: '/api/control-tower', label: 'Control Tower API', type: 'api', group: 'ops', summary: 'Cross-functional launch and execution state.' },
  { href: '/api/release-room', label: 'Release Room API', type: 'api', group: 'ops', summary: 'Persist release decisions, notes, and readiness.' },
  { href: '/api/war-room', label: 'War Room API', type: 'api', group: 'ops', summary: 'Frontline queue, pressure, and execution priorities.' },
  { href: '/api/activity', label: 'Activity API', type: 'api', group: 'system', summary: 'Shared operator activity stream.' },
  { href: '/api/signals', label: 'Signals API', type: 'api', group: 'growth', summary: 'Funnel pressure and growth signals.' },
  { href: '/api/launch-plan', label: 'Launch Plan API', type: 'api', group: 'ops', summary: 'Persisted launch plan state and checklist.' },
  { href: '/api/storefront', label: 'Storefront API', type: 'api', group: 'growth', summary: 'Offer timing and storefront state.' },
  { href: '/api/recruitment', label: 'Recruitment API', type: 'api', group: 'growth', summary: 'Recruitment board and campaign priorities.' },
  { href: '/api/cohorts', label: 'Cohorts API', type: 'api', group: 'growth', summary: 'Playtest cohort planning payload.' },
  { href: '/api/leads/[email]', label: 'Lead dossier API', type: 'api', group: 'support', summary: 'Per-lead intake dossier payload.', dynamic: true },
  { href: '/api/founder-pipeline', label: 'Founder Pipeline API', type: 'api', group: 'growth', summary: 'Founder follow-up pipeline state.' },
  { href: '/api/strike-team', label: 'Strike Team API', type: 'api', group: 'growth', summary: 'Assigned roster and role slots for testing.' },
  { href: '/api/invite-queue', label: 'Invite Queue API', type: 'api', group: 'growth', summary: 'Persisted invite staging and sends.' },
  { href: '/api/intake', label: 'Intake API', type: 'api', group: 'support', summary: 'Combined prereg, playtest, and contact intake view.' },
  { href: '/api/leads', label: 'Leads API', type: 'api', group: 'growth', summary: 'Lead summary counts and recent intake overview.' },
  { href: '/api/contact', label: 'Contact API', type: 'api', group: 'support', summary: 'Persist public contact requests.' },
  { href: '/api/preregister', label: 'Preregister API', type: 'api', group: 'growth', summary: 'Persist founder preregistration submissions.' },
  { href: '/api/playtest', label: 'Playtest API', type: 'api', group: 'growth', summary: 'Persist playtest qualification submissions.' },
  { href: '/api/prototype', label: 'Prototype API', type: 'api', group: 'game', summary: 'Prototype loop snapshot and implementation hooks.' },
  { href: '/api/campaigns', label: 'Campaigns API', type: 'api', group: 'growth', summary: 'Campaign planning data.' },
  { href: '/api/alliances', label: 'Alliances API', type: 'api', group: 'game', summary: 'Alliance HQ status and operational view.' },
  { href: '/api/world', label: 'World API', type: 'api', group: 'game', summary: 'World zone listing and control state.' },
  { href: '/api/nexus', label: 'Nexus API', type: 'api', group: 'game', summary: 'Normalized relationship graph across factions, commanders, zones, events, and news.' },
  { href: '/api/factions', label: 'Factions API', type: 'api', group: 'game', summary: 'Faction listing and summaries.' },
  { href: '/api/commanders', label: 'Commanders API', type: 'api', group: 'game', summary: 'Commander listing and role metadata.' },
  { href: '/api/events', label: 'Events API', type: 'api', group: 'game', summary: 'Event listing and live cadence.' },
  { href: '/api/news', label: 'News API', type: 'api', group: 'content', summary: 'News listing and article payloads.' },
  { href: '/api/faq', label: 'FAQ API', type: 'api', group: 'support', summary: 'FAQ payload for public surfaces.' },
  { href: '/api/press', label: 'Press API', type: 'api', group: 'content', summary: 'Press kit metadata and contact.' },
  { href: '/api/media', label: 'Media API', type: 'api', group: 'content', summary: 'Media asset inventory.' },
  { href: '/api/intel-watch', label: 'Intel Watch API', type: 'api', group: 'ops', summary: 'Persist watch posture, item state, and intel notes.' },
  { href: '/api/roadmap', label: 'Roadmap API', type: 'api', group: 'ops', summary: 'Live roadmap state, phase progress, and operator overrides.' },
];

function uniqueByHref(entries: RouteEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.href, entry])).values());
}

export function getPageRoutes() {
  const dynamicPages: RouteEntry[] = [
    ...siteContent.events.map((item) => ({ href: `/campaigns/${item.slug}`, label: `${item.name} campaign packet`, type: 'page' as const, group: 'growth' as const, summary: `${item.name} campaign execution packet.`, dynamic: true })),
    ...siteContent.factions.map((item) => ({ href: `/factions/${item.slug}`, label: `${item.name} faction`, type: 'page' as const, group: 'game' as const, summary: `${item.name} faction detail page.`, dynamic: true })),
    ...siteContent.commanders.map((item) => ({ href: `/commanders/${item.slug}`, label: `${item.name} commander`, type: 'page' as const, group: 'game' as const, summary: `${item.name} commander detail page.`, dynamic: true })),
    ...siteContent.worldZones.map((item) => ({ href: `/world/${item.slug}`, label: `${item.name} world zone`, type: 'page' as const, group: 'game' as const, summary: `${item.name} world-zone detail page.`, dynamic: true })),
    ...siteContent.events.map((item) => ({ href: `/events/${item.slug}`, label: `${item.name} event`, type: 'page' as const, group: 'game' as const, summary: `${item.name} event detail page.`, dynamic: true })),
    ...siteContent.news.map((item) => ({ href: `/news/${item.slug}`, label: item.title, type: 'page' as const, group: 'content' as const, summary: `${item.tag} news detail page.`, dynamic: true })),
  ];

  return uniqueByHref([...staticPageRoutes, ...dynamicPages]);
}

export function getApiRoutes() {
  const dynamicApis: RouteEntry[] = [
    ...siteContent.events.map((item) => ({ href: `/api/campaigns/${item.slug}`, label: `${item.name} campaign API`, type: 'api' as const, group: 'growth' as const, summary: `${item.name} campaign packet payload.`, dynamic: true })),
    ...siteContent.factions.map((item) => ({ href: `/api/factions/${item.slug}`, label: `${item.name} faction API`, type: 'api' as const, group: 'game' as const, summary: `${item.name} faction detail payload.`, dynamic: true })),
    ...siteContent.commanders.map((item) => ({ href: `/api/commanders/${item.slug}`, label: `${item.name} commander API`, type: 'api' as const, group: 'game' as const, summary: `${item.name} commander detail payload.`, dynamic: true })),
    ...siteContent.worldZones.map((item) => ({ href: `/api/world/${item.slug}`, label: `${item.name} world API`, type: 'api' as const, group: 'game' as const, summary: `${item.name} world-zone detail payload.`, dynamic: true })),
    ...siteContent.events.map((item) => ({ href: `/api/events/${item.slug}`, label: `${item.name} event API`, type: 'api' as const, group: 'game' as const, summary: `${item.name} event detail payload.`, dynamic: true })),
    ...siteContent.news.map((item) => ({ href: `/api/news/${item.slug}`, label: `${item.title} API`, type: 'api' as const, group: 'content' as const, summary: `${item.title} news detail payload.`, dynamic: true })),
  ];

  return uniqueByHref([...staticApiRoutes, ...dynamicApis]);
}

export function getAllRoutes() {
  return [...getPageRoutes(), ...getApiRoutes()];
}

export function buildRouteInventory() {
  const pages = getPageRoutes();
  const api = getApiRoutes();
  const all = [...pages, ...api];
  const groups = all.reduce<Record<string, number>>((acc, route) => {
    acc[route.group] = (acc[route.group] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      total: all.length,
      pages: pages.length,
      api: api.length,
      dynamic: all.filter((route) => route.dynamic).length,
      static: all.filter((route) => !route.dynamic).length,
    },
    groups,
    pages,
    api,
  };
}
