import { ControlTowerConsole } from '../../components/ControlTowerConsole';
import { PageHero } from '../../components/PageHero';
import { buildControlTowerSnapshot } from '../../lib/control-tower';
import { readLeads } from '../../lib/leads';

export default async function ControlTowerPage() {
  const snapshot = await buildControlTowerSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Control Tower"
        title="Dominion Nexus now has a single cross-functional execution surface"
        body="This page pulls launch readiness, invite flow, growth execution, and war pressure into one operator view so the team can move without hopping between disconnected pages."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Tower status</div>
            <h3>{snapshot.statusSummary.towerStatus}</h3>
            <p>{snapshot.statusSummary.focusLane} is the active focus lane.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Launch status</div>
            <h3>{snapshot.statusSummary.launchStatus}</h3>
            <p>{snapshot.statusSummary.qualifiedWaveLeads} leads currently qualify for the active recommended wave.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invite flow</div>
            <h3>{snapshot.statusSummary.selectedInvites} selected</h3>
            <p>{snapshot.statusSummary.invitesSent} invites are already marked sent.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Growth execution</div>
            <h3>{snapshot.statusSummary.activeCampaigns} active</h3>
            <p>{snapshot.statusSummary.blockedCampaigns} campaigns are blocked right now.</p>
          </article>
          <article className="card">
            <div className="eyebrow">War pressure</div>
            <h3>{snapshot.statusSummary.criticalFronts} critical fronts</h3>
            <p>{snapshot.statusSummary.totalLeads} total leads and {snapshot.statusSummary.uniqueLeads} unique profiles feed the current operating picture.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Headline</div>
        <h2>{snapshot.headline}</h2>
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
        <h2>What still needs attention</h2>
        <div className="grid">
          {snapshot.blockers.length ? snapshot.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No critical blockers surfaced</h3>
              <p>The current data flow is not flagging a hard stop across launch, growth, or playtest operations.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Execution queue</div>
        <h2>Cross-functional work pulled into one lane board</h2>
        <div className="grid">
          {snapshot.executionQueue.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.lane} · {item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
              <p>Surface: {item.surface}</p>
              {item.operatorNote ? <p>Note: {item.operatorNote}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator console</div>
        <h2>Persist tower state and queue execution from the website</h2>
        <p>The control tower is no longer read-only. Operators can now save command focus, notes, and per-item execution status through the live control-tower API.</p>
        <ControlTowerConsole initialState={snapshot.state} queue={snapshot.executionQueue} />
      </section>

      <section className="section">
        <div className="eyebrow">Saved notes</div>
        <h2>Recent cross-functional command notes</h2>
        <div className="grid">
          {snapshot.notes.length ? snapshot.notes.map((note) => (
            <article className="card" key={note.id}>
              <h3>{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No control tower notes saved yet</h3>
              <p>Use the operator console to leave launch, growth, or war-room handoff notes for the team.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Module links</div>
        <h2>Jump directly into the systems feeding this board</h2>
        <div className="grid">
          <article className="card">
            <h3>Signals</h3>
            <p>{snapshot.modules.signals.headline}</p>
            <a className="button buttonSecondary" href="/signals">Open signals</a>
          </article>
          <article className="card">
            <h3>Launch plan</h3>
            <p>{snapshot.modules.launchPlan.summary.recommendedWave.label} is the current target wave.</p>
            <a className="button buttonSecondary" href="/launch-plan">Open launch plan</a>
          </article>
          <article className="card">
            <h3>Invite queue</h3>
            <p>{snapshot.modules.inviteQueue.summary.selectedNow} leads are actively selected for the next push.</p>
            <a className="button buttonSecondary" href="/invite-queue">Open invite queue</a>
          </article>
          <article className="card">
            <h3>Recruitment</h3>
            <p>{snapshot.modules.recruitment.campaigns[0]?.title ?? 'Campaigns will appear here as data fills in.'}</p>
            <a className="button buttonSecondary" href="/recruitment">Open recruitment</a>
          </article>
          <article className="card">
            <h3>Founder pipeline</h3>
            <p>{snapshot.modules.founderPipeline.actions[0]}</p>
            <a className="button buttonSecondary" href="/founder-pipeline">Open founder pipeline</a>
          </article>
        </div>
      </section>
    </main>
  );
}
