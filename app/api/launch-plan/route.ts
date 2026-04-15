import { buildLaunchPlan, readLaunchPlanState, saveLaunchPlanState } from '../../../lib/launch-plan';
import { readLeads } from '../../../lib/leads';

const allowedStatuses = new Set(['draft', 'active', 'blocked']);
const allowedNoteStatuses = new Set(['open', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const launchPlan = await buildLaunchPlan(await readLeads());
  return Response.json({ ok: true, ...launchPlan });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readLaunchPlanState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status)?.toLowerCase();
  if (status) {
    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid launch plan status' }, { status: 400 });
    }
    next.status = status as typeof current.status;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const targetWave = normalizeOptionalString(body.targetWave);
  if (targetWave) next.targetWave = targetWave;

  const noteText = normalizeOptionalString(body.note);
  if (noteText) {
    next.notes = [
      {
        id: crypto.randomUUID(),
        text: noteText,
        createdAt: new Date().toISOString(),
        status: 'open' as const,
      },
      ...next.notes,
    ].slice(0, 50);
  }

  const noteId = normalizeOptionalString(body.noteId);
  const noteStatus = normalizeOptionalString(body.noteStatus)?.toLowerCase();
  if (noteId && noteStatus) {
    if (!allowedNoteStatuses.has(noteStatus)) {
      return Response.json({ ok: false, error: 'Invalid note status' }, { status: 400 });
    }

    next.notes = next.notes.map((note) => (
      note.id === noteId
        ? { ...note, status: noteStatus as 'open' | 'done' }
        : note
    ));
  }

  await saveLaunchPlanState(next);

  const launchPlan = await buildLaunchPlan(await readLeads());
  return Response.json({ ok: true, ...launchPlan });
}
