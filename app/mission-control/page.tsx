import { PageHero } from '../../components/PageHero';
import { readLeads } from '../../lib/leads';
import { buildMissionControlSnapshot } from '../../lib/mission-control';

export default async function MissionControlPage() {
  const snapshot = await buildMissionControlSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Mission Control"
        title="Dominion Nexus now has a top-level operating board"
        body="This surface pulls release posture, season control, launch flow, war pressure, and commerce timing into one command snapshot so the team can see what matters first."
      />

      <section className="section">
        <div className="grid">
          {snapshot.systemPulse.map((item) => (
            <article className="card" key={item.label}>
              <div className="eyebrow">{item.label}</div>
              <h3>{item.value}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Priority board</div>
        <h2>The highest-leverage decisions and pressure points</h2>
        <div className="grid">
          {snapshot.priorityBoard.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.lane} · {item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
              <a className="button buttonSecondary" href={item.href}>Open source surface</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What mission control says to do next</h2>
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
        <h2>The issues still pushing against execution</h2>
        <div className="grid">
          {snapshot.blockers.length ? snapshot.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No blockers surfaced</h3>
              <p>The merged operating picture is not flagging a hard stop right now.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recent activity</div>
        <h2>The latest operator motion feeding the board</h2>
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
