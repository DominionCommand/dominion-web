import { notFound } from 'next/navigation';

import { PageHero } from '../../../components/PageHero';
import { getCommanderBySlug, getEventBySlug, getWorldZoneBySlug } from '../../../lib/content';

export default async function WorldZoneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zone = getWorldZoneBySlug(slug);

  if (!zone) {
    notFound();
  }

  const commander = getCommanderBySlug(zone.recommendedCommanderSlug);
  const event = zone.linkedEventSlug ? getEventBySlug(zone.linkedEventSlug) : undefined;

  return (
    <main>
      <PageHero
        eyebrow="World Zone"
        title={zone.name}
        body={zone.objective}
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Control state</div>
            <h3>{zone.control}</h3>
            <p>Pressure: {zone.pressure}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Reward</div>
            <h3>{zone.reward}</h3>
            <p>Owning this lane changes the surrounding war economy and alliance posture.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recommended commander</div>
            <h3>{commander?.name ?? 'Unassigned'}</h3>
            <p>{commander?.specialty ?? 'No linked commander specialty yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Linked event</div>
            <h3>{event?.name ?? 'No linked event yet'}</h3>
            <p>{event?.summary ?? 'Attach a timed event to make this frontline more legible and testable.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Strategic value</div>
        <h2>Why this zone matters</h2>
        <article className="card">
          <p>{zone.strategicValue}</p>
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Operational links</div>
        <h2>Connected command surfaces</h2>
        <div className="grid">
          <article className="card">
            <h3>World state</h3>
            <p>Review the full frontline map and compare pressure across every zone.</p>
            <a className="button buttonSecondary" href="/world">Open world state</a>
          </article>
          <article className="card">
            <h3>Command center</h3>
            <p>Use this zone as a live command anchor when updating the season-control layer.</p>
            <a className="button buttonSecondary" href="/command-center">Open command center</a>
          </article>
          <article className="card">
            <h3>War room</h3>
            <p>Translate this zone's pressure into immediate execution priorities.</p>
            <a className="button buttonSecondary" href="/war-room">Open war room</a>
          </article>
          {event ? (
            <article className="card">
              <h3>{event.name}</h3>
              <p>{event.summary}</p>
              <a className="button buttonSecondary" href={`/events/${event.slug}`}>Open event brief</a>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
