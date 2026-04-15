import { notFound } from 'next/navigation';

import { PageHero } from '../../../components/PageHero';
import { getFactionBySlug, getFactionCommanders, siteContent } from '../../../lib/content';

export default async function FactionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const faction = getFactionBySlug(slug);

  if (!faction) {
    notFound();
  }

  const commanders = getFactionCommanders(faction.slug);
  const relatedZones = siteContent.worldZones.filter((zone) => zone.recommendedCommanderSlug && commanders.some((commander) => commander.slug === zone.recommendedCommanderSlug));
  const relatedEvents = siteContent.events.filter((event) => event.featuredCommanderSlug && commanders.some((commander) => commander.slug === event.featuredCommanderSlug));

  return (
    <main>
      <PageHero
        eyebrow="Faction Brief"
        title={faction.name}
        body={faction.fantasy}
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">War identity</div>
            <h3>{faction.summary}</h3>
            <p>{faction.fantasy}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Strength profile</div>
            <h3>{faction.strengths.length} key strengths</h3>
            <p>{faction.strengths.join(', ')}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Signature units</div>
            <h3>{faction.signatureUnits.length} mapped units</h3>
            <p>{faction.signatureUnits.join(', ')}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Commander coverage</div>
            <h3>{commanders.length} linked commanders</h3>
            <p>{commanders.map((commander) => commander.name).join(', ') || 'No commanders linked yet.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Commanders</div>
        <h2>Leaders aligned to this faction</h2>
        <div className="grid">
          {commanders.map((commander) => (
            <article className="card" key={commander.slug}>
              <div className="eyebrow">{commander.role}</div>
              <h3>{commander.name}</h3>
              <p>{commander.summary}</p>
              <p>Specialty: {commander.specialty}</p>
              <a className="button buttonSecondary" href={`/commanders/${commander.slug}`}>Open commander profile</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Frontline fit</div>
        <h2>Where this faction currently shows up</h2>
        <div className="grid">
          {relatedZones.map((zone) => (
            <article className="card" key={zone.slug}>
              <div className="eyebrow">{zone.control} · {zone.pressure} pressure</div>
              <h3>{zone.name}</h3>
              <p>{zone.objective}</p>
              <a className="button buttonSecondary" href={`/world/${zone.slug}`}>Open zone brief</a>
            </article>
          ))}
          {relatedEvents.map((event) => (
            <article className="card" key={event.slug}>
              <div className="eyebrow">{event.status} · {event.cadence}</div>
              <h3>{event.name}</h3>
              <p>{event.summary}</p>
              <a className="button buttonSecondary" href={`/events/${event.slug}`}>Open event brief</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
