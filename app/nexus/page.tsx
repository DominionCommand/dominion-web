import { PageHero } from '../../components/PageHero';
import { buildNexusGraph } from '../../lib/nexus-graph';

export default function NexusPage() {
  const graph = buildNexusGraph();

  return (
    <main>
      <PageHero
        eyebrow="Nexus Graph"
        title="The Dominion data model is now navigable as one connected surface"
        body="Factions, commanders, frontlines, events, and public updates are now stitched together in a normalized graph so the website and APIs can expose relationships instead of isolated lists."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Connected nodes</div>
            <h3>{graph.summary.nodes}</h3>
            <p>{graph.summary.edges} relationship edges now join game, ops, and content entities.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Pressure map</div>
            <h3>{graph.summary.highPressureZones}</h3>
            <p>{graph.summary.contestedZones} contested zone and {graph.summary.liveEvents} live event currently anchor the hottest war lanes.</p>
          </article>
          <article className="card">
            <div className="eyebrow">API surface</div>
            <h3>/api/nexus</h3>
            <p>The same normalized graph is now exposed as JSON for future automation, client-side filtering, or dashboards.</p>
            <a className="button buttonSecondary" href="/api/nexus">Open nexus API</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Faction sectors</div>
        <h2>Each faction now resolves into commanders, zones, and live hooks</h2>
        <div className="grid">
          {graph.factionSectors.map((sector) => (
            <article className="card" key={sector.slug}>
              <div className="eyebrow">{sector.commanders.length} commanders · {sector.zones.length} zones · {sector.events.length} events</div>
              <h3>{sector.name}</h3>
              <p>{sector.fantasy}</p>
              <p>Strengths: {sector.strengths.join(', ')}</p>
              <p>
                Commanders: {sector.commanders.map((commander) => commander.name).join(', ') || 'None yet'}
              </p>
              <p>
                Frontlines: {sector.zones.map((zone) => zone.name).join(', ') || 'No mapped frontlines yet'}
              </p>
              <a className="button buttonSecondary" href={`/factions/${sector.slug}`}>Open faction brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Frontline graph</div>
        <h2>Zones now resolve into commander and event context</h2>
        <div className="grid">
          {graph.zoneIntel.map((zone) => (
            <article className="card" key={zone.slug}>
              <div className="eyebrow">{zone.control} · {zone.pressure} pressure</div>
              <h3>{zone.name}</h3>
              <p>{zone.objective}</p>
              <p>Commander: {zone.commander?.name ?? 'Unassigned'}</p>
              <p>Event hook: {zone.event?.name ?? 'No linked event yet'}</p>
              <a className="button buttonSecondary" href={`/world/${zone.slug}`}>Open zone brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Event matrix</div>
        <h2>Campaign beats now connect directly to the world model</h2>
        <div className="grid">
          {graph.eventMatrix.map((event) => (
            <article className="card" key={event.slug}>
              <div className="eyebrow">{event.status} · {event.window}</div>
              <h3>{event.name}</h3>
              <p>{event.summary}</p>
              <p>Zone: {event.zone?.name ?? 'Unassigned'}</p>
              <p>Commander: {event.commander?.name ?? 'Unassigned'}</p>
              <a className="button buttonSecondary" href={`/events/${event.slug}`}>Open event brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Public reporting links</div>
        <h2>News now points back into live product surfaces</h2>
        <div className="grid">
          {graph.newsBriefs.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.tag} · {item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.ctaHref ? <p>Linked surface: {item.ctaHref}</p> : <p>No linked surface yet.</p>}
              <a className="button buttonSecondary" href={`/news/${item.slug}`}>Open update</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
