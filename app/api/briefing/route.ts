import { readLeads } from '../../../lib/leads';
import { buildDailyBriefing } from '../../../lib/briefing';

export async function GET() {
  const briefing = await buildDailyBriefing(await readLeads());

  return Response.json({
    ok: true,
    ...briefing,
  });
}
