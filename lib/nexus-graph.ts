import { getCommanderBySlug, getEventBySlug, getFactionCommanders, getNewsItemBySlug, getWorldZoneBySlug, siteContent } from './content';

export type NexusNode = {
  id: string;
  type: 'faction' | 'commander' | 'zone' | 'event' | 'news';
  slug: string;
  label: string;
  href: string;
  detail: string;
  meta?: string;
};

export type NexusEdge = {
  from: string;
  to: string;
  type: 'commands' | 'controls' | 'anchors' | 'features' | 'supports' | 'reports';
  label: string;
};

export function buildNexusGraph() {
  const nodes: NexusNode[] = [];
  const edges: NexusEdge[] = [];

  siteContent.factions.forEach((faction) => {
    nodes.push({
      id: `faction:${faction.slug}`,
      type: 'faction',
      slug: faction.slug,
      label: faction.name,
      href: `/factions/${faction.slug}`,
      detail: faction.summary,
      meta: faction.strengths.join(' · '),
    });
  });

  siteContent.commanders.forEach((commander) => {
    nodes.push({
      id: `commander:${commander.slug}`,
      type: 'commander',
      slug: commander.slug,
      label: commander.name,
      href: `/commanders/${commander.slug}`,
      detail: commander.summary,
      meta: `${commander.faction} · ${commander.role}`,
    });

    edges.push({
      from: `faction:${commander.factionSlug}`,
      to: `commander:${commander.slug}`,
      type: 'commands',
      label: commander.role,
    });
  });

  siteContent.worldZones.forEach((zone) => {
    nodes.push({
      id: `zone:${zone.slug}`,
      type: 'zone',
      slug: zone.slug,
      label: zone.name,
      href: `/world/${zone.slug}`,
      detail: zone.objective,
      meta: `${zone.control} control · ${zone.pressure} pressure`,
    });

    const commander = getCommanderBySlug(zone.recommendedCommanderSlug);
    if (commander) {
      edges.push({
        from: `commander:${commander.slug}`,
        to: `zone:${zone.slug}`,
        type: 'controls',
        label: 'Recommended frontline',
      });
      edges.push({
        from: `faction:${commander.factionSlug}`,
        to: `zone:${zone.slug}`,
        type: 'anchors',
        label: `${zone.control} pressure lane`,
      });
    }
  });

  siteContent.events.forEach((event) => {
    nodes.push({
      id: `event:${event.slug}`,
      type: 'event',
      slug: event.slug,
      label: event.name,
      href: `/events/${event.slug}`,
      detail: event.summary,
      meta: `${event.status} · ${event.window}`,
    });

    if (event.linkedZoneSlug) {
      edges.push({
        from: `event:${event.slug}`,
        to: `zone:${event.linkedZoneSlug}`,
        type: 'supports',
        label: 'Linked zone',
      });
    }

    if (event.featuredCommanderSlug) {
      edges.push({
        from: `commander:${event.featuredCommanderSlug}`,
        to: `event:${event.slug}`,
        type: 'features',
        label: 'Featured commander',
      });
    }
  });

  siteContent.news.forEach((item) => {
    nodes.push({
      id: `news:${item.slug}`,
      type: 'news',
      slug: item.slug,
      label: item.title,
      href: `/news/${item.slug}`,
      detail: item.body,
      meta: `${item.tag} · ${item.date}`,
    });

    const relatedHref = item.ctaHref ?? '';
    const relatedFaction = siteContent.factions.find((entry) => relatedHref === `/factions/${entry.slug}`);
    const relatedCommander = siteContent.commanders.find((entry) => relatedHref === `/commanders/${entry.slug}`);
    const relatedZone = siteContent.worldZones.find((entry) => relatedHref === `/world/${entry.slug}`);
    const relatedEvent = siteContent.events.find((entry) => relatedHref === `/events/${entry.slug}`);
    const relatedNews = siteContent.news.find((entry) => relatedHref === `/news/${entry.slug}`);

    const target = relatedFaction
      ? `faction:${relatedFaction.slug}`
      : relatedCommander
        ? `commander:${relatedCommander.slug}`
        : relatedZone
          ? `zone:${relatedZone.slug}`
          : relatedEvent
            ? `event:${relatedEvent.slug}`
            : relatedNews
              ? `news:${relatedNews.slug}`
              : null;

    if (target) {
      edges.push({
        from: `news:${item.slug}`,
        to: target,
        type: 'reports',
        label: 'Points to live surface',
      });
    }
  });

  const factionSectors = siteContent.factions.map((faction) => {
    const commanders = getFactionCommanders(faction.slug);
    const zones = siteContent.worldZones.filter((zone) => {
      const commander = getCommanderBySlug(zone.recommendedCommanderSlug);
      return commander?.factionSlug === faction.slug;
    });
    const events = siteContent.events.filter((event) => {
      const commander = event.featuredCommanderSlug ? getCommanderBySlug(event.featuredCommanderSlug) : null;
      return commander?.factionSlug === faction.slug;
    });

    return {
      ...faction,
      commanders,
      zones,
      events,
    };
  });

  const zoneIntel = siteContent.worldZones.map((zone) => ({
    ...zone,
    commander: getCommanderBySlug(zone.recommendedCommanderSlug),
    event: zone.linkedEventSlug ? getEventBySlug(zone.linkedEventSlug) : null,
  }));

  const eventMatrix = siteContent.events.map((event) => ({
    ...event,
    zone: event.linkedZoneSlug ? getWorldZoneBySlug(event.linkedZoneSlug) : null,
    commander: event.featuredCommanderSlug ? getCommanderBySlug(event.featuredCommanderSlug) : null,
  }));

  const newsBriefs = siteContent.news.map((item) => ({
    ...item,
    article: getNewsItemBySlug(item.slug),
  }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      factions: siteContent.factions.length,
      commanders: siteContent.commanders.length,
      zones: siteContent.worldZones.length,
      events: siteContent.events.length,
      news: siteContent.news.length,
      contestedZones: siteContent.worldZones.filter((zone) => zone.control === 'contested').length,
      liveEvents: siteContent.events.filter((event) => event.status === 'active').length,
      highPressureZones: siteContent.worldZones.filter((zone) => zone.pressure === 'high').length,
    },
    nodes,
    edges,
    factionSectors,
    zoneIntel,
    eventMatrix,
    newsBriefs,
  };
}
