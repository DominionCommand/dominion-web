import { recordActivity } from '../../../lib/activity-log';
import { buildFounderPipeline, saveFounderPipelineEntry } from '../../../lib/founder-pipeline';
import { readLeads } from '../../../lib/leads';

const validStages = new Set(['new', 'contacting', 'qualified', 'invited', 'archived']);
const validChannels = new Set(['email', 'discord', 'testflight', 'waitlist']);

export async function GET() {
  const leads = await readLeads();
  const pipeline = await buildFounderPipeline(leads);

  return Response.json({ ok: true, ...pipeline });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      email?: string;
      stage?: string;
      owner?: string;
      channel?: string;
      note?: string;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return Response.json({ ok: false, error: 'Valid email is required.' }, { status: 400 });
    }

    if (!body.stage || !validStages.has(body.stage)) {
      return Response.json({ ok: false, error: 'Valid pipeline stage is required.' }, { status: 400 });
    }

    if (!body.channel || !validChannels.has(body.channel)) {
      return Response.json({ ok: false, error: 'Valid outreach channel is required.' }, { status: 400 });
    }

    const leads = await readLeads();
    const leadExists = leads.some((lead) => lead.email.trim().toLowerCase() === email);

    if (!leadExists) {
      return Response.json({ ok: false, error: 'Lead not found in preregister data.' }, { status: 404 });
    }

    const stage = body.stage as 'new' | 'contacting' | 'qualified' | 'invited' | 'archived';
    const channel = body.channel as 'email' | 'discord' | 'testflight' | 'waitlist';

    await saveFounderPipelineEntry({
      email,
      stage,
      owner: body.owner,
      channel,
      note: body.note,
    });

    await recordActivity({
      entity: 'founder-pipeline',
      action: 'founder-stage-saved',
      actor: body.owner?.trim() || 'Founder pipeline operator',
      summary: `Founder pipeline updated for ${email}`,
      detail: body.note?.trim() || `Stage set to ${stage} through ${channel}.`,
      metadata: {
        email,
        stage,
        channel,
      },
    }).catch(() => undefined);

    const pipeline = await buildFounderPipeline(leads);
    return Response.json({ ok: true, ...pipeline });
  } catch {
    return Response.json({ ok: false, error: 'Could not save founder pipeline state.' }, { status: 500 });
  }
}
