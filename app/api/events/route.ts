import { siteContent } from '../../../lib/content';

export async function GET() {
  return Response.json({
    ok: true,
    events: siteContent.events,
    linkedZones: siteContent.events.filter((event) => event.linkedZoneSlug),
    featuredCommanders: siteContent.events.filter((event) => event.featuredCommanderSlug),
    seasonBeats: siteContent.seasonBeats,
  });
}
