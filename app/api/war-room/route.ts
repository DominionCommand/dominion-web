import { recordActivity } from '../../../lib/activity-log';
import { readLeads } from '../../../lib/leads';
import { saveWarRoomFocusState } from '../../../lib/war-room-board';
import { buildWarRoomBriefing } from '../../../lib/war-room';

const allowedStatuses = new Set(['todo', 'active', 'blocked', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const briefing = await buildWarRoomBriefing(await readLeads());

  return Response.json({
    ok: true,
    ...briefing,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const slug = normalizeOptionalString(body.slug);
  const status = normalizeOptionalString(body.status)?.toLowerCase();
  const owner = normalizeOptionalString(body.owner);
  const note = normalizeOptionalString(body.note);

  if (!slug) {
    return Response.json({ ok: false, error: 'Focus item slug is required' }, { status: 400 });
  }

  if (!status || !allowedStatuses.has(status)) {
    return Response.json({ ok: false, error: 'Valid focus item status is required' }, { status: 400 });
  }

  await saveWarRoomFocusState({
    slug,
    status: status as 'todo' | 'active' | 'blocked' | 'done',
    owner,
    note,
  });

  await recordActivity({
    entity: 'war-room',
    action: 'focus-updated',
    actor: owner ?? 'War room operator',
    summary: `War room focus updated: ${slug}`,
    detail: note ?? `Status set to ${status}.`,
    metadata: {
      slug,
      status,
    },
  }).catch(() => undefined);

  const briefing = await buildWarRoomBriefing(await readLeads());
  return Response.json({ ok: true, ...briefing });
}
