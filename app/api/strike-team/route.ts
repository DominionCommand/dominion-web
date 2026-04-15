import { readLeads } from '../../../lib/leads';
import { buildStrikeTeamBoard, readStrikeTeamState, saveStrikeTeamState } from '../../../lib/strike-team';

const allowedStatuses = new Set(['candidate', 'assigned', 'confirmed', 'hold']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const board = await buildStrikeTeamBoard(await readLeads());
  return Response.json({ ok: true, ...board });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const slotId = normalizeOptionalString(body.slot);
  if (!slotId) {
    return Response.json({ ok: false, error: 'Slot is required' }, { status: 400 });
  }

  const state = await readStrikeTeamState();
  const currentSlot = state.slots.find((slot) => slot.slot === slotId);
  if (!currentSlot) {
    return Response.json({ ok: false, error: 'Invalid strike-team slot' }, { status: 400 });
  }

  const leads = await readLeads();
  const email = normalizeOptionalString(body.email)?.toLowerCase();
  if (email && !leads.some((lead) => lead.email === email)) {
    return Response.json({ ok: false, error: 'Assigned tester must exist in leads' }, { status: 400 });
  }

  const status = normalizeOptionalString(body.status)?.toLowerCase();
  if (status && !allowedStatuses.has(status)) {
    return Response.json({ ok: false, error: 'Invalid strike-team status' }, { status: 400 });
  }

  const owner = normalizeOptionalString(body.owner) || currentSlot.owner;
  const note = normalizeOptionalString(body.note);
  const updatedAt = new Date().toISOString();

  const nextState = {
    updatedAt,
    slots: state.slots.map((slot) => {
      if (slot.slot === slotId) {
        return {
          ...slot,
          email,
          status: (status as typeof slot.status | undefined) ?? slot.status,
          owner,
          note,
          updatedAt,
        };
      }

      if (email && slot.email === email) {
        return {
          ...slot,
          email: undefined,
          status: 'candidate' as const,
          updatedAt,
        };
      }

      return slot;
    }),
  };

  await saveStrikeTeamState(nextState);
  const board = await buildStrikeTeamBoard(leads);

  return Response.json({ ok: true, ...board });
}
