import { IntelWatchConsole } from '../../components/IntelWatchConsole';
import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';
import { buildPlaytestSummary } from '../../lib/funnel';
import { buildIntelWatchSnapshot } from '../../lib/intel-watch';
import { readLeads, summarizeLeads } from '../../lib/leads';

const waveLabels = {
  'wave-0-founder': 'Wave 0, founder strike team',
  'wave-1-mobile-core': 'Wave 1, mobile core',
  'wave-2-alliance-pressure': 'Wave 2, alliance pressure',
  'wave-3-broader-market': 'Wave 3, broader market',
} as const;

function getWaveLabel(wave: keyof typeof waveLabels) {
  return waveLabels[wave];
}

export default async function IntelPage() {
  const leads = await readLeads();
  const leadSummary = summarizeLeads(leads);
  const playtestSummary = buildPlaytestSummary(leads);
  const intelSnapshot = await buildIntelWatchSnapshot(leads);
  const roadmapActive = siteContent.roadmap.find((item) => item.status === 'active') || null;
  const topSources = Object.entries(leadSummary.bySource)
    .map(([source, count]) => `${source} (${count})`)
    .join(', ');
  const topFactions = Object.entries(leadSummary.byFaction)
    .sort((a, b) => b[1] - a[1])
    .map(([faction, count]) => `${faction} (${count})`)
    .join(', ');
  const topPlayStyles = Object.entries(leadSummary.byPlayStyle)
    .sort((a, b) => b[1] - a[1])
    .map(([style, count]) => `${style} (${count})`)
    .join(', ');
  const topAllianceRoles = Object.entries(leadSummary.byAllianceRole)
    .sort((a, b) => b[1] - a[1])
    .map(([role, count]) => `${role} (${count})`)
    .join(', ');

  return (
    <main>
      <PageHero
        eyebrow="Intel"
        title="Build, funnel, and operator signals now share a live watch surface"
        body="Intel now goes beyond a read-only summary. The page pulls funnel motion, frontline pressure, launch readiness, and operator activity into a persisted watch board the team can actually run from."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Intel posture</h3>
            <p>Posture: {intelSnapshot.summary.posture}</p>
            <p>Open watch items: {intelSnapshot.summary.unresolvedCount}</p>
            <p>Owner: {intelSnapshot.summary.owner}</p>
          </article>
          <article className="card">
            <h3>Lead funnel</h3>
            <p>Total leads: {leadSummary.total}</p>
            <p>Unique leads: {leadSummary.unique}</p>
            <p>Top sources: {topSources || 'none yet'}</p>
            <p>Faction interest: {topFactions || 'none yet'}</p>
            <p>Play style mix: {topPlayStyles || 'none yet'}</p>
            <p>Alliance roles: {topAllianceRoles || 'none yet'}</p>
          </article>
          <article className="card">
            <h3>Playtest pulse</h3>
            <p>Next wave: {getWaveLabel(playtestSummary.recommendedNextWave)}</p>
            <p>iOS-ready: {playtestSummary.totals.iosReady}</p>
            <p>Tacticians: {playtestSummary.totals.tacticians}</p>
            <p>Faction coverage complete: {playtestSummary.totals.factionCoverageComplete ? 'yes' : 'not yet'}</p>
          </article>
          <article className="card">
            <h3>Activity + roadmap</h3>
            <p>Recent activity burst: {intelSnapshot.summary.activityBurst}</p>
            <p>Critical fronts: {intelSnapshot.summary.criticalFronts}</p>
            <p>{roadmapActive?.title ?? 'Unavailable'}</p>
            <p>{roadmapActive?.body ?? 'No active roadmap item yet.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Watch headline</div>
        <h2>{intelSnapshot.headline}</h2>
        <div className="grid">
          {intelSnapshot.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Watchlist</div>
        <h2>Cross-functional issues that need eyes on them</h2>
        <div className="grid">
          {intelSnapshot.watchlist.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.severity} severity · {item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
              {item.note ? <p>Note: {item.note}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator console</div>
        <h2>Persist watch status and escalation notes</h2>
        <p>The intel route is no longer read-only. Operators can now save overall posture, assign owners, and mark watch items as action-needed or resolved through the live intel-watch API.</p>
        <IntelWatchConsole initialState={intelSnapshot.state} watchlist={intelSnapshot.watchlist} />
      </section>

      <section className="section">
        <div className="eyebrow">Recent notes</div>
        <h2>Saved intel context</h2>
        <div className="grid">
          {intelSnapshot.notes.length ? intelSnapshot.notes.map((note) => (
            <article className="card" key={note.id}>
              <div className="eyebrow">{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No intel notes saved yet</h3>
              <p>Use the console above to log escalation context, signal changes, or operator handoffs.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Top candidates</div>
        <h2>Founder shortlist</h2>
        <div className="grid">
          {playtestSummary.shortlist.slice(0, 6).map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <h3>{lead.email}</h3>
              <p>Score: {lead.score}</p>
              <p>{lead.factionLabel} · {lead.platformLabel} · {lead.playStyleLabel}</p>
              <p>{getWaveLabel(lead.wave)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
