import { siteContent } from '../../../lib/content';

export async function GET() {
  return Response.json({ ok: true, faq: siteContent.faq });
}
