import { CardGrid } from '../../components/CardGrid';
import { PageHero } from '../../components/PageHero';
import { buildPublicKitSnapshot } from '../../lib/public-kit';
import { siteContent } from '../../lib/content';

export default function PublicKitPage() {
  const snapshot = buildPublicKitSnapshot();

  return (
    <main>
      <PageHero
        eyebrow="Public Kit"
        title="A single public-facing source for press, media, and build momentum"
        body="This surface packages Dominion Nexus boilerplate, tracked asset readiness, and the latest public updates into one reusable page instead of scattering the pitch across separate routes."
      />

      <section className="section">
        <div className="eyebrow">Snapshot</div>
        <h2>The external story now has one maintained home</h2>
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Project frame</div>
            <h3>{snapshot.meta.title}</h3>
            <p>{snapshot.meta.factions} factions, {snapshot.meta.commanders} commanders, and {snapshot.meta.events} event shells are already mapped into the public narrative.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Press readiness</div>
            <h3>{snapshot.press.byStatus.available} assets available</h3>
            <p>{snapshot.press.byStatus['in-progress']} more are still in progress for future outreach beats.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Media board</div>
            <h3>{snapshot.media.total} tracked slots</h3>
            <p>{snapshot.media.byStatus.ready} ready, {snapshot.media.byStatus['in-progress']} in progress, and {snapshot.media.byStatus.planned} planned assets are now visible in one place.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Update cadence</div>
            <h3>{snapshot.news.total} public updates</h3>
            <p>{snapshot.news.latest ? `${snapshot.news.latest.title} is the newest published story beat.` : 'Public update cadence will appear here as news is added.'}</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Boilerplate</div>
        <h2>Core description and outreach anchor</h2>
        <article className="card">
          <p>{siteContent.press.boilerplate}</p>
          <p>Contact: {snapshot.press.contactEmail}</p>
          <div className="ctaRow">
            <a className="button buttonSecondary" href="/press">Open press page</a>
            <a className="button buttonSecondary" href="/media">Open media board</a>
            <a className="button buttonSecondary" href="/news">Open news feed</a>
            <a className="button buttonSecondary" href="/api/public-kit">Open public-kit API</a>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Spotlight</div>
        <h2>The clearest current external hooks</h2>
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Latest news</div>
            <h3>{snapshot.spotlight.news?.title ?? 'No update selected'}</h3>
            <p>{snapshot.spotlight.news?.body ?? 'Add news items to surface the latest public narrative here.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Lead media item</div>
            <h3>{snapshot.spotlight.media?.title ?? 'No media item selected'}</h3>
            <p>{snapshot.spotlight.media?.body ?? 'Choose or create a highlight asset to give the project a stronger visual anchor.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Lead press asset</div>
            <h3>{snapshot.spotlight.press?.title ?? 'No press asset selected'}</h3>
            <p>{snapshot.spotlight.press?.summary ?? 'Tracked press assets will surface here as they become available.'}</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Press assets</div>
        <h2>Reusable outreach materials</h2>
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

      <section className="section">
        <div className="eyebrow">Media slots</div>
        <h2>What visual surfaces are already mapped</h2>
        <CardGrid>
          {siteContent.media.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.type} · {item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Public timeline</div>
        <h2>Current outward-facing build story</h2>
        <CardGrid>
          {snapshot.news.timeline.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.tag} · {item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.ctaHref ? <a className="button buttonSecondary" href={item.ctaHref}>{item.ctaLabel ?? 'Open'}</a> : null}
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
