import { PageHero } from '../../components/PageHero';
import { CardGrid } from '../../components/CardGrid';
import { siteContent } from '../../lib/content';
import { buildPublicKitSnapshot } from '../../lib/public-kit';

export default function NewsPage() {
  const snapshot = buildPublicKitSnapshot();

  return (
    <main>
      <PageHero
        eyebrow="News"
        title="Project updates and milestone notes"
        body="This route is becoming the public update stream for Dominion Nexus development, reveals, and launch pacing."
      />

      <section className="section">
        <div className="eyebrow">Newsroom snapshot</div>
        <h2>The update stream now has real structure</h2>
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Latest</div>
            <h3>{snapshot.news.latest?.title ?? 'No update published yet'}</h3>
            <p>{snapshot.news.latest?.body ?? 'The latest milestone update will appear here.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Volume</div>
            <h3>{snapshot.news.total} published updates</h3>
            <p>{Object.keys(snapshot.news.tagCounts).length} topic lanes are now exposed across build, growth, and roadmap messaging.</p>
          </article>
          <article className="card">
            <div className="eyebrow">API</div>
            <h3>Public update feed online</h3>
            <p>The newsroom now rolls into the shared public-kit API so external surfaces can pull the same latest update and tag counts.</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Published updates</div>
        <h2>Current timeline</h2>
        <CardGrid>
          {siteContent.news.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.tag} · {item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="ctaRow">
                <a className="button buttonSecondary" href={`/news/${item.slug}`}>Open update</a>
                {item.ctaLabel && item.ctaHref ? (
                  <a className="button buttonSecondary" href={item.ctaHref}>{item.ctaLabel}</a>
                ) : null}
              </div>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
