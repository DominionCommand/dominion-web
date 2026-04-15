import { siteContent } from '../../../lib/content';

export async function GET() {
  return Response.json({
    ok: true,
    heroTitle: siteContent.hero.title,
    factionCount: siteContent.factions.length,
    commanderCount: siteContent.commanders.length,
    newsCount: siteContent.news.length,
    mediaCount: siteContent.media.length,
    roadmapCount: siteContent.roadmap.length,
  });
}
