import { appendFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

export type LeadRecord = {
  email: string;
  source: string;
  ts: string;
  faction?: string;
  platform?: string;
  playStyle?: string;
  allianceRole?: string;
  weeklyHours?: string;
  testIntent?: string;
};

function getLeadsFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'preregister-leads.jsonl'),
  };
}

export async function readLeads(): Promise<LeadRecord[]> {
  const { filePath } = getLeadsFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const merged = new Map<string, LeadRecord>();

    raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LeadRecord)
      .filter((lead) => typeof lead.email === 'string')
      .forEach((lead) => {
        const email = lead.email.trim().toLowerCase();
        const previous = merged.get(email);
        merged.set(email, {
          ...previous,
          ...lead,
          email,
          ts: lead.ts || previous?.ts || new Date(0).toISOString(),
        });
      });

    return Array.from(merged.values());
  } catch {
    return [];
  }
}

export async function saveLead(lead: LeadRecord) {
  const { dataDir, filePath } = getLeadsFilePath();
  await mkdir(dataDir, { recursive: true });
  await appendFile(filePath, JSON.stringify(lead) + '\n', 'utf8');
}

export function summarizeLeads(leads: LeadRecord[]) {
  const uniqueEmails = new Set(leads.map((lead) => lead.email));
  const bySource = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});
  const byFaction = leads.reduce<Record<string, number>>((acc, lead) => {
    if (!lead.faction) return acc;
    acc[lead.faction] = (acc[lead.faction] || 0) + 1;
    return acc;
  }, {});
  const byPlayStyle = leads.reduce<Record<string, number>>((acc, lead) => {
    if (!lead.playStyle) return acc;
    acc[lead.playStyle] = (acc[lead.playStyle] || 0) + 1;
    return acc;
  }, {});
  const byAllianceRole = leads.reduce<Record<string, number>>((acc, lead) => {
    if (!lead.allianceRole) return acc;
    acc[lead.allianceRole] = (acc[lead.allianceRole] || 0) + 1;
    return acc;
  }, {});
  const byWeeklyHours = leads.reduce<Record<string, number>>((acc, lead) => {
    if (!lead.weeklyHours) return acc;
    acc[lead.weeklyHours] = (acc[lead.weeklyHours] || 0) + 1;
    return acc;
  }, {});
  const byTestIntent = leads.reduce<Record<string, number>>((acc, lead) => {
    if (!lead.testIntent) return acc;
    acc[lead.testIntent] = (acc[lead.testIntent] || 0) + 1;
    return acc;
  }, {});

  const latest = leads
    .slice()
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 5);

  return {
    total: leads.length,
    unique: uniqueEmails.size,
    bySource,
    byFaction,
    byPlayStyle,
    byAllianceRole,
    byWeeklyHours,
    byTestIntent,
    latest,
  };
}
