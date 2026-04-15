import { ContactQueueConsole } from '../../components/ContactQueueConsole';
import { PageHero } from '../../components/PageHero';
import { buildContactQueueSnapshot } from '../../lib/contact-queue';
import { readContactRequests } from '../../lib/contact-intake';
import { buildLeadHref } from '../../lib/lead-routes';

export default async function ContactQueuePage() {
  const queue = await buildContactQueueSnapshot(await readContactRequests());

  return (
    <main>
      <PageHero
        eyebrow="Contact Queue"
        title="Inbound requests now flow into an operator-managed contact board"
        body="Dominion Nexus now has a real follow-up surface for founder access, partnerships, press, and support. Status, priority, ownership, and notes persist through the site API instead of disappearing into raw submissions."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Open queue</div>
            <h3>{queue.summary.open}</h3>
            <p>Requests still needing active handling.</p>
          </article>
          <article className="card">
            <div className="eyebrow">New inbound</div>
            <h3>{queue.summary.byStatus.new}</h3>
            <p>Fresh requests that still need triage.</p>
          </article>
          <article className="card">
            <div className="eyebrow">In progress</div>
            <h3>{queue.summary.byStatus['in-progress']}</h3>
            <p>Requests already owned and being worked.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Unowned</div>
            <h3>{queue.summary.unowned}</h3>
            <p>Requests without explicit ownership yet.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Queue pressure</div>
        <h2>What the contact layer is saying right now</h2>
        <div className="grid">
          {queue.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator board</div>
        <h2>Persist queue state directly from the site</h2>
        <p>Each save writes status, priority, ownership, and notes into the Dominion Nexus data layer and records queue motion in the shared activity log.</p>
        <ContactQueueConsole initialQueue={queue.queue} />
      </section>

      <section className="section">
        <div className="eyebrow">Recent queue updates</div>
        <h2>Latest touched items</h2>
        <div className="grid">
          {queue.recentUpdates.length ? queue.recentUpdates.map((entry) => (
            <article className="card" key={`${entry.requestId}-${entry.updatedAt}`}>
              <div className="eyebrow">{entry.status} · {entry.priority}</div>
              <h3>{entry.name || entry.email}</h3>
              <p>{entry.owner ? `Owner: ${entry.owner}` : 'Owner: unassigned'}</p>
              <p>{entry.note || entry.message}</p>
              <a className="button buttonSecondary" href={buildLeadHref(entry.email)}>Open intake dossier</a>
            </article>
          )) : (
            <article className="card">
              <h3>No queue updates yet</h3>
              <p>The board is ready for the first operator triage pass.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
