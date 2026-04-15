import { CardGrid } from '../../components/CardGrid';
import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';
import { buildPublicKitSnapshot } from '../../lib/public-kit';

export default function PressPage() {
  const snapshot = buildPublicKitSnapshot();

  return (
    <main>
      <PageHero
        eyebrow="Press"
        title="Press kit and project boilerplate"
        body="This page turns Dominion Nexus press materials into a maintained product surface with reusable boilerplate, asset status, and a contact path."
      />

      <section className="section">
        <div className="eyebrow">Press snapshot</div>
        <h2>Current outreach readiness</h2>
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Availability</div>
            <h3>{snapshot.press.byStatus.available} assets available now</h3>
            <p>{snapshot.press.byStatus['in-progress']} additional assets are still being built for future outreach beats.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Coverage</div>
            <h3>{snapshot.press.total} tracked press assets</h3>
            <p>{snapshot.press.byType.logo} logos, {snapshot.press.byType['fact-sheet']} fact sheets, and {snapshot.press.byType['key-art']} key art slots are currently mapped.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Primary contact</div>
            <h3>{snapshot.press.contactEmail}</h3>
            <p>Press readiness now rolls into the shared public-kit data layer instead of living only in static page copy.</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Boilerplate</div>
        <h2>Project summary</h2>
        <article className="card">
          <p>{siteContent.press.boilerplate}</p>
          <p>Contact: {siteContent.press.contactEmail}</p>
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Assets</div>
        <h2>Current press pack</h2>
        <CardGrid>
          {siteContent.press.assets.map((asset) => (
            <article className="card" key={asset.slug}>
              <div className="eyebrow">{asset.type} · {asset.status}</div>
              <h3>{asset.title}</h3>
              <p>{asset.summary}</p>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
