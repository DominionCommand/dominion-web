import { buildNexusGraph } from '../../../lib/nexus-graph';

export async function GET() {
  return Response.json({ ok: true, ...buildNexusGraph() });
}
