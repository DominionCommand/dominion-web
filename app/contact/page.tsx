import { ContactIntakeForm } from '../../components/ContactIntakeForm';
import { PageHero } from '../../components/PageHero';
import { buildContactQueueSnapshot } from '../../lib/contact-queue';
import { readContactRequests, summarizeContactRequests } from '../../lib/contact-intake';

const topicLabels: Record<string, string> = {
  'founder-access': 'Founder access',
  partnership: 'Partnership',
  press: 'Press',
  support: 'Support',
};

export default async function ContactPage() {
  const requests = await readContactRequests();
  const summary = summarizeContactRequests(requests);
  const queue = await buildContactQueueSnapshot(requests);

  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Dominion Nexus now has a live inbound request queue"
        body="This page is no longer just a mailto placeholder. Founder, partnership, press, and support requests can now be submitted through a real intake path backed by local persistence."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Total requests</h3>
            <p>{summary.total}</p>
          </article>
          <article className="card">
            <h3>Founder access</h3>
            <p>{summary.byTopic['founder-access'] ?? 0}</p>
          </article>
          <article className="card">
            <h3>Partnership + press</h3>
            <p>{(summary.byTopic.partnership ?? 0) + (summary.byTopic.press ?? 0)}</p>
          </article>
          <article className="card">
            <h3>Direct fallback</h3>
            <p><a href="mailto:founders@playdominionnexus.com">founders@playdominionnexus.com</a></p>
          </article>
          <article className="card">
            <h3>Open queue</h3>
            <p>{queue.summary.open} active requests</p>
            <p><a href="/contact-queue">Open contact queue</a></p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Inbound intake</div>
        <h2>Route new requests into the queue</h2>
        <p>Use this to capture founder access questions, partnership interest, press requests, and support issues without losing them in static page copy.</p>
        <ContactIntakeForm />
      </section>

      <section className="section">
        <div className="eyebrow">Recent queue activity</div>
        <h2>Latest submissions</h2>
        <div className="grid">
          {summary.latest.length ? summary.latest.map((entry) => (
            <article className="card" key={`${entry.email}-${entry.ts}`}>
              <div className="eyebrow">{topicLabels[entry.topic] ?? entry.topic}</div>
              <h3>{entry.name || entry.email}</h3>
              <p>{entry.message}</p>
              <p>{new Date(entry.ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No requests yet</h3>
              <p>The contact queue is live and ready for the first inbound requests.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
