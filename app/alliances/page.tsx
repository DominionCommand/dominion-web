import { AllianceHQConsole } from '../../components/AllianceHQConsole';
import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';
import { readLeads } from '../../lib/leads';
import { buildAllianceHQSnapshot } from '../../lib/alliance-hq';

export default async function AlliancesPage() {
  const snapshot = await buildAllianceHQSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Alliances"
        title="Alliance warfare now has a real public and operator surface"
        body="This route now goes beyond static positioning. It exposes alliance readiness, frontline pressure, and a live HQ console backed by persisted state and API writes."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Alliance HQ</div>
            <h3>{snapshot.state.status}</h3>
            <p>{snapshot.headline}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Campaigns</div>
            <h3>{snapshot.summary.activeCampaigns} active</h3>
            <p>{snapshot.summary.blockedCampaigns} blocked campaigns currently need attention.</p>
          </article>
          <article className="card">
            <div className="eyebrow">War-ready systems</div>
            <h3>{snapshot.summary.warReadySystems}</h3>
            <p>Alliance systems are currently marked surging and ready for heavier testing.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Top role signal</div>
            <h3>{snapshot.summary.topRole}</h3>
            <p>Current lead intake is shaping which alliance roles should be prioritized next.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Alliance readiness</div>
        <h2>Core alliance systems now map to execution pressure</h2>
        <div className="grid">
          {snapshot.readiness.map((feature) => (
            <article className="card" key={feature.slug}>
              <div className="eyebrow">{feature.readiness} · score {feature.score}</div>
              <h3>{feature.title}</h3>
              <p>{feature.summary}</p>
              <p>{feature.requirement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Frontline pressure</div>
        <h2>Alliance testing now points at live war fronts</h2>
        <div className="grid">
          {snapshot.fronts.map((front) => (
            <article className="card" key={front.slug}>
              <div className="eyebrow">{front.priority} · {front.control}</div>
              <h3>{front.zone}</h3>
              <p>{front.objective}</p>
              <p>Recommended commander: {front.recommendedCommander}</p>
              <p>Reward: {front.reward}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Campaign board</div>
        <h2>Alliance execution is now persisted instead of implied</h2>
        <div className="grid">
          {snapshot.campaigns.map((campaign) => (
            <article className="card" key={campaign.slug}>
              <div className="eyebrow">{campaign.lane} · {campaign.status}</div>
              <h3>{campaign.title}</h3>
              <p>{campaign.detail}</p>
              <p>{campaign.target}</p>
              <p>Owner: {campaign.owner}</p>
              {campaign.operatorNote ? <p>Note: {campaign.operatorNote}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Commander fit</div>
        <h2>Commanders are being framed around alliance roles</h2>
        <div className="grid">
          {siteContent.commanders.map((commander) => (
            <article className="card" key={commander.slug}>
              <div className="eyebrow">{commander.faction}</div>
              <h3>{commander.name}</h3>
              <p>{commander.role}</p>
              <p>{commander.specialty}</p>
              <a className="button buttonSecondary" href={`/commanders/${commander.slug}`}>View commander brief</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Alliance HQ console</div>
        <h2>Update alliance command state from the site</h2>
        <p>The alliances route is no longer read-only. Operators can now persist alliance HQ status, campaign execution, and handoff notes through the live alliances API.</p>
        <AllianceHQConsole initialState={snapshot.state} campaigns={snapshot.campaigns} />
      </section>

      <section className="section">
        <div className="eyebrow">Saved notes</div>
        <h2>Recent alliance command notes</h2>
        <div className="grid">
          {snapshot.notes.length ? snapshot.notes.map((note) => (
            <article className="card" key={note.id}>
              <h3>{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No alliance notes saved yet</h3>
              <p>Use the Alliance HQ console to capture recruitment pushes, frontline choices, or logistics handoffs.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
