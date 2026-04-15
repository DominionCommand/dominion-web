import { getNewsItemBySlug } from '../../../../lib/content';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const item = getNewsItemBySlug(slug);

  if (!item) {
    return Response.json({ ok: false, error: 'News item not found.' }, { status: 404 });
  }

  return Response.json({
    ok: true,
    item,
  });
}
