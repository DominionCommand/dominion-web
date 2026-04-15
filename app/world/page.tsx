import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';
import { readLeads } from '../../lib/leads';
import { buildOperationsSnapshot } from '../../lib/operations';

export default async function WorldPage() {
  const snapshot = await buildOperationsSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="World State"
        title="The war map now has a defined conquest shell"
        body="Zones, pressure, objectives, and seasonal beats are now modeled directly in the implementation so the web layer can support prototype framing and live data later."
      />

      <section className="section">
        <div className="grid">
          {snapshot.activeOperations.map((operation) => (
            <article className="card" key={operation.slug}>
              <div className="eyebrow">{operation.priority} priority · {operation.pressure} pressure</div>
              <h3>{operation.zone}</h3>
              <p>{operation.control}</p>
              <p>{operation.objective}</p>
              <p>Recommended commander: {operation.recommendedCommander}</p>
              <p>Reward: {operation.reward}</p>
              <a className="button buttonSecondary" href={`/world/${operation.slug}`}>Open zone brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Season beats</div>
        <h2>Conquest pacing</h2>
        <div className="grid">
          {siteContent.seasonBeats.map((beat) => (
            <article className="card" key={beat.phase}>
              <div className="eyebrow">{beat.focus}</div>
              <h3>{beat.phase}</h3>
              <p>{beat.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
