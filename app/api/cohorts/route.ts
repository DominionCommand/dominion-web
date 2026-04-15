import { buildCohortPlanner } from '../../../lib/cohorts';
import { readLeads } from '../../../lib/leads';

export async function GET() {
  const planner = await buildCohortPlanner(await readLeads());
  return Response.json({ ok: true, ...planner });
}
