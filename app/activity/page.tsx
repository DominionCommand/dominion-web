import { PageHero } from '../../components/PageHero';
import { buildActivitySnapshot } from '../../lib/activity-log';

const entityLabels = {
  'season-control': 'Season Control',
  'control-tower': 'Control Tower',
  'war-room': 'War Room',
  'invite-queue': 'Invite Queue',
  'founder-pipeline': 'Founder Pipeline',
  'alliances': 'Alliance HQ',
  'intel-watch': 'Intel Watch',
  campaigns: 'Campaigns',
  'release-room': 'Release Room',
  roadmap: 'Roadmap',
  'contact-queue': 'Contact Queue',
} as const;

export default async function ActivityPage() {
  const snapshot = await buildActivitySnapshot();

  return (
    <main>
      <PageHero
        eyebrow="Activity"
        title="Operational changes now leave a visible trail"
        body="Dominion Nexus now records operator actions from the command surfaces so season changes, queue decisions, and war-room updates are no longer hidden inside individual modules."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recent actions</div>
            <h3>{snapshot.summary.total}</h3>
            <p>Saved actions across the latest activity window.</p>
          </article>
          {Object.entries(snapshot.summary.byEntity).map(([entity, count]) => (
            <article className="card" key={entity}>
              <div className="eyebrow">{entityLabels[entity as keyof typeof entityLabels]}</div>
              <h3>{count}</h3>
              <p>Recorded updates in this surface.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Feed</div>
        <h2>Latest operator activity</h2>
        <div className="grid">
          {snapshot.entries.length ? snapshot.entries.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="eyebrow">{entityLabels[entry.entity] ?? entry.entity}</div>
              <h3>{entry.summary}</h3>
              <p>{entry.detail || 'No extra detail attached.'}</p>
              <p>Actor: {entry.actor}</p>
              <p>{new Date(entry.ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No activity logged yet</h3>
              <p>Save something from the command center, control tower, war room, or invite queue and it will appear here.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
