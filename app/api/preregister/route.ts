import { buildPlaytestSummary, scoreLead } from '../../../lib/funnel';
import { readLeads, saveLead, summarizeLeads } from '../../../lib/leads';
import { buildPrototypeSnapshot } from '../../../lib/prototype';

const allowedPlatforms = new Set(['ios', 'android', 'web']);
const allowedPlayStyles = new Set(['builder', 'raider', 'tactician']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== 'string' || !body.email.includes('@')) {
    return Response.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const source = typeof body.source === 'string' ? body.source.trim() : 'web-preregister';
  const faction = normalizeOptionalString(body.faction);
  const platform = normalizeOptionalString(body.platform)?.toLowerCase();
  const playStyle = normalizeOptionalString(body.playStyle)?.toLowerCase();
  const ts = new Date().toISOString();
  const leads = await readLeads();

  if (platform && !allowedPlatforms.has(platform)) {
    return Response.json({ ok: false, error: 'Invalid platform' }, { status: 400 });
  }

  if (playStyle && !allowedPlayStyles.has(playStyle)) {
    return Response.json({ ok: false, error: 'Invalid play style' }, { status: 400 });
  }

  const existingLead = leads.find((lead) => lead.email === email);

  if (existingLead) {
    const scoredLead = scoreLead(existingLead);
    const playtest = buildPlaytestSummary(leads);
    const prototype = await buildPrototypeSnapshot(leads);

    return Response.json({
      ok: true,
      duplicate: true,
      summary: summarizeLeads(leads),
      leadProfile: scoredLead,
      playtest: {
        recommendedWave: playtest.recommendedNextWave,
        qualifiedLeads: playtest.byWave[playtest.recommendedNextWave],
      },
      prototype: {
        headline: prototype.headline,
        recommendedScenario: prototype.prototypeScenarios[0] ?? null,
      },
    });
  }

  const lead = { email, source, ts, faction, platform, playStyle };
  await saveLead(lead);
  const updated = [...leads, lead];
  const scoredLead = scoreLead(lead);
  const playtest = buildPlaytestSummary(updated);
  const prototype = await buildPrototypeSnapshot(updated);

  return Response.json({
    ok: true,
    duplicate: false,
    summary: summarizeLeads(updated),
    leadProfile: scoredLead,
    playtest: {
      recommendedWave: playtest.recommendedNextWave,
      qualifiedLeads: playtest.byWave[playtest.recommendedNextWave],
    },
    prototype: {
      headline: prototype.headline,
      recommendedScenario: prototype.prototypeScenarios[0] ?? null,
    },
  });
}
