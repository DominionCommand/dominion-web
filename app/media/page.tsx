import { PageHero } from '../../components/PageHero';
import { CardGrid } from '../../components/CardGrid';
import { siteContent } from '../../lib/content';
import { buildPublicKitSnapshot } from '../../lib/public-kit';

export default function MediaPage() {
  const snapshot = buildPublicKitSnapshot();

  return (
    <main>
      <PageHero
        eyebrow="Media"
        title="The public media shell for Dominion Nexus"
        body="This page now tracks actual asset slots and production status for key art, UI previews, and war-map reveals."
      />

      <section className="section">
        <div className="eyebrow">Asset readiness</div>
        <h2>Media production is now exposed as a real surface</h2>
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Ready</div>
            <h3>{snapshot.media.byStatus.ready} assets ready</h3>
            <p>{snapshot.media.byStatus['in-progress']} assets are actively being built, with {snapshot.media.byStatus.planned} more still queued.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Coverage</div>
            <h3>{snapshot.media.total} tracked media slots</h3>
            <p>{snapshot.media.byType['key-art']} key art slots, {snapshot.media.byType.ui} UI previews, and {snapshot.media.byType.screenshot} screenshots are currently mapped.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Highlight</div>
            <h3>{snapshot.media.highlight?.title ?? 'No highlight selected'}</h3>
            <p>{snapshot.media.highlight?.body ?? 'Media highlight will appear here once a lead asset is chosen.'}</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Asset board</div>
        <h2>Current tracked items</h2>
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
    </main>
  );
}
