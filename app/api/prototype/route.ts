import { readLeads } from '../../../lib/leads';
import { buildPrototypeBoard, readPrototypeBoardState, savePrototypeBoardState } from '../../../lib/prototype-board';

const allowedStatuses = new Set(['draft', 'active', 'blocked']);
const allowedNoteStatuses = new Set(['open', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const leads = await readLeads();
  const board = await buildPrototypeBoard(leads);

  return Response.json({
    ok: true,
    ...board,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const leads = await readLeads();
  const board = await buildPrototypeBoard(leads);
  const current = await readPrototypeBoardState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status)?.toLowerCase();
  if (status) {
    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid prototype board status' }, { status: 400 });
    }
    next.status = status as typeof current.status;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const selectedScenario = normalizeOptionalString(body.selectedScenario);
  if (selectedScenario) {
    const scenarioExists = board.scenarios.some((scenario) => scenario.slug === selectedScenario);
    if (!scenarioExists) {
      return Response.json({ ok: false, error: 'Invalid prototype scenario' }, { status: 400 });
    }
    next.selectedScenario = selectedScenario;
  }

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
  const deleteNote = body.deleteNote === true;
  if (noteId && deleteNote) {
    const noteExists = next.notes.some((note) => note.id === noteId);
    if (!noteExists) {
      return Response.json({ ok: false, error: 'Prototype note not found' }, { status: 404 });
    }
    next.notes = next.notes.filter((note) => note.id !== noteId);
  } else if (noteId && noteStatus) {
    if (!allowedNoteStatuses.has(noteStatus)) {
      return Response.json({ ok: false, error: 'Invalid note status' }, { status: 400 });
    }

    const noteExists = next.notes.some((note) => note.id === noteId);
    if (!noteExists) {
      return Response.json({ ok: false, error: 'Prototype note not found' }, { status: 404 });
    }

    next.notes = next.notes.map((note) => (
      note.id === noteId
        ? { ...note, status: noteStatus as 'open' | 'done' }
        : note
    ));
  }

  await savePrototypeBoardState(next);

  const updatedBoard = await buildPrototypeBoard(leads);
  return Response.json({ ok: true, ...updatedBoard });
}
