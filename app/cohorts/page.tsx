import { PageHero } from '../../components/PageHero';
import { buildCohortPlanner } from '../../lib/cohorts';
import { readLeads } from '../../lib/leads';
import { buildLeadHref } from '../../lib/lead-routes';
import { getWaveLabel } from '../../lib/waves';

export default async function CohortsPage() {
  const planner = await buildCohortPlanner(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Cohort Planner"
        title="Invite planning now has a real cohort-building surface"
        body="This page turns raw playtest leads into an actual recommended wave, selected roster, reserve queue, and balance gaps for the next Dominion Nexus test push."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{planner.recommendedWave.label}</h3>
            <p>{planner.recommendedWave.qualifiedLeads} leads currently qualify.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Target size</div>
            <h3>{planner.recommendedWave.targetSize}</h3>
            <p>Selected roster fill rate: {planner.recommendedWave.fillRate}%</p>
          </article>
          <article className="card">
            <div className="eyebrow">Selected now</div>
            <h3>{planner.selectedCohort.length}</h3>
            <p>Leads currently slotted into the next cohort.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Reserve queue</div>
            <h3>{planner.reserveQueue.length}</h3>
            <p>Overflow or future-wave candidates already staged.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Action queue</div>
        <h2>What operators should do next</h2>
        <div className="grid">
          {planner.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Faction balance</div>
        <h2>Cohort coverage by faction</h2>
        <div className="grid">
          {planner.factionSlots.map((slot) => (
            <article className="card" key={slot.slug}>
              <div className="eyebrow">{slot.status}</div>
              <h3>{slot.name}</h3>
              <p>{slot.assigned} assigned, target {slot.target}</p>
              <p>{slot.gap > 0 ? `${slot.gap} more needed.` : 'Coverage is on target.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Alliance mix</div>
        <h2>Role coverage for the next test wave</h2>
        <div className="grid">
          {planner.roleSlots.map((slot) => (
            <article className="card" key={slot.slug}>
              <div className="eyebrow">{slot.status}</div>
              <h3>{slot.label}</h3>
              <p>{slot.assigned} assigned, target {slot.target}</p>
              <p>{slot.gap > 0 ? `${slot.gap} more needed.` : 'Role is covered.'}</p>
            </article>
          ))}
          {planner.platformMix.map((slot) => (
            <article className="card" key={slot.slug}>
              <div className="eyebrow">Platform mix</div>
              <h3>{slot.label}</h3>
              <p>{slot.assigned} assigned</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Selected cohort</div>
        <h2>Who is in the recommended next wave right now</h2>
        <div className="grid">
          {planner.selectedCohort.length ? planner.selectedCohort.map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <div className="eyebrow">{lead.invitePriority} · score {lead.score}</div>
              <h3>{lead.email}</h3>
              <p>{lead.factionLabel} · {lead.platformLabel}</p>
              <p>{lead.playStyleLabel} · {getWaveLabel(lead.wave)}</p>
              <a className="button buttonSecondary" href={buildLeadHref(lead.email)}>Open intake dossier</a>
            </article>
          )) : (
            <article className="card">
              <h3>No one is slotted yet</h3>
              <p>The current recommended wave has no qualified leads yet.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Reserve queue</div>
        <h2>Strong candidates waiting behind the current wave</h2>
        <div className="grid">
          {planner.reserveQueue.map((lead) => (
            <article className="card" key={`${lead.email}-${lead.ts}`}>
              <div className="eyebrow">{lead.invitePriority} · score {lead.score}</div>
              <h3>{lead.email}</h3>
              <p>{lead.factionLabel} · {lead.platformLabel}</p>
              <p>{lead.playStyleLabel} · {getWaveLabel(lead.wave)}</p>
              <a className="button buttonSecondary" href={buildLeadHref(lead.email)}>Open intake dossier</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
