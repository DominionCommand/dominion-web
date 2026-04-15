import { notFound } from 'next/navigation';

import { PageHero } from '../../../components/PageHero';
import { getCommanderBySlug, getFactionBySlug, siteContent } from '../../../lib/content';

export default async function CommanderDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commander = getCommanderBySlug(slug);

  if (!commander) {
    notFound();
  }

  const faction = getFactionBySlug(commander.factionSlug);
  const zones = siteContent.worldZones.filter((zone) => zone.recommendedCommanderSlug === commander.slug);
  const events = siteContent.events.filter((event) => event.featuredCommanderSlug === commander.slug);

  return (
    <main>
      <PageHero
        eyebrow="Commander Profile"
        title={commander.name}
        body={commander.summary}
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Faction</div>
            <h3>{faction?.name ?? commander.faction}</h3>
            <p>{faction?.fantasy ?? 'Faction profile not found.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Role</div>
            <h3>{commander.role}</h3>
            <p>{commander.specialty}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Traits</div>
            <h3>{commander.traits.length} mapped traits</h3>
            <p>{commander.traits.join(', ')}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Field coverage</div>
            <h3>{zones.length} zones · {events.length} events</h3>
            <p>This commander is currently linked into both world-state and seasonal event scaffolds.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Zone fit</div>
        <h2>Where this commander currently applies pressure</h2>
        <div className="grid">
          {zones.map((zone) => (
            <article className="card" key={zone.slug}>
              <div className="eyebrow">{zone.control} · {zone.pressure} pressure</div>
              <h3>{zone.name}</h3>
              <p>{zone.objective}</p>
              <a className="button buttonSecondary" href={`/world/${zone.slug}`}>Open zone brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Event fit</div>
        <h2>Linked campaign and live-ops hooks</h2>
        <div className="grid">
          {events.map((event) => (
            <article className="card" key={event.slug}>
              <div className="eyebrow">{event.status} · {event.cadence}</div>
              <h3>{event.name}</h3>
              <p>{event.summary}</p>
              <a className="button buttonSecondary" href={`/events/${event.slug}`}>Open event brief</a>
            </article>
          ))}
          <article className="card">
            <h3>Faction brief</h3>
            <p>See the wider fantasy, strengths, and supporting units around this commander.</p>
            <a className="button buttonSecondary" href={`/factions/${commander.factionSlug}`}>Open faction brief</a>
          </article>
        </div>
      </section>
    </main>
  );
}
