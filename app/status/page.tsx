import { PageHero } from '../../components/PageHero';
import { readLeads } from '../../lib/leads';
import { buildStatusSnapshot } from '../../lib/status';

export default async function StatusPage() {
  const snapshot = await buildStatusSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Status"
        title="Dominion Nexus now has a live status surface"
        body="This page turns the status API into an operator-friendly system check for command state, invite flow, surface health, and recent activity."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Lead funnel</div>
            <h3>{snapshot.leadSummary.unique} unique leads</h3>
            <p>{snapshot.leadSummary.total} total submissions are currently in the pipeline.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Season status</div>
            <h3>{snapshot.command.seasonStatus}</h3>
            <p>{snapshot.command.activeBeat ?? 'No active beat selected yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Control tower</div>
            <h3>{snapshot.command.controlTowerStatus}</h3>
            <p>{snapshot.command.focusLane} is the active execution lane.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invite queue</div>
            <h3>{snapshot.inviteQueue.selectedNow} selected</h3>
            <p>{snapshot.inviteQueue.invitesSent} invites sent, {snapshot.inviteQueue.onHold} on hold.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Activity stream</div>
            <h3>{snapshot.activity.total} recent records</h3>
            <p>{snapshot.activity.latestTs ? `Latest event logged at ${new Date(snapshot.activity.latestTs).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.` : 'No operator activity has been logged yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Public intake</div>
            <h3>{snapshot.intake.highPriorityLeads} follow-up leads</h3>
            <p>{snapshot.intake.contactRequests} contact requests captured, including {snapshot.intake.directInbound} founder, partnership, or press items.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Route inventory</div>
        <h2>Shared route metadata is now part of the live status model</h2>
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Surface count</div>
            <h3>{snapshot.routeInventory.counts.total} total routes</h3>
            <p>{snapshot.routeInventory.counts.pages} pages and {snapshot.routeInventory.counts.api} APIs are now tracked from one registry.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Dynamic coverage</div>
            <h3>{snapshot.routeInventory.counts.dynamic} dynamic routes</h3>
            <p>{snapshot.routeInventory.counts.static} static routes remain in the implementation scaffold.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Busiest group</div>
            <h3>{Object.entries(snapshot.routeInventory.groups).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a'}</h3>
            <p>{Object.entries(snapshot.routeInventory.groups).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0} surfaces currently sit in that route category.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Human view</div>
            <h3>/routes</h3>
            <p>The route registry now has its own explorable page alongside the JSON inventory.</p>
            <a className="button buttonSecondary" href="/routes">Open route directory</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Surface health</div>
        <h2>Core product surfaces and their current operating state</h2>
        <div className="grid">
          {snapshot.surfaces.map((surface) => (
            <article className="card" key={surface.slug}>
              <div className="eyebrow">{surface.status}</div>
              <h3>{surface.label}</h3>
              <p>{surface.summary}</p>
              <p>Owner: {surface.owner}</p>
              <a className="button buttonSecondary" href={surface.href}>Open {surface.label}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What the system says to do next</h2>
        <div className="grid">
          {snapshot.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Blockers and signals</div>
        <h2>The latest issues bubbled into one view</h2>
        <div className="grid">
          {snapshot.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Featured routes</div>
        <h2>Structured links exposed by the status layer</h2>
        <div className="grid">
          {snapshot.routeInventory.featured.map((route) => (
            <article className="card" key={route.href}>
              <div className="eyebrow">{route.group}{route.dynamic ? ' · dynamic' : ''}</div>
              <h3>{route.label}</h3>
              <p>{route.summary}</p>
              <a className="button buttonSecondary" href={route.href}>Open {route.href}</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
