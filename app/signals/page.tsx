import { PageHero } from '../../components/PageHero';
import { buildSignalsSnapshot } from '../../lib/signals';
import { readLeads } from '../../lib/leads';

export default async function SignalsPage() {
  const signals = await buildSignalsSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Signals"
        title="A live signal board now turns prereg data into operator actions"
        body="This surface pulls lead velocity, acquisition mix, alliance-role gaps, and frontline pressure into one place so the team can act on what the funnel and world state are actually saying."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Total leads</div>
            <h3>{signals.metrics.totalLeads}</h3>
            <p>{signals.metrics.uniqueLeads} unique profiles currently sit in the funnel.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Last 7 days</div>
            <h3>{signals.metrics.last7dLeads}</h3>
            <p>{signals.metrics.leadVelocityDelta >= 0 ? '+' : ''}{signals.metrics.leadVelocityDelta} versus the previous 7-day window.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{signals.metrics.recommendedWave}</h3>
            <p>{signals.metrics.recommendedWaveQualified} leads currently qualify.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Live event hook</div>
            <h3>{signals.activeEvent?.name ?? 'No active event'}</h3>
            <p>{signals.activeEvent?.window ?? 'Event timing still needs to be locked.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Headline</div>
        <h2>{signals.headline}</h2>
        <div className="grid">
          {signals.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Lead flow</div>
        <h2>Seven-day intake trend</h2>
        <div className="grid">
          {signals.dailyLeadFlow.map((entry) => (
            <article className="card" key={entry.day}>
              <h3>{entry.day}</h3>
              <p>{entry.count} leads captured</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Acquisition mix</div>
        <h2>Where demand is currently coming from</h2>
        <div className="grid">
          {signals.topSources.length ? signals.topSources.map((source) => (
            <article className="card" key={source.source}>
              <h3>{source.source}</h3>
              <p>{source.count} leads</p>
            </article>
          )) : (
            <article className="card">
              <h3>No source data yet</h3>
              <p>Lead source breakdown will populate once more prereg and playtest traffic comes through.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Pressure signals</div>
        <h2>What needs action next</h2>
        <div className="grid">
          {signals.pressureSignals.map((signal) => (
            <article className="card" key={signal.slug}>
              <div className="eyebrow">{signal.severity} severity</div>
              <h3>{signal.title}</h3>
              <p>{signal.detail}</p>
              <p>{signal.action}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
