import { notFound } from 'next/navigation';
import { getNewsItemBySlug } from '../../../lib/content';

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getNewsItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">{item.tag}</div>
        <h1>{item.title}</h1>
        <p>{item.body}</p>
      </section>

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Published</h3>
            <p>{item.date}</p>
          </article>
          <article className="card">
            <h3>Update type</h3>
            <p>{item.tag}</p>
          </article>
          <article className="card">
            <h3>Next action</h3>
            {item.ctaLabel && item.ctaHref ? (
              <a className="button buttonSecondary" href={item.ctaHref}>{item.ctaLabel}</a>
            ) : (
              <p>No follow-up route is attached yet.</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
