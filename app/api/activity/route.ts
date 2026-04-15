import { buildActivitySnapshot } from '../../../lib/activity-log';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') || '30');
  const snapshot = await buildActivitySnapshot(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 30);

  return Response.json({
    ok: true,
    ...snapshot,
  });
}
