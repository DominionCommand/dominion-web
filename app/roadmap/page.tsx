import { PageHero } from '../../components/PageHero';
import { readLeads } from '../../lib/leads';
import { buildRoadmapSnapshot } from '../../lib/roadmap-control';

export default async function RoadmapPage() {
  const snapshot = await buildRoadmapSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Roadmap Control"
        title="Dominion Nexus now has a live roadmap surface"
        body="The roadmap is no longer just static phase copy. This page now ties delivery phases to route coverage, release posture, control-tower status, blockers, and operator notes."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Active phase</div>
            <h3>{snapshot.summary.activePhase ?? 'Not set'}</h3>
            <p>{snapshot.headline}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Next phase</div>
            <h3>{snapshot.summary.nextPhase ?? 'Not set'}</h3>
            <p>Roadmap owner: {snapshot.summary.owner}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Release posture</div>
            <h3>{snapshot.summary.releaseDecision}</h3>
            <p>Control tower is currently {snapshot.summary.controlTowerStatus}.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Execution pressure</div>
            <h3>{snapshot.summary.totalBlockers} blockers</h3>
            <p>{snapshot.summary.recentActivity} recent activity records are feeding roadmap context.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Phases</div>
        <h2>Delivery stages now carry owners, next deliverables, and derived progress</h2>
        <div className="grid">
          {snapshot.phases.map((phase) => (
            <article className="card" key={phase.phase}>
              <div className="eyebrow">{phase.phase} · {phase.status}</div>
              <h3>{phase.title}</h3>
              <p>{phase.body}</p>
              <p>Owner: {phase.owner}</p>
              <p>Completion signal: {phase.completion}%</p>
              <p>Next deliverable: {phase.nextDeliverable}</p>
              {phase.operatorNote ? <p>Operator note: {phase.operatorNote}</p> : null}
              <div className="stackList">
                {phase.metrics.map((metric) => <p key={metric}>{metric}</p>)}
              </div>
              <div className="stackList">
                {phase.dependencies.map((dependency) => <p key={dependency}>Depends on: {dependency}</p>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What the roadmap control layer says to build next</h2>
        <div className="grid">
          {snapshot.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Blockers</div>
        <h2>Issues still pushing against execution</h2>
        <div className="grid">
          {snapshot.blockers.length ? snapshot.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No blockers surfaced</h3>
              <p>The roadmap control layer is not flagging a hard stop right now.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recent activity</div>
        <h2>The latest changes feeding roadmap context</h2>
        <div className="grid">
          {snapshot.recentActivity.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="eyebrow">{entry.entity}</div>
              <h3>{entry.summary}</h3>
              <p>{entry.detail ?? 'No detail attached.'}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
