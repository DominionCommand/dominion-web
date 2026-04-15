import { PageHero } from '../../components/PageHero';

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About"
        title="What Dominion Nexus is building toward"
        body="Dominion Nexus is being shaped as a premium mobile 4X war strategy game focused on alliance warfare, prestige, and relentless progression."
      />

      <section className="section">
        <div className="eyebrow">Project Shape</div>
        <h2>Current implementation direction</h2>
        <div className="grid">
          <article className="card">
            <h3>Platform target</h3>
            <p>iPhone and iPad first, with a strong prereg and launch funnel on the web.</p>
          </article>
          <article className="card">
            <h3>Player fantasy</h3>
            <p>Build power, lead alliances, and dominate seasonal wars with visible status and strategic depth.</p>
          </article>
          <article className="card">
            <h3>Business model</h3>
            <p>Free-to-play strategy with event-driven monetization, passes, bundles, and long-tail progression systems.</p>
          </article>
          <article className="card">
            <h3>Current web milestone</h3>
            <p>Buildable prereg site, content routes, health/status APIs, and a working lead capture flow.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
