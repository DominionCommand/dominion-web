import { PageHero } from '../../components/PageHero';
import { StorefrontConsole } from '../../components/StorefrontConsole';
import { readLeads } from '../../lib/leads';
import { buildStorefrontSnapshot } from '../../lib/storefront';

export default async function StorefrontPage() {
  const storefront = await buildStorefrontSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Storefront"
        title="Dominion Nexus now has a live storefront planning surface"
        body="This page turns founder demand, alliance intent, live event timing, and operator notes into a usable offer ladder instead of leaving monetization in docs only."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Featured offer</div>
            <h3>{storefront.summary.featuredOffer.name}</h3>
            <p>{storefront.summary.featuredOffer.priceBand}</p>
            <p>{storefront.summary.featuredOffer.objective}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Founder-ready</div>
            <h3>{storefront.summary.founderReady}</h3>
            <p>Leads already sitting in the founder invite band.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Alliance-targetable</div>
            <h3>{storefront.summary.allianceReady}</h3>
            <p>Leads already tagged with an alliance role, useful for social bundle targeting.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Live event hook</div>
            <h3>{storefront.summary.activeEvent?.name ?? 'Not selected yet'}</h3>
            <p>{storefront.summary.activeEvent?.window ?? 'Set an event timing anchor to drive the first timed offer push.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Offer ladder</div>
        <h2>Concrete store beats ready for implementation</h2>
        <div className="grid">
          {storefront.offers.map((offer) => (
            <article className="card" key={offer.slug}>
              <div className="eyebrow">{offer.status}</div>
              <h3>{offer.name}</h3>
              <p>{offer.priceBand} · {offer.segment}</p>
              <p>{offer.objective}</p>
              <p>Trigger: {offer.trigger}</p>
              <p>Targetable leads: {offer.targetableLeads}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Merch signals</div>
        <h2>What the current data says about conversion pressure</h2>
        <div className="grid">
          {storefront.merchSignals.map((signal) => (
            <article className="card" key={signal.slug}>
              <h3>{signal.title}</h3>
              <p>{signal.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>Next monetization moves</h2>
        <div className="grid">
          {storefront.recommendations.map((recommendation) => (
            <article className="card" key={recommendation}>
              <p>{recommendation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator console</div>
        <h2>Persist the storefront directly from the site</h2>
        <p>Status, owner, featured offer, and operator notes now persist through the live storefront API.</p>
        <StorefrontConsole
          initialState={storefront.state}
          offers={storefront.offers.map((offer) => ({ slug: offer.slug, name: offer.name }))}
        />
      </section>

      <section className="section">
        <div className="eyebrow">Saved notes</div>
        <h2>Persisted operator context</h2>
        <div className="grid">
          {storefront.notes.length ? storefront.notes.map((note) => (
            <article className="card" key={note.id}>
              <div className="eyebrow">{note.status}</div>
              <h3>{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No storefront notes saved yet</h3>
              <p>Use the operator console above to save the first store planning note without leaving the site.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
