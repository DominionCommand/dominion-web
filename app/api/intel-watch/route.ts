import { recordActivity } from '../../../lib/activity-log';
import { buildIntelWatchSnapshot, readIntelWatchState, saveIntelWatchState } from '../../../lib/intel-watch';
import { readLeads } from '../../../lib/leads';

const allowedPostures = new Set(['stable', 'watch', 'escalated']);
const allowedStatuses = new Set(['monitoring', 'action-needed', 'resolved']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildIntelWatchSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readIntelWatchState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const posture = normalizeOptionalString(body.posture);
  if (posture) {
    if (!allowedPostures.has(posture)) {
      return Response.json({ ok: false, error: 'Invalid intel posture' }, { status: 400 });
    }
    next.posture = posture as typeof next.posture;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

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

  const itemSlug = normalizeOptionalString(body.itemSlug);
  const itemStatus = normalizeOptionalString(body.itemStatus);
  const itemOwner = normalizeOptionalString(body.itemOwner);
  const itemNote = normalizeOptionalString(body.itemNote);
  const itemTitle = normalizeOptionalString(body.itemTitle);

  if (itemSlug) {
    if (!itemStatus || !allowedStatuses.has(itemStatus)) {
      return Response.json({ ok: false, error: 'Valid intel item status required' }, { status: 400 });
    }

    next.watchItems = [
      {
        slug: itemSlug,
        title: itemTitle ?? itemSlug,
        status: itemStatus as 'monitoring' | 'action-needed' | 'resolved',
        owner: itemOwner ?? '',
        note: itemNote,
        updatedAt: new Date().toISOString(),
      },
      ...next.watchItems.filter((item) => item.slug !== itemSlug),
    ];
  }

  await saveIntelWatchState(next);

  await recordActivity({
    entity: 'intel-watch',
    action: itemSlug ? 'watch-item-updated' : 'intel-posture-updated',
    actor: owner ?? itemOwner ?? 'Intel command',
    summary: itemSlug ? `Intel watch item updated: ${itemSlug}` : `Intel posture saved with ${next.posture} posture`,
    detail: itemSlug ? `Status set to ${itemStatus}.` : note ?? `Owner is ${next.owner}.`,
    metadata: {
      posture: next.posture,
      ...(itemSlug ? { itemSlug } : {}),
    },
  }).catch(() => undefined);

  const snapshot = await buildIntelWatchSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
