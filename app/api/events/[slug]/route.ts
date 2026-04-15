import { getCommanderBySlug, getEventBySlug, getWorldZoneBySlug, siteContent } from '../../../../lib/content';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return Response.json({ ok: false, error: 'Event not found' }, { status: 404 });
  }

  const commander = event.featuredCommanderSlug ? getCommanderBySlug(event.featuredCommanderSlug) ?? null : null;
  const zone = event.linkedZoneSlug ? getWorldZoneBySlug(event.linkedZoneSlug) ?? null : null;

  return Response.json({
    ok: true,
    event,
    commander,
    zone,
    seasonBeats: siteContent.seasonBeats,
    links: {
      page: `/events/${event.slug}`,
      ladder: '/events',
      commander: commander ? `/commanders/${commander.slug}` : null,
      zone: zone ? `/world/${zone.slug}` : null,
      warRoom: '/war-room',
      commandCenter: '/command-center',
    },
  });
}
