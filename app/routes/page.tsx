import { PageHero } from '../../components/PageHero';
import { buildRouteInventory } from '../../lib/routes';

export default function RoutesPage() {
  const inventory = buildRouteInventory();
  const pageGroups = ['core', 'ops', 'game', 'growth', 'content', 'support', 'system'] as const;

  return (
    <main>
      <PageHero
        eyebrow="Routes"
        title="Dominion Nexus now has a live route directory"
        body="This surface turns the growing pile of pages and APIs into a readable operating map so product, growth, and implementation work can find the right entry point fast."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Total surfaces</div>
            <h3>{inventory.counts.total}</h3>
            <p>{inventory.counts.pages} website pages and {inventory.counts.api} API routes are currently exposed.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Dynamic routes</div>
            <h3>{inventory.counts.dynamic}</h3>
            <p>{inventory.counts.static} static routes are backed by shared route metadata.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Largest group</div>
            <h3>{Object.entries(inventory.groups).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a'}</h3>
            <p>{Object.entries(inventory.groups).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0} routes currently sit in the busiest category.</p>
          </article>
          <article className="card">
            <div className="eyebrow">System API</div>
            <h3>/api/routes</h3>
            <p>The same inventory is now available as structured JSON for automation and future dashboards.</p>
          </article>
        </div>
      </section>

      {pageGroups.map((group) => {
        const pageRoutes = inventory.pages.filter((route) => route.group === group);
        const apiRoutes = inventory.api.filter((route) => route.group === group);

        if (!pageRoutes.length && !apiRoutes.length) {
          return null;
        }

        return (
          <section className="section" key={group}>
            <div className="eyebrow">{group}</div>
            <h2>{group[0].toUpperCase() + group.slice(1)} surfaces</h2>
            <div className="grid">
              {pageRoutes.map((route) => (
                <article className="card" key={route.href}>
                  <div className="eyebrow">page{route.dynamic ? ' · dynamic' : ''}</div>
                  <h3>{route.label}</h3>
                  <p>{route.summary}</p>
                  <a className="button buttonSecondary" href={route.href}>Open {route.href}</a>
                </article>
              ))}
              {apiRoutes.map((route) => (
                <article className="card" key={route.href}>
                  <div className="eyebrow">api{route.dynamic ? ' · dynamic' : ''}</div>
                  <h3>{route.label}</h3>
                  <p>{route.summary}</p>
                  <a className="button buttonSecondary" href={route.href}>Open {route.href}</a>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
