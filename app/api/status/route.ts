import { readLeads } from '../../../lib/leads';
import { buildStatusSnapshot } from '../../../lib/status';

export async function GET() {
  const snapshot = await buildStatusSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...snapshot,
    briefingApi: '/api/briefing',
    dashboardApi: '/api/dashboard',
    missionControlApi: '/api/mission-control',
    siteContentApi: '/api/site-content',
  });
}
