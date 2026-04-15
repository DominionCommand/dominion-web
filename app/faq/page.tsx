import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';

export default function FaqPage() {
  return (
    <main>
      <PageHero
        eyebrow="FAQ"
        title="Questions the site can answer right now"
        body="The FAQ is now a real surface backed by shared content so common launch, platform, and alliance questions do not need to live only in docs or DMs."
      />

      <section className="section">
        <div className="grid">
          {siteContent.faq.map((item) => (
            <article className="card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
