import { recordActivity } from '../../../lib/activity-log';
import { buildAllianceHQSnapshot, readAllianceHQState, saveAllianceHQState } from '../../../lib/alliance-hq';
import { readLeads } from '../../../lib/leads';

const allowedStatuses = new Set(['forming', 'mobilizing', 'war-ready']);
const allowedPriorities = new Set(['recruitment', 'frontline', 'logistics']);
const allowedCampaignStatuses = new Set(['planned', 'active', 'blocked', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const snapshot = await buildAllianceHQSnapshot(await readLeads());

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

  const current = await readAllianceHQState();
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  const status = normalizeOptionalString(body.status);
  if (status) {
    if (!allowedStatuses.has(status)) {
      return Response.json({ ok: false, error: 'Invalid alliance HQ status' }, { status: 400 });
    }
    next.status = status as typeof next.status;
  }

  const owner = normalizeOptionalString(body.owner);
  if (owner) next.owner = owner;

  const priority = normalizeOptionalString(body.priority);
  if (priority) {
    if (!allowedPriorities.has(priority)) {
      return Response.json({ ok: false, error: 'Invalid alliance HQ priority' }, { status: 400 });
    }
    next.priority = priority as typeof next.priority;
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

  const campaignSlug = normalizeOptionalString(body.campaignSlug);
  const campaignStatus = normalizeOptionalString(body.campaignStatus);
  const campaignOwner = normalizeOptionalString(body.campaignOwner);
  const campaignNote = normalizeOptionalString(body.campaignNote);

  if (campaignSlug) {
    if (!campaignStatus || !allowedCampaignStatuses.has(campaignStatus)) {
      return Response.json({ ok: false, error: 'Valid alliance campaign status required' }, { status: 400 });
    }

    next.campaignOverrides = [
      {
        slug: campaignSlug,
        status: campaignStatus as 'planned' | 'active' | 'blocked' | 'done',
        owner: campaignOwner ?? '',
        note: campaignNote,
        updatedAt: new Date().toISOString(),
      },
      ...next.campaignOverrides.filter((item) => item.slug !== campaignSlug),
    ];
  }

  await saveAllianceHQState(next);

  await recordActivity({
    entity: 'alliances',
    action: campaignSlug ? 'campaign-updated' : 'hq-updated',
    actor: owner ?? campaignOwner ?? 'Alliance command',
    summary: campaignSlug ? `Alliance campaign updated: ${campaignSlug}` : `Alliance HQ saved with ${next.status} status`,
    detail: campaignSlug
      ? `Status set to ${campaignStatus}; priority lane is ${next.priority}.`
      : note ?? `Priority lane is ${next.priority}.`,
    metadata: {
      priority: next.priority,
      status: next.status,
      ...(campaignSlug ? { campaignSlug } : {}),
    },
  }).catch(() => undefined);

  const snapshot = await buildAllianceHQSnapshot(await readLeads());
  return Response.json({ ok: true, ...snapshot });
}
