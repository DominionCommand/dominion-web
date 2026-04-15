import { appendFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

export type ActivityEntity = 'season-control' | 'control-tower' | 'war-room' | 'invite-queue' | 'founder-pipeline' | 'alliances' | 'intel-watch' | 'campaigns' | 'release-room' | 'roadmap' | 'contact-queue';

export type ActivityRecord = {
  id: string;
  ts: string;
  entity: ActivityEntity;
  action: string;
  summary: string;
  actor: string;
  detail?: string;
  metadata?: Record<string, string>;
};

function getActivityLogFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'activity-log.jsonl'),
  };
}

export async function recordActivity(record: Omit<ActivityRecord, 'id' | 'ts'>) {
  const { dataDir, filePath } = getActivityLogFilePath();
  await mkdir(dataDir, { recursive: true });
  const entry: ActivityRecord = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...record,
  };

  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf8');
  return entry;
}

export async function readActivityLog(limit = 40): Promise<ActivityRecord[]> {
  const { filePath } = getActivityLogFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ActivityRecord)
      .filter((entry) => entry && typeof entry.id === 'string' && typeof entry.summary === 'string')
      .sort((a, b) => b.ts.localeCompare(a.ts))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function buildActivitySnapshot(limit = 30) {
  const entries = await readActivityLog(limit);
  const byEntity = entries.reduce<Record<ActivityEntity, number>>((acc, entry) => {
    acc[entry.entity] = (acc[entry.entity] || 0) + 1;
    return acc;
  }, {
    'season-control': 0,
    'control-tower': 0,
    'war-room': 0,
    'invite-queue': 0,
    'founder-pipeline': 0,
    'alliances': 0,
    'intel-watch': 0,
    campaigns: 0,
    'release-room': 0,
    roadmap: 0,
    'contact-queue': 0,
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: entries.length,
      byEntity,
      latestTs: entries[0]?.ts ?? null,
    },
    entries,
  };
}
