import { recordActivity } from '../../../lib/activity-log';
import { buildInviteQueue, saveInviteQueueDecision } from '../../../lib/invite-queue';
import { readLeads } from '../../../lib/leads';
import { waveLabels } from '../../../lib/waves';

export async function GET() {
  const queue = await buildInviteQueue(await readLeads());

  return Response.json({
    ok: true,
    ...queue,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const status = typeof body.status === 'string' ? body.status : 'queued';
    const wave = typeof body.wave === 'string' ? body.wave : 'wave-3-broader-market';
    const note = typeof body.note === 'string' ? body.note : undefined;

    if (!email || !email.includes('@')) {
      return Response.json({ ok: false, error: 'A valid email is required.' }, { status: 400 });
    }

    if (!['selected', 'queued', 'sent', 'hold'].includes(status)) {
      return Response.json({ ok: false, error: 'Invalid invite status.' }, { status: 400 });
    }

    if (!(wave in waveLabels)) {
      return Response.json({ ok: false, error: 'Invalid wave.' }, { status: 400 });
    }

    const state = await saveInviteQueueDecision({
      email,
      status,
      wave: wave as keyof typeof waveLabels,
      note,
    });

    await recordActivity({
      entity: 'invite-queue',
      action: 'invite-decision-saved',
      actor: 'Invite queue operator',
      summary: `Invite queue updated for ${email}`,
      detail: note ?? `Status set to ${status} for ${waveLabels[wave as keyof typeof waveLabels]}.`,
      metadata: {
        email,
        status,
        wave,
      },
    }).catch(() => undefined);

    return Response.json({
      ok: true,
      state,
    });
  } catch {
    return Response.json({ ok: false, error: 'Could not save invite decision.' }, { status: 500 });
  }
}
