import { CardGrid } from '../../components/CardGrid';
import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';

export default function EventsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Events"
        title="Live event cadence and pressure windows"
        body="Dominion Nexus events are being shaped as repeatable alliance pressure surfaces, not throwaway calendar filler. This page now exposes the current event shell directly from shared content."
      />

      <section className="section">
        <div className="eyebrow">Event ladder</div>
        <h2>Current campaigns</h2>
        <CardGrid>
          {siteContent.events.map((event) => (
            <article className="card" key={event.slug}>
              <div className="eyebrow">{event.status} · {event.cadence}</div>
              <h3>{event.name}</h3>
              <p>{event.summary}</p>
              <p>{event.objective}</p>
              <p>Window: {event.window}</p>
              <p>Reward: {event.reward}</p>
              <a className="button buttonSecondary" href={`/events/${event.slug}`}>Open event brief</a>
            </article>
          ))}
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Season shell</div>
        <h2>How events support the conquest loop</h2>
        <CardGrid>
          {siteContent.seasonBeats.map((beat) => (
            <article className="card" key={beat.phase}>
              <div className="eyebrow">{beat.focus}</div>
              <h3>{beat.phase}</h3>
              <p>{beat.body}</p>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
