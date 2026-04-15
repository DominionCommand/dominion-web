import { readLeads } from '../../../lib/leads';
import { buildSignalsSnapshot } from '../../../lib/signals';

export async function GET() {
  const signals = await buildSignalsSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...signals,
  });
}
