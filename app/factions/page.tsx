import { CardGrid } from '../../components/CardGrid';
import { SectionHeader } from '../../components/SectionHeader';
import { siteContent } from '../../lib/content';

export default function FactionsPage() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Factions</div>
        <h1>Choose the power you serve, or destroy.</h1>
        <p>Each faction gives Dominion Nexus a different war fantasy, visual identity, and campaign angle.</p>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Power Blocs" title="Three paths to domination" body="Each bloc supports a different fantasy, campaign hook, and commander identity." />
        <CardGrid>
          {siteContent.factions.map((faction) => (
            <article className="card" key={faction.slug}>
              <h2>{faction.name}</h2>
              <p>{faction.summary}</p>
              <p>{faction.fantasy}</p>
              <p><strong>Strengths:</strong> {faction.strengths.join(', ')}</p>
              <a href={`/factions/${faction.slug}`} className="button buttonSecondary">View faction brief</a>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
