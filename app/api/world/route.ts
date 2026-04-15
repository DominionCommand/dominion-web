import { siteContent } from '../../../lib/content';

export async function GET() {
  const contestedZones = siteContent.worldZones.filter((zone) => zone.control === 'contested');
  const highPressureZones = siteContent.worldZones.filter((zone) => zone.pressure === 'high');
  const linkedEvents = siteContent.worldZones.filter((zone) => zone.linkedEventSlug);

  return Response.json({
    ok: true,
    zones: siteContent.worldZones,
    contestedZones,
    highPressureZones,
    linkedEvents,
    seasonBeats: siteContent.seasonBeats,
  });
}
