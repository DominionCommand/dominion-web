import { getCommanderBySlug, getFactionBySlug, siteContent } from '../../../../lib/content';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commander = getCommanderBySlug(slug);

  if (!commander) {
    return Response.json({ ok: false, error: 'Commander not found' }, { status: 404 });
  }

  const faction = getFactionBySlug(commander.factionSlug) ?? null;
  const zones = siteContent.worldZones.filter((zone) => zone.recommendedCommanderSlug === commander.slug);
  const events = siteContent.events.filter((event) => event.featuredCommanderSlug === commander.slug);

  return Response.json({
    ok: true,
    commander,
    faction,
    zones,
    events,
    links: {
      page: `/commanders/${commander.slug}`,
      roster: '/commanders',
      faction: `/factions/${commander.factionSlug}`,
      zones: zones.map((zone) => `/world/${zone.slug}`),
      events: events.map((event) => `/events/${event.slug}`),
    },
  });
}
