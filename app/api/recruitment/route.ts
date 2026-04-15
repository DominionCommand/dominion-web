import { readLeads } from '../../../lib/leads';
import { saveRecruitmentCampaignState } from '../../../lib/recruitment-board';
import { buildRecruitmentSnapshot } from '../../../lib/recruitment';

const allowedStatuses = new Set(['todo', 'active', 'blocked', 'done']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const recruitment = await buildRecruitmentSnapshot(await readLeads());

  return Response.json({
    ok: true,
    ...recruitment,
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
    return Response.json({ ok: false, error: 'Campaign slug is required' }, { status: 400 });
  }

  if (!status || !allowedStatuses.has(status)) {
    return Response.json({ ok: false, error: 'Valid campaign status is required' }, { status: 400 });
  }

  await saveRecruitmentCampaignState({
    slug,
    status: status as 'todo' | 'active' | 'blocked' | 'done',
    owner,
    note,
  });

  const recruitment = await buildRecruitmentSnapshot(await readLeads());
  return Response.json({ ok: true, ...recruitment });
}
