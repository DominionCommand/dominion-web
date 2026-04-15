import { getCommanderBySlug, getEventBySlug, getWorldZoneBySlug } from '../../../../lib/content';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zone = getWorldZoneBySlug(slug);

  if (!zone) {
    return Response.json({ ok: false, error: 'World zone not found' }, { status: 404 });
  }

  const commander = getCommanderBySlug(zone.recommendedCommanderSlug) ?? null;
  const event = zone.linkedEventSlug ? getEventBySlug(zone.linkedEventSlug) ?? null : null;

  return Response.json({
    ok: true,
    zone,
    commander,
    event,
    links: {
      page: `/world/${zone.slug}`,
      world: '/world',
      commandCenter: '/command-center',
      warRoom: '/war-room',
      event: event ? `/events/${event.slug}` : null,
    },
  });
}
