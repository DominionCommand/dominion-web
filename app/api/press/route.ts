import { siteContent } from '../../../lib/content';
import { buildPublicKitSnapshot } from '../../../lib/public-kit';

export async function GET() {
  const snapshot = buildPublicKitSnapshot();

  return Response.json({ ok: true, press: siteContent.press, summary: snapshot.press });
}
