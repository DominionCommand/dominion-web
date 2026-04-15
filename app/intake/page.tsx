import { PageHero } from '../../components/PageHero';
import { buildIntakeDashboardSnapshot } from '../../lib/intake-dashboard';
import { readLeads } from '../../lib/leads';
import { buildLeadHref } from '../../lib/lead-routes';

const topicLabels: Record<string, string> = {
  'founder-access': 'Founder access',
  partnership: 'Partnership',
  press: 'Press',
  support: 'Support',
};

export default async function IntakePage() {
  const snapshot = await buildIntakeDashboardSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Intake"
        title="A live intake dashboard now connects leads, contact requests, and operator motion"
        body="This surface turns prereg traffic, playtest qualification, contact queue pressure, and recent operator activity into one follow-up board instead of scattering them across separate pages."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{snapshot.summary.recommendedWaveLabel}</h3>
            <p>{snapshot.summary.recommendedWaveQualified} qualified leads are currently ready for this cohort.</p>
          </article>
          <article className="card">
            <div className="eyebrow">High-priority leads</div>
            <h3>{snapshot.summary.highPriorityLeads}</h3>
            <p>Leads in invite-ready or standard follow-up territory.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Contact queue</div>
            <h3>{snapshot.summary.contactRequests}</h3>
            <p>{snapshot.summary.directInbound} founder, partnership, or press requests and {snapshot.summary.supportLoad} support items.</p>
            <p>{snapshot.summary.openContactRequests} still open, {snapshot.summary.unownedContactRequests} still unowned.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recent operator motion</div>
            <h3>{snapshot.summary.recentActivity}</h3>
            <p>Recent activity records are now visible alongside intake pressure.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What the intake layer says to do next</h2>
        <div className="grid">
          {snapshot.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Pressure mix</div>
        <h2>Where inbound demand is concentrating</h2>
        <div className="grid">
          {snapshot.pressure.topSources.map((entry) => (
            <article className="card" key={`source-${entry.label}`}>
              <div className="eyebrow">Lead source</div>
              <h3>{entry.label}</h3>
              <p>{entry.count} leads</p>
            </article>
          ))}
          {snapshot.pressure.topTopics.map((entry) => (
            <article className="card" key={`topic-${entry.label}`}>
              <div className="eyebrow">Contact topic</div>
              <h3>{topicLabels[entry.label] ?? entry.label}</h3>
              <p>{entry.count} requests</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Shortlist</div>
        <h2>The strongest current follow-up targets</h2>
        <div className="grid">
          {snapshot.shortlist.map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <div className="eyebrow">{lead.invitePriority}</div>
              <h3>{lead.email}</h3>
              <p>Score: {lead.score}</p>
              <p>{lead.factionLabel} · {lead.platformLabel} · {lead.playStyleLabel}</p>
              <p>{lead.scoreReasons.join(' · ')}</p>
              <a className="button buttonSecondary" href={buildLeadHref(lead.email)}>Open intake dossier</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Queue and activity</div>
        <h2>Latest public inbound plus operator trail</h2>
        <div className="grid">
          {snapshot.latestContactRequests.map((entry) => (
            <article className="card" key={`${entry.email}-${entry.ts}`}>
              <div className="eyebrow">{topicLabels[entry.topic] ?? entry.topic}</div>
              <h3>{entry.name || entry.email}</h3>
              <p>{entry.message}</p>
              <p>{entry.status} · {entry.priority} · {entry.owner || 'unassigned'}</p>
              <a className="button buttonSecondary" href={buildLeadHref(entry.email)}>Open intake dossier</a>
            </article>
          ))}
          {snapshot.recentActivity.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="eyebrow">{entry.entity}</div>
              <h3>{entry.action}</h3>
              <p>{entry.summary}</p>
              <p>{entry.actor}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
