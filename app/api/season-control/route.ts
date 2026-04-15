import { recordActivity } from '../../../lib/activity-log';
import { buildSeasonControlSnapshot, readSeasonControlState, saveSeasonControlState } from '../../../lib/season-control';
import { siteContent } from '../../../lib/content';
import { readLeads } from '../../../lib/leads';

const allowedStatuses = new Set(['planning', 'live', 'cooldown']);
const validBeats = new Set(siteContent.seasonBeats.map((beat) => beat.phase));
const validEvents = new Set(siteContent.events.map((event) => event.slug));
const validZones = new Set(siteContent.worldZones.map((zone) => zone.slug));

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildSeasonControlSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readSeasonControlState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status)?.toLowerCase();
  if (status) {
    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid season status' }, { status: 400 });
    }
    next.status = status as typeof current.status;
  }

  const activeBeat = normalizeOptionalString(body.activeBeat);
  if (activeBeat) {
    if (!validBeats.has(activeBeat)) {
      return Response.json({ ok: false, error: 'Invalid season beat' }, { status: 400 });
    }
    next.activeBeat = activeBeat;
  }

  const featuredEventSlug = normalizeOptionalString(body.featuredEventSlug);
  if (featuredEventSlug) {
    if (!validEvents.has(featuredEventSlug)) {
      return Response.json({ ok: false, error: 'Invalid featured event' }, { status: 400 });
    }
    next.featuredEventSlug = featuredEventSlug;
  }

  const featuredZoneSlug = normalizeOptionalString(body.featuredZoneSlug);
  if (featuredZoneSlug) {
    if (!validZones.has(featuredZoneSlug)) {
      return Response.json({ ok: false, error: 'Invalid featured zone' }, { status: 400 });
    }
    next.featuredZoneSlug = featuredZoneSlug;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const noteText = normalizeOptionalString(body.note);
  if (noteText) {
    next.notes = [
      {
        id: crypto.randomUUID(),
        text: noteText,
        createdAt: new Date().toISOString(),
      },
      ...next.notes,
    ].slice(0, 50);
  }

  await saveSeasonControlState(next);

  await recordActivity({
    entity: 'season-control',
    action: 'season-updated',
    actor: owner ?? next.owner,
    summary: `Season control updated to ${next.status}`,
    detail: noteText ?? `${next.activeBeat} is active with ${next.featuredEventSlug} on ${next.featuredZoneSlug}.`,
    metadata: {
      status: next.status,
      activeBeat: next.activeBeat,
      featuredEventSlug: next.featuredEventSlug,
      featuredZoneSlug: next.featuredZoneSlug,
    },
  }).catch(() => undefined);

  const snapshot = await buildSeasonControlSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
