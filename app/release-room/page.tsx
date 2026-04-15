import { PageHero } from '../../components/PageHero';
import { ReleaseRoomConsole } from '../../components/ReleaseRoomConsole';
import { readLeads } from '../../lib/leads';
import { buildReleaseRoomSnapshot } from '../../lib/release-room';

export default async function ReleaseRoomPage() {
  const snapshot = await buildReleaseRoomSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Release Room"
        title="Dominion Nexus now has a dedicated release decision surface"
        body="This page turns season state, invite readiness, intake pressure, and monetization hooks into one visible go, hold, or blocked call instead of scattering the release picture across separate tools."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Decision</div>
            <h3>{snapshot.summary.decision}</h3>
            <p>{snapshot.summary.nextMilestone}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Readiness</div>
            <h3>{snapshot.summary.readyCount} green checks</h3>
            <p>{snapshot.summary.blockedCount} blockers and {snapshot.summary.watchCount} watch items are active.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invite posture</div>
            <h3>{snapshot.summary.selectedInvites} selected</h3>
            <p>{snapshot.summary.invitesSent} invites are marked sent for {snapshot.summary.recommendedWave}.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Active lane</div>
            <h3>{snapshot.summary.activeFocusLane}</h3>
            <p>{snapshot.summary.owner} is the current release owner.</p>
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
        <div className="eyebrow">Gate checklist</div>
        <h2>What is green, what is watching, and what is blocked</h2>
        <div className="grid">
          {snapshot.checklist.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
              <a className="button buttonSecondary" href={item.surface}>Open source surface</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Release console</div>
        <h2>Persist the current ship call</h2>
        <ReleaseRoomConsole initialState={snapshot.state} />
      </section>

      <section className="section">
        <div className="eyebrow">Blockers</div>
        <h2>The issues still pushing against launch</h2>
        <div className="grid">
          {snapshot.blockers.length ? snapshot.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No hard blockers surfaced</h3>
              <p>The current data flow is not flagging a stop condition across command, invites, intake, or store timing.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recent activity</div>
        <h2>The latest operator motion feeding this decision</h2>
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

      <section className="section">
        <div className="eyebrow">Saved notes</div>
        <h2>Release call memory</h2>
        <div className="grid">
          {snapshot.notes.length ? snapshot.notes.map((note) => (
            <article className="card" key={note.id}>
              <div className="eyebrow">{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No release notes saved yet</h3>
              <p>Use the console above to pin the current shipping posture and next milestone.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
