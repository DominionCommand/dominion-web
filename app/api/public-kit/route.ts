import { siteContent } from '../../../lib/content';
import { buildPublicKitSnapshot } from '../../../lib/public-kit';

export async function GET(request: Request) {
  const snapshot = buildPublicKitSnapshot();
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');

  if (section === 'media') {
    const filtered = siteContent.media.filter((item) => {
      if (status && item.status !== status) return false;
      if (type && item.type !== type) return false;
      return true;
    });

    return Response.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      summary: snapshot.media,
      items: filtered,
    });
  }

  if (section === 'press') {
    const filtered = siteContent.press.assets.filter((asset) => {
      if (status && asset.status !== status) return false;
      if (type && asset.type !== type) return false;
      return true;
    });

    return Response.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      summary: snapshot.press,
      assets: filtered,
    });
  }

  if (section === 'news') {
    const filtered = snapshot.news.timeline.filter((item) => {
      if (tag && item.tag !== tag) return false;
      return true;
    });

    return Response.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      summary: snapshot.news,
      updates: filtered,
    });
  }

  return Response.json({ ok: true, ...snapshot });
}
