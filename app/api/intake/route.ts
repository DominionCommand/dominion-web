import { buildIntakeDashboardSnapshot } from '../../../lib/intake-dashboard';
import { readLeads } from '../../../lib/leads';

export async function GET() {
  const snapshot = await buildIntakeDashboardSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...snapshot,
    playtestApi: '/api/playtest',
    preregisterApi: '/api/preregister',
    contactApi: '/api/contact',
    activityApi: '/api/activity',
  });
}
