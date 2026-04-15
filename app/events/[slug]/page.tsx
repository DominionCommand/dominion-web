import { notFound } from 'next/navigation';

import { PageHero } from '../../../components/PageHero';
import { getCommanderBySlug, getEventBySlug, getWorldZoneBySlug, siteContent } from '../../../lib/content';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const commander = event.featuredCommanderSlug ? getCommanderBySlug(event.featuredCommanderSlug) : undefined;
  const zone = event.linkedZoneSlug ? getWorldZoneBySlug(event.linkedZoneSlug) : undefined;
  const matchingSeasonBeat = siteContent.seasonBeats.find((beat) =>
    beat.body.toLowerCase().includes(event.objective.split(' ')[0]?.toLowerCase() ?? '') ||
    beat.focus.toLowerCase().includes(event.status === 'active' ? 'alliance' : event.status),
  );

  return (
    <main>
      <PageHero
        eyebrow="Event Brief"
        title={event.name}
        body={event.summary}
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Cadence</div>
            <h3>{event.cadence}</h3>
            <p>Window: {event.window}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Status</div>
            <h3>{event.status}</h3>
            <p>{event.objective}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Reward</div>
            <h3>{event.reward}</h3>
            <p>This event is meant to reinforce progression pressure, urgency, and alliance motivation.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Featured commander</div>
            <h3>{commander?.name ?? 'Unassigned'}</h3>
            <p>{commander?.specialty ?? 'No featured commander has been assigned yet.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Frontline link</div>
        <h2>World-state connection</h2>
        <div className="grid">
          <article className="card">
            <h3>{zone?.name ?? 'No linked zone yet'}</h3>
            <p>{zone?.strategicValue ?? 'Attach this event to a named frontline to make its pressure legible in the world model.'}</p>
            {zone ? <a className="button buttonSecondary" href={`/world/${zone.slug}`}>Open zone brief</a> : null}
          </article>
          <article className="card">
            <h3>{matchingSeasonBeat?.phase ?? 'Season shell'}</h3>
            <p>{matchingSeasonBeat?.body ?? 'Season pacing detail will appear here as more event-to-beat mappings are added.'}</p>
            <a className="button buttonSecondary" href="/events">Open events ladder</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operational links</div>
        <h2>Connected execution surfaces</h2>
        <div className="grid">
          <article className="card">
            <h3>War room</h3>
            <p>Translate this event into near-term execution and frontline urgency.</p>
            <a className="button buttonSecondary" href="/war-room">Open war room</a>
          </article>
          <article className="card">
            <h3>Command center</h3>
            <p>Use this event as a featured beat when updating live season posture.</p>
            <a className="button buttonSecondary" href="/command-center">Open command center</a>
          </article>
          {commander ? (
            <article className="card">
              <h3>{commander.name}</h3>
              <p>{commander.summary}</p>
              <a className="button buttonSecondary" href={`/commanders/${commander.slug}`}>Open commander profile</a>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
