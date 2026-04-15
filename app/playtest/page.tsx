import { PageHero } from '../../components/PageHero';
import { PlaytestIntakeForm } from '../../components/PlaytestIntakeForm';
import { siteContent } from '../../lib/content';
import { buildPlaytestSummary } from '../../lib/funnel';
import { readLeads } from '../../lib/leads';
import { getWaveLabel } from '../../lib/waves';

export default async function PlaytestPage() {
  const leads = await readLeads();
  const summary = buildPlaytestSummary(leads);

  return (
    <main>
      <PageHero
        eyebrow="Playtest"
        title="Prototype testing now has a real intake, scoring, and wave-qualification surface"
        body="This page now does more than report readiness. It captures candidate intent, alliance role fit, time commitment, and immediate wave priority through a live intake path."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Current state</h3>
            <p>{siteContent.playtest.currentState}</p>
          </article>
          <article className="card">
            <h3>Next recommended wave</h3>
            <p>{getWaveLabel(summary.recommendedNextWave)}</p>
            <p>Qualified leads: {summary.byWave[summary.recommendedNextWave]}</p>
          </article>
          <article className="card">
            <h3>Readiness gates</h3>
            <p>iOS-ready leads: {summary.totals.iosReady}</p>
            <p>Tactician leads: {summary.totals.tacticians}</p>
            <p>Faction coverage complete: {summary.totals.factionCoverageComplete ? 'yes' : 'not yet'}</p>
          </article>
          <article className="card">
            <h3>Alliance mix</h3>
            <p>Shot callers: {summary.totals.allianceRoleCoverage.shotCallers}</p>
            <p>Logistics: {summary.totals.allianceRoleCoverage.logistics}</p>
            <p>Scouts: {summary.totals.allianceRoleCoverage.scouts}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Apply now</div>
        <h2>Turn interest into a test-ready profile</h2>
        <p>Applicants are scored for platform fit, alliance usefulness, likely session depth, and how early they want access.</p>
        <PlaytestIntakeForm />
      </section>

      <section className="section">
        <div className="eyebrow">Validation goals</div>
        <h2>What the first cohorts need to prove</h2>
        <div className="grid">
          {siteContent.playtest.goals.map((goal) => (
            <article className="card" key={goal}>
              <p>{goal}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Wave mix</div>
        <h2>Current invite pool</h2>
        <div className="grid">
          {Object.entries(summary.byWave).map(([wave, count]) => (
            <article className="card" key={wave}>
              <h3>{getWaveLabel(wave as keyof typeof summary.byWave)}</h3>
              <p>{count} leads</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Founder shortlist</div>
        <h2>Highest scoring playtest candidates</h2>
        <div className="grid">
          {summary.shortlist.slice(0, 6).map((lead) => (
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
