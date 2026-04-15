import { buildCampaignPacket } from '../../../../lib/campaign-packets';
import { readLeads } from '../../../../lib/leads';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const packet = await buildCampaignPacket(slug, await readLeads());

  if (!packet) {
    return Response.json({ ok: false, error: 'Campaign packet not found.' }, { status: 404 });
  }

  return Response.json({
    ok: true,
    ...packet,
  });
}
