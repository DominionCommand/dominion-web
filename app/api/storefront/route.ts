import { readLeads } from '../../../lib/leads';
import { buildStorefrontSnapshot, readStorefrontState, saveStorefrontState } from '../../../lib/storefront';

const allowedStatuses = new Set(['draft', 'active', 'watch']);
const allowedNoteStatuses = new Set(['open', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const storefront = await buildStorefrontSnapshot(await readLeads());
  return Response.json({ ok: true, ...storefront });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readStorefrontState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status)?.toLowerCase();
  if (status) {
    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid storefront status' }, { status: 400 });
    }
    next.status = status as typeof current.status;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const featuredOfferSlug = normalizeOptionalString(body.featuredOfferSlug);
  if (featuredOfferSlug) next.featuredOfferSlug = featuredOfferSlug;

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

  await saveStorefrontState(next);

  const storefront = await buildStorefrontSnapshot(await readLeads());
  return Response.json({ ok: true, ...storefront });
}
