import { InviteQueueConsole } from '../../components/InviteQueueConsole';
import { PageHero } from '../../components/PageHero';
import { buildInviteQueue } from '../../lib/invite-queue';
import { readLeads } from '../../lib/leads';
import { buildLeadHref } from '../../lib/lead-routes';

export default async function InviteQueuePage() {
  const queue = await buildInviteQueue(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Invite Queue"
        title="Playtest invites now have a persisted operator queue"
        body="This surface turns the lead shortlist into an actual invite staging board with selected, sent, queued, and hold decisions that persist through the live API."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{queue.recommendedWave.label}</h3>
            <p>{queue.recommendedWave.qualifiedLeads} qualified leads currently fit this wave.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Selected now</div>
            <h3>{queue.summary.selectedNow}</h3>
            <p>Leads actively slotted for the next push.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invites sent</div>
            <h3>{queue.summary.invitesSent}</h3>
            <p>Operators can now track who already got outreach.</p>
          </article>
          <article className="card">
            <div className="eyebrow">On hold</div>
            <h3>{queue.summary.onHold}</h3>
            <p>Paused leads with notes stay visible instead of disappearing into docs.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Wave snapshot</div>
        <h2>Queue state by invite wave</h2>
        <div className="grid">
          {queue.groupedQueue.map((group) => (
            <article className="card" key={group.wave}>
              <h3>{group.label}</h3>
              <p>Total: {group.total}</p>
              <p>Selected: {group.selected}</p>
              <p>Sent: {group.sent}</p>
              <p>Queued: {group.queued}</p>
              <p>Hold: {group.hold}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator actions</div>
        <h2>What the queue is saying right now</h2>
        <div className="grid">
          {queue.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Decision board</div>
        <h2>Persist invite choices directly from the site</h2>
        <p>Each save writes queue state to the Dominion Nexus data layer so invite staging survives refreshes and operator handoffs.</p>
        <InviteQueueConsole initialQueue={queue.queue} />
      </section>

      <section className="section">
        <div className="eyebrow">Recent decisions</div>
        <h2>Latest queue updates</h2>
        <div className="grid">
          {queue.recentDecisions.length ? queue.recentDecisions.map((decision) => (
            <article className="card" key={`${decision.email}-${decision.updatedAt}`}>
              <div className="eyebrow">{decision.status}</div>
              <h3>{decision.email}</h3>
              <p>{decision.wave}</p>
              <p>{decision.note || 'No operator note saved.'}</p>
              <a className="button buttonSecondary" href={buildLeadHref(decision.email)}>Open intake dossier</a>
            </article>
          )) : (
            <article className="card">
              <h3>No decisions saved yet</h3>
              <p>Use the decision board above to stage the first invite actions.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
