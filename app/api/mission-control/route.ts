import { readLeads } from '../../../lib/leads';
import { buildMissionControlSnapshot } from '../../../lib/mission-control';

export async function GET() {
  const snapshot = await buildMissionControlSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...snapshot,
    sourceSurfaces: [
      '/command-center',
      '/control-tower',
      '/release-room',
      '/invite-queue',
      '/war-room',
      '/storefront',
      '/intake',
    ],
  });
}
