import { getFactionBySlug, getFactionCommanders, siteContent } from '../../../../lib/content';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const faction = getFactionBySlug(slug);

  if (!faction) {
    return Response.json({ ok: false, error: 'Faction not found' }, { status: 404 });
  }

  const commanders = getFactionCommanders(faction.slug);
  const zones = siteContent.worldZones.filter((zone) => commanders.some((commander) => commander.slug === zone.recommendedCommanderSlug));
  const events = siteContent.events.filter((event) => commanders.some((commander) => commander.slug === event.featuredCommanderSlug));

  return Response.json({
    ok: true,
    faction,
    commanders,
    zones,
    events,
    links: {
      page: `/factions/${faction.slug}`,
      roster: '/factions',
      commanders: commanders.map((commander) => `/commanders/${commander.slug}`),
      zones: zones.map((zone) => `/world/${zone.slug}`),
      events: events.map((event) => `/events/${event.slug}`),
    },
  });
}
