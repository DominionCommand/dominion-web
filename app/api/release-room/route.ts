import { recordActivity } from '../../../lib/activity-log';
import { readLeads } from '../../../lib/leads';
import { buildReleaseRoomSnapshot, readReleaseRoomState, saveReleaseRoomState } from '../../../lib/release-room';

const allowedDecisions = new Set(['go', 'hold', 'blocked']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildReleaseRoomSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readReleaseRoomState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const decision = normalizeOptionalString(body.decision);
  if (decision) {
    if (!allowedDecisions.has(decision)) {
      return Response.json({ ok: false, error: 'Invalid release decision' }, { status: 400 });
    }
    next.decision = decision as typeof next.decision;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const nextMilestone = normalizeOptionalString(body.nextMilestone);
  if (nextMilestone) next.nextMilestone = nextMilestone;

  const note = normalizeOptionalString(body.note);
  if (note) {
    next.notes = [
      {
        id: crypto.randomUUID(),
        text: note,
        createdAt: new Date().toISOString(),
      },
      ...next.notes,
    ].slice(0, 50);
  }

  await saveReleaseRoomState(next);

  await recordActivity({
    entity: 'release-room',
    action: 'release-decision-updated',
    actor: next.owner,
    summary: `Release room saved with ${next.decision} decision`,
    detail: note ?? `Next milestone is ${next.nextMilestone}.`,
    metadata: {
      decision: next.decision,
      nextMilestone: next.nextMilestone,
    },
  }).catch(() => undefined);

  const snapshot = await buildReleaseRoomSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
