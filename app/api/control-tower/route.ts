import { recordActivity } from '../../../lib/activity-log';
import { buildControlTowerSnapshot, readControlTowerState, saveControlTowerState } from '../../../lib/control-tower';
import { readLeads } from '../../../lib/leads';

const allowedTowerStatuses = new Set(['monitoring', 'executing', 'blocked']);
const allowedFocusLanes = new Set(['Growth', 'Launch', 'War Room']);
const allowedItemStatuses = new Set(['todo', 'active', 'blocked', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildControlTowerSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...snapshot,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readControlTowerState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status);
  if (status) {
    if (!allowedTowerStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid control tower status' }, { status: 400 });
    }
    next.status = status as typeof next.status;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const focusLane = normalizeOptionalString(body.focusLane);
  if (focusLane) {
    if (!allowedFocusLanes.has(focusLane)) {
      return Response.json({ ok: false, error: 'Invalid control tower focus lane' }, { status: 400 });
    }
    next.focusLane = focusLane as typeof next.focusLane;
  }

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

  if (itemSlug) {
    if (!itemStatus || !allowedItemStatuses.has(itemStatus)) {
      return Response.json({ ok: false, error: 'Valid control tower item status required' }, { status: 400 });
    }

    const nextItem = {
      slug: itemSlug,
      status: itemStatus as 'todo' | 'active' | 'blocked' | 'done',
      owner: itemOwner ?? '',
      note: itemNote,
      updatedAt: new Date().toISOString(),
    };

    next.queueOverrides = [
      nextItem,
      ...next.queueOverrides.filter((item) => item.slug !== itemSlug),
    ];
  }

  await saveControlTowerState(next);

  await recordActivity({
    entity: 'control-tower',
    action: itemSlug ? 'queue-item-updated' : 'tower-updated',
    actor: owner ?? itemOwner ?? 'Dominion Nexus command',
    summary: itemSlug
      ? `Control tower queue item updated: ${itemSlug}`
      : `Control tower saved with ${next.status} status`,
    detail: itemSlug
      ? `Status set to ${itemStatus}; focus lane is ${next.focusLane}.`
      : note ?? `Focus lane is ${next.focusLane}.`,
    metadata: {
      focusLane: next.focusLane,
      status: next.status,
      ...(itemSlug ? { itemSlug } : {}),
    },
  }).catch(() => undefined);

  const snapshot = await buildControlTowerSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
