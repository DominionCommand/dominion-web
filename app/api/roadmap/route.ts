import { recordActivity } from '../../../lib/activity-log';
import { readLeads } from '../../../lib/leads';
import { buildRoadmapSnapshot, readRoadmapControlState, saveRoadmapControlState } from '../../../lib/roadmap-control';

const allowedStatuses = new Set(['active', 'next', 'planned', 'watch', 'blocked', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildRoadmapSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Valid JSON body required' }, { status: 400 });
  }

  const current = await readRoadmapControlState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

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

  const phase = normalizeOptionalString(body.phase);
  const status = normalizeOptionalString(body.status);
  const phaseOwner = normalizeOptionalString(body.phaseOwner);
  const nextDeliverable = normalizeOptionalString(body.nextDeliverable);
  const phaseNote = normalizeOptionalString(body.phaseNote);

  if (phase) {
    if (!status || !allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Valid roadmap phase status required' }, { status: 400 });
    }

    const override = {
      phase,
      status: status as 'active' | 'next' | 'planned' | 'watch' | 'blocked' | 'done',
      owner: phaseOwner ?? 'Dominion Nexus product command',
      nextDeliverable,
      note: phaseNote,
      updatedAt: new Date().toISOString(),
    };

    next.phaseOverrides = [override, ...next.phaseOverrides.filter((item) => item.phase !== phase)];
  }

  await saveRoadmapControlState(next);

  await recordActivity({
    entity: 'roadmap',
    action: phase ? 'roadmap-phase-updated' : 'roadmap-noted',
    actor: owner ?? phaseOwner ?? next.owner,
    summary: phase ? `Roadmap updated for ${phase}` : 'Roadmap note saved',
    detail: phase ? `${phase} set to ${status}.` : note ?? 'Roadmap control updated.',
    metadata: phase ? { phase, status: status ?? 'unknown' } : undefined,
  }).catch(() => undefined);

  const snapshot = await buildRoadmapSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
