import { CardGrid } from '../../components/CardGrid';
import { SectionHeader } from '../../components/SectionHeader';
import { siteContent } from '../../lib/content';

export default function CommandersPage() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Commanders</div>
        <h1>Elite leaders of the coming war</h1>
        <p>Commanders are the face of squad identity, monetization depth, and seasonal power chase.</p>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Roster" title="Featured commanders" body="These are the first named faces of Dominion Nexus command identity." />
        <CardGrid>
          {siteContent.commanders.map((commander) => (
            <article className="card" key={commander.slug}>
              <h2>{commander.name}</h2>
              <p><strong>{commander.faction}</strong> · {commander.role}</p>
              <p>{commander.summary}</p>
              <p><strong>Specialty:</strong> {commander.specialty}</p>
              <a href={`/commanders/${commander.slug}`} className="button buttonSecondary">View commander profile</a>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
