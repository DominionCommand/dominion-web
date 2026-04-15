import { buildOperationsSnapshot } from '../../../lib/operations';
import { readLeads } from '../../../lib/leads';

export async function GET() {
  const leads = await readLeads();
  const snapshot = await buildOperationsSnapshot(leads);

  return Response.json({
    ok: true,
    ...snapshot,
    sourceSurfaces: [
      '/ops',
      '/control-tower',
      '/invite-queue',
      '/intake',
      '/war-room',
      '/activity',
    ],
  });
}
