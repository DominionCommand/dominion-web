import { PageHero } from '../../components/PageHero';
import { readLeads } from '../../lib/leads';
import { buildDashboardSnapshot } from '../../lib/dashboard';

export default async function DashboardPage() {
  const snapshot = await buildDashboardSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Dashboard"
        title="Dominion Nexus now has a live executive dashboard"
        body="This surface turns the existing dashboard API into a usable product layer for checking funnel health, active fronts, prototype readiness, and founder follow-up from one place."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended invite wave</div>
            <h3>{snapshot.summary.recommendedWave.label}</h3>
            <p>{snapshot.summary.recommendedWave.qualifiedLeads} qualified leads are currently ready.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Hottest front</div>
            <h3>{snapshot.summary.hottestFront?.zone ?? 'No active frontline yet'}</h3>
            <p>
              {snapshot.summary.hottestFront
                ? `${snapshot.summary.hottestFront.priority} priority, led by ${snapshot.summary.hottestFront.commander}.`
                : 'World-state pressure will appear here once operations data is available.'}
            </p>
          </article>
          <article className="card">
            <div className="eyebrow">Weakest faction coverage</div>
            <h3>{snapshot.summary.weakestFaction?.name ?? 'Coverage pending'}</h3>
            <p>
              {snapshot.summary.weakestFaction
                ? `${snapshot.summary.weakestFaction.leads} tagged leads currently sit in this lane.`
                : 'Faction demand coverage has not been calculated yet.'}
            </p>
          </article>
          <article className="card">
            <div className="eyebrow">Founder pipeline</div>
            <h3>{snapshot.founderPipeline.summary.qualified} qualified</h3>
            <p>{snapshot.founderPipeline.summary.contacting} are actively being worked.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Prototype readiness</div>
            <h3>{snapshot.prototype.readiness.iosReady} iOS-ready</h3>
            <p>{snapshot.prototype.readiness.factionCoverageComplete ? 'Faction coverage is balanced enough for broader prototype sessions.' : 'Faction coverage is still uneven and needs more balancing.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Active blockers</div>
        <h2>What needs attention next</h2>
        <div className="grid">
          {snapshot.summary.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Active fronts</div>
        <h2>Current operation pressure from the live world shell</h2>
        <div className="grid">
          {snapshot.operations.activeOperations.slice(0, 4).map((operation) => (
            <article className="card" key={operation.slug}>
              <div className="eyebrow">{operation.priority} · {operation.pressure} pressure</div>
              <h3>{operation.zone}</h3>
              <p>{operation.objective}</p>
              <p>{operation.faction} · {operation.recommendedCommander}</p>
              <a className="button buttonSecondary" href={`/world/${operation.slug}`}>Open zone brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Founder queue</div>
        <h2>Highest-priority profiles already surfaced by the funnel</h2>
        <div className="grid">
          {snapshot.summary.founderQueue.length ? snapshot.summary.founderQueue.map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <h3>{lead.email}</h3>
              <p>Score: {lead.score}</p>
              <p>Wave: {lead.wave}</p>
              <p>Faction: {lead.factionLabel}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No founder leads queued yet</h3>
              <p>As prereg and playtest capture fills in, the highest-value founder candidates will surface here automatically.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Module shortcuts</div>
        <h2>Jump straight into the systems driving this dashboard</h2>
        <div className="grid">
          {[
            ['Control tower', '/control-tower', 'Cross-functional execution and command status.'],
            ['War room', '/war-room', 'Frontline focus, owners, and active pressure.'],
            ['Founder pipeline', '/founder-pipeline', 'Qualified leads, follow-up, and handoff.'],
            ['Recruitment', '/recruitment', 'Campaign priorities and faction coverage gaps.'],
            ['Prototype', '/prototype', 'Scenario selection, build status, and notes.'],
            ['Dashboard API', '/api/dashboard', 'Structured JSON snapshot for automation and integrations.'],
          ].map(([title, href, body]) => (
            <article className="card" key={href}>
              <h3>{title}</h3>
              <p>{body}</p>
              <a className="button buttonSecondary" href={href}>Open {title}</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
