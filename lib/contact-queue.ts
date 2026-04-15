import { appendFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

import type { ContactRequest } from './contact-intake';

export type ContactQueueStatus = 'new' | 'triaged' | 'in-progress' | 'waiting' | 'closed';
export type ContactQueuePriority = 'critical' | 'high' | 'normal';

export type ContactQueueDecision = {
  requestId: string;
  status: ContactQueueStatus;
  priority: ContactQueuePriority;
  owner: string;
  note: string;
  updatedAt: string;
};

function getContactQueueFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'contact-queue-decisions.jsonl'),
  };
}

export function buildContactRequestId(entry: ContactRequest) {
  return `${entry.ts}::${entry.email.trim().toLowerCase()}::${entry.topic}`;
}

export async function readContactQueueDecisions(): Promise<ContactQueueDecision[]> {
  const { filePath } = getContactQueueFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ContactQueueDecision)
      .filter((entry) => typeof entry.requestId === 'string' && typeof entry.status === 'string')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function saveContactQueueDecision(entry: ContactQueueDecision) {
  const { dataDir, filePath } = getContactQueueFilePath();
  await mkdir(dataDir, { recursive: true });
  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf8');
}

function topicPriority(topic: ContactRequest['topic']): ContactQueuePriority {
  if (topic === 'founder-access' || topic === 'partnership') return 'high';
  return 'normal';
}

export async function buildContactQueueSnapshot(contactRequests: ContactRequest[]) {
  const decisions = await readContactQueueDecisions();
  const latestDecisionByRequest = new Map<string, ContactQueueDecision>();

  decisions.forEach((decision) => {
    if (!latestDecisionByRequest.has(decision.requestId)) {
      latestDecisionByRequest.set(decision.requestId, decision);
    }
  });

  const queue = contactRequests
    .slice()
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .map((entry) => {
      const requestId = buildContactRequestId(entry);
      const decision = latestDecisionByRequest.get(requestId);
      const status = decision?.status ?? 'new';
      const priority = decision?.priority ?? topicPriority(entry.topic);
      const owner = decision?.owner ?? '';
      const note = decision?.note ?? '';
      const updatedAt = decision?.updatedAt ?? entry.ts;

      return {
        ...entry,
        requestId,
        status,
        priority,
        owner,
        note,
        updatedAt,
      };
    });

  const summary = queue.reduce<Record<ContactQueueStatus, number>>((acc, entry) => {
    acc[entry.status] += 1;
    return acc;
  }, {
    new: 0,
    triaged: 0,
    'in-progress': 0,
    waiting: 0,
    closed: 0,
  });

  const byPriority = queue.reduce<Record<ContactQueuePriority, number>>((acc, entry) => {
    acc[entry.priority] += 1;
    return acc;
  }, {
    critical: 0,
    high: 0,
    normal: 0,
  });

  const actions: string[] = [];

  if (summary.new > 0) {
    actions.push(`Triage ${summary.new} new inbound request${summary.new === 1 ? '' : 's'} so the queue stops acting like a passive inbox.`);
  }

  if (summary.waiting > 0) {
    actions.push(`Clear ${summary.waiting} waiting item${summary.waiting === 1 ? '' : 's'} with explicit next-step notes or ownership.`);
  }

  if (byPriority.critical + byPriority.high > 0) {
    actions.push(`Protect the high-value queue. ${byPriority.critical + byPriority.high} founder, partnership, or escalated items need active handling.`);
  }

  if (!actions.length) {
    actions.push('The contact queue is under control. Keep response ownership visible as new inbound lands.');
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: queue.length,
      byStatus: summary,
      byPriority,
      open: queue.filter((entry) => entry.status !== 'closed').length,
      unowned: queue.filter((entry) => !entry.owner).length,
    },
    actions,
    queue,
    recentUpdates: queue
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8),
  };
}
