import { buildPlaytestSummary, explainLeadScore, scoreLead } from '../../../lib/funnel';
import { readLeads, saveLead } from '../../../lib/leads';
import { getWaveLabel } from '../../../lib/waves';

const allowedPlatforms = new Set(['ios', 'android', 'web']);
const allowedPlayStyles = new Set(['builder', 'raider', 'tactician']);
const allowedAllianceRoles = new Set(['shot-caller', 'frontliner', 'logistics', 'scout']);
const allowedWeeklyHours = new Set(['1-3', '4-5', '6-10', '10-plus']);
const allowedTestIntent = new Set(['day-one', 'weekend', 'spectator']);

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function buildPlaytestResponse(leads: Awaited<ReturnType<typeof readLeads>>, leadProfile: ReturnType<typeof scoreLead>, duplicate: boolean) {
  const playtest = buildPlaytestSummary(leads);
  const recommendedWave = playtest.recommendedNextWave;

  return Response.json({
    ok: true,
    duplicate,
    leadProfile,
    playtest: {
      recommendedWave,
      recommendedWaveLabel: getWaveLabel(recommendedWave),
      qualifiedLeads: playtest.byWave[recommendedWave],
      allianceRoleCoverage: playtest.totals.allianceRoleCoverage,
      factionCoverageComplete: playtest.totals.factionCoverageComplete,
      shortlist: playtest.shortlist.slice(0, 5),
    },
    scoreReasons: explainLeadScore(leadProfile),
  });
}

export async function GET() {
  const leads = await readLeads();
  const playtest = buildPlaytestSummary(leads);
  const recommendedWave = playtest.recommendedNextWave;

  return Response.json({
    ok: true,
    recommendedWave,
    recommendedWaveLabel: getWaveLabel(recommendedWave),
    totals: playtest.totals,
    byWave: playtest.byWave,
    shortlist: playtest.shortlist,
    latest: playtest.latest,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== 'string' || !body.email.includes('@')) {
    return Response.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const source = typeof body.source === 'string' ? body.source.trim() : 'playtest-page';
  const faction = normalizeOptionalString(body.faction);
  const platform = normalizeOptionalString(body.platform)?.toLowerCase();
  const playStyle = normalizeOptionalString(body.playStyle)?.toLowerCase();
  const allianceRole = normalizeOptionalString(body.allianceRole)?.toLowerCase();
  const weeklyHours = normalizeOptionalString(body.weeklyHours)?.toLowerCase();
  const testIntent = normalizeOptionalString(body.testIntent)?.toLowerCase();
  const ts = new Date().toISOString();
  const leads = await readLeads();

  if (platform && !allowedPlatforms.has(platform)) {
    return Response.json({ ok: false, error: 'Invalid platform' }, { status: 400 });
  }

  if (playStyle && !allowedPlayStyles.has(playStyle)) {
    return Response.json({ ok: false, error: 'Invalid play style' }, { status: 400 });
  }

  if (allianceRole && !allowedAllianceRoles.has(allianceRole)) {
    return Response.json({ ok: false, error: 'Invalid alliance role' }, { status: 400 });
  }

  if (weeklyHours && !allowedWeeklyHours.has(weeklyHours)) {
    return Response.json({ ok: false, error: 'Invalid weekly hours' }, { status: 400 });
  }

  if (testIntent && !allowedTestIntent.has(testIntent)) {
    return Response.json({ ok: false, error: 'Invalid test intent' }, { status: 400 });
  }

  const existingLead = leads.find((lead) => lead.email === email);

  if (existingLead) {
    const mergedLead = {
      ...existingLead,
      source,
      ts,
      faction: faction ?? existingLead.faction,
      platform: platform ?? existingLead.platform,
      playStyle: playStyle ?? existingLead.playStyle,
      allianceRole: allianceRole ?? existingLead.allianceRole,
      weeklyHours: weeklyHours ?? existingLead.weeklyHours,
      testIntent: testIntent ?? existingLead.testIntent,
    };
    await saveLead(mergedLead);
    const updated = leads.map((lead) => (lead.email === email ? mergedLead : lead));
    return buildPlaytestResponse(updated, scoreLead(mergedLead), true);
  }

  const lead = { email, source, ts, faction, platform, playStyle, allianceRole, weeklyHours, testIntent };
  await saveLead(lead);
  const updated = [...leads, lead];

  return buildPlaytestResponse(updated, scoreLead(lead), false);
}
