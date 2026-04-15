import { appendFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

export type ContactRequest = {
  email: string;
  name?: string;
  topic: 'founder-access' | 'partnership' | 'press' | 'support';
  message: string;
  ts: string;
};

function getContactFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'contact-requests.jsonl'),
  };
}

export async function readContactRequests(): Promise<ContactRequest[]> {
  const { filePath } = getContactFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ContactRequest)
      .filter((entry) => typeof entry.email === 'string' && typeof entry.message === 'string');
  } catch {
    return [];
  }
}

export async function saveContactRequest(entry: ContactRequest) {
  const { dataDir, filePath } = getContactFilePath();
  await mkdir(dataDir, { recursive: true });
  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf8');
}

export function summarizeContactRequests(entries: ContactRequest[]) {
  const byTopic = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.topic] = (acc[entry.topic] || 0) + 1;
    return acc;
  }, {});

  const latest = entries
    .slice()
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 5);

  return {
    total: entries.length,
    byTopic,
    latest,
  };
}
