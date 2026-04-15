import { recordActivity } from '../../../lib/activity-log';
import { buildCampaignBriefs } from '../../../lib/campaigns';
import { saveCampaignExecutionEntry } from '../../../lib/campaign-ops';
import { getEventBySlug } from '../../../lib/content';
import { readLeads } from '../../../lib/leads';

const validStatuses = new Set(['planned', 'ready', 'live', 'blocked', 'complete']);
const validChannels = new Set(['liveops', 'community', 'paid', 'crm', 'qa']);

export async function GET() {
  const snapshot = await buildCampaignBriefs(await readLeads());

  return Response.json({
    ok: true,
    generatedAt: snapshot.generatedAt,
    summary: snapshot.summary,
    campaigns: snapshot.campaigns,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      slug?: string;
      status?: string;
      owner?: string;
      channel?: string;
      note?: string;
    };

    const slug = body.slug?.trim();
    if (!slug || !getEventBySlug(slug)) {
      return Response.json({ ok: false, error: 'Valid campaign slug is required.' }, { status: 400 });
    }

    if (!body.status || !validStatuses.has(body.status)) {
      return Response.json({ ok: false, error: 'Valid campaign execution status is required.' }, { status: 400 });
    }

    if (!body.channel || !validChannels.has(body.channel)) {
      return Response.json({ ok: false, error: 'Valid campaign channel is required.' }, { status: 400 });
    }

    const event = getEventBySlug(slug)!;
    await saveCampaignExecutionEntry({
      slug,
      status: body.status as 'planned' | 'ready' | 'live' | 'blocked' | 'complete',
      owner: body.owner,
      channel: body.channel as 'liveops' | 'community' | 'paid' | 'crm' | 'qa',
      note: body.note,
    });

    await recordActivity({
      entity: 'campaigns',
      action: 'campaign.updated',
      actor: body.owner?.trim() || 'Unassigned',
      summary: `${event.name} moved to ${body.status}`,
      detail: body.note?.trim() || `${event.name} is now assigned to ${body.channel}.`,
      metadata: {
        slug,
        channel: body.channel,
        status: body.status,
      },
    });

    const snapshot = await buildCampaignBriefs(await readLeads());
    return Response.json({ ok: true, ...snapshot });
  } catch {
    return Response.json({ ok: false, error: 'Could not save campaign state.' }, { status: 500 });
  }
}
