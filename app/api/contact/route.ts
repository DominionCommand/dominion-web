import { recordActivity } from '../../../lib/activity-log';
import { buildContactQueueSnapshot, saveContactQueueDecision } from '../../../lib/contact-queue';
import { readContactRequests, saveContactRequest, summarizeContactRequests } from '../../../lib/contact-intake';

const allowedTopics = new Set(['founder-access', 'partnership', 'press', 'support']);

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const entries = await readContactRequests();
  const queue = await buildContactQueueSnapshot(entries);

  return Response.json({
    ok: true,
    summary: summarizeContactRequests(entries),
    queue,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== 'string' || !body.email.includes('@')) {
    return Response.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  }

  const topic = clean(body.topic);
  const message = clean(body.message);
  const name = clean(body.name);
  const email = body.email.trim().toLowerCase();

  if (!topic || !allowedTopics.has(topic)) {
    return Response.json({ ok: false, error: 'Valid topic required' }, { status: 400 });
  }

  if (!message || message.length < 10) {
    return Response.json({ ok: false, error: 'Message must be at least 10 characters' }, { status: 400 });
  }

  const entries = await readContactRequests();
  const duplicate = entries.find((entry) => entry.email === email && entry.topic === topic && entry.message === message);

  if (!duplicate) {
    await saveContactRequest({
      email,
      name,
      topic: topic as 'founder-access' | 'partnership' | 'press' | 'support',
      message,
      ts: new Date().toISOString(),
    });
  }

  const updated = duplicate ? entries : await readContactRequests();

  return Response.json({
    ok: true,
    duplicate: Boolean(duplicate),
    summary: summarizeContactRequests(updated),
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.requestId !== 'string' || !body.requestId.trim()) {
    return Response.json({ ok: false, error: 'Valid requestId required' }, { status: 400 });
  }

  const allowedStatuses = new Set(['new', 'triaged', 'in-progress', 'waiting', 'closed']);
  const allowedPriorities = new Set(['critical', 'high', 'normal']);
  const requestId = body.requestId.trim();
  const status = clean(body.status);
  const priority = clean(body.priority);
  const owner = clean(body.owner) ?? '';
  const note = clean(body.note) ?? '';

  if (!status || !allowedStatuses.has(status)) {
    return Response.json({ ok: false, error: 'Valid status required' }, { status: 400 });
  }

  if (!priority || !allowedPriorities.has(priority)) {
    return Response.json({ ok: false, error: 'Valid priority required' }, { status: 400 });
  }

  await saveContactQueueDecision({
    requestId,
    status: status as 'new' | 'triaged' | 'in-progress' | 'waiting' | 'closed',
    priority: priority as 'critical' | 'high' | 'normal',
    owner,
    note,
    updatedAt: new Date().toISOString(),
  });

  await recordActivity({
    entity: 'contact-queue',
    action: 'queue-updated',
    summary: `Contact request ${requestId} moved to ${status}${owner ? ` under ${owner}` : ''}.`,
    actor: owner || 'operator',
    detail: note || undefined,
    metadata: {
      requestId,
      status,
      priority,
    },
  });

  const entries = await readContactRequests();

  return Response.json({
    ok: true,
    queue: await buildContactQueueSnapshot(entries),
  });
}
