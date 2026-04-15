import { readLeads, summarizeLeads } from '../../../lib/leads';

export async function GET() {
  const leads = await readLeads();
  return Response.json({ ok: true, ...summarizeLeads(leads) });
}
