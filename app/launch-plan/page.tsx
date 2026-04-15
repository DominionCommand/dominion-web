import { LaunchPlanConsole } from '../../components/LaunchPlanConsole';
import { PageHero } from '../../components/PageHero';
import { buildLaunchPlan } from '../../lib/launch-plan';
import { readLeads } from '../../lib/leads';
import { getWaveLabel } from '../../lib/waves';

export default async function LaunchPlanPage() {
  const plan = await buildLaunchPlan(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Launch Plan"
        title="Dominion Nexus now has a persisted launch-planning surface"
        body="This page turns world pressure, event timing, and prereg readiness into an operator-facing launch plan with saved status and notes behind it."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Plan status</div>
            <h3>{plan.summary.status}</h3>
            <p>Owner: {plan.summary.owner}</p>
            <p>Target wave: {plan.summary.targetWave}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{plan.summary.recommendedWave.label}</h3>
            <p>{plan.summary.recommendedWave.qualifiedLeads} leads currently qualify.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Founder-ready leads</div>
            <h3>{plan.summary.founderReady}</h3>
            <p>Current Wave 0 founder queue size.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Critical fronts</div>
            <h3>{plan.summary.criticalFrontCount}</h3>
            <p>{plan.summary.hottestFront ? `${plan.summary.hottestFront.zone} is the current center of gravity.` : 'No hottest front selected yet.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Checklist</div>
        <h2>What has to be true before the next push</h2>
        <div className="grid">
          {plan.launchChecklist.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Launch windows</div>
        <h2>Events already usable as campaign hooks</h2>
        <div className="grid">
          {plan.launchWindows.map((window) => (
            <article className="card" key={window.slug}>
              <div className="eyebrow">{window.status}</div>
              <h3>{window.name}</h3>
              <p>{window.window}</p>
              <p>{window.objective}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Faction coverage</div>
        <h2>Demand balance for the next cohort</h2>
        <div className="grid">
          {plan.factionCoverage.map((entry) => (
            <article className="card" key={entry.slug}>
              <h3>{entry.name}</h3>
              <p>{entry.leads} leads tagged</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Founder queue</div>
        <h2>Top candidates for the next invite push</h2>
        <div className="grid">
          {plan.founderQueue.map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <div className="eyebrow">{lead.invitePriority}</div>
              <h3>{lead.email}</h3>
              <p>{lead.factionLabel} · {lead.platformLabel}</p>
              <p>{lead.playStyleLabel} · {getWaveLabel(lead.wave)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator console</div>
        <h2>Update the launch plan directly from the site</h2>
        <p>Status, owner, target wave, and new notes now persist through the live launch-plan API.</p>
        <LaunchPlanConsole initialState={plan.state} />
      </section>

      <section className="section">
        <div className="eyebrow">Saved notes</div>
        <h2>Persisted operator context</h2>
        <div className="grid">
          {plan.notes.length ? plan.notes.map((note) => (
            <article className="card" key={note.id}>
              <div className="eyebrow">{note.status}</div>
              <h3>{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No launch notes saved yet</h3>
              <p>Use the operator console above to save the first launch note without leaving the site.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
