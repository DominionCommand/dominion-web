import { PageHero } from '../../components/PageHero';
import { PrototypeBoardConsole } from '../../components/PrototypeBoardConsole';
import { readLeads } from '../../lib/leads';
import { buildPrototypeBoard } from '../../lib/prototype-board';

const waveLabels = {
  'wave-0-founder': 'Wave 0, founder strike team',
  'wave-1-mobile-core': 'Wave 1, mobile core',
  'wave-2-alliance-pressure': 'Wave 2, alliance pressure',
  'wave-3-broader-market': 'Wave 3, broader market',
} as const;

export default async function PrototypePage() {
  const snapshot = await buildPrototypeBoard(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Prototype"
        title="The first playable Dominion Nexus loop now has a concrete implementation surface"
        body="This page turns the game from pitch-only language into a staged gameplay loop, scenario queue, and commander loadout frame backed by live funnel and world-state data."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Current prototype focus</h3>
            <p>{snapshot.headline}</p>
          </article>
          <article className="card">
            <h3>Board status</h3>
            <p>{snapshot.summary.status}</p>
            <p>{snapshot.summary.selectedScenarioTitle}</p>
          </article>
          <article className="card">
            <h3>Recommended invite wave</h3>
            <p>{waveLabels[snapshot.readiness.recommendedWave]}</p>
            <p>{snapshot.readiness.qualifiedLeads} qualified leads currently sit in that cohort.</p>
          </article>
          <article className="card">
            <h3>Mobile readiness</h3>
            <p>{snapshot.readiness.iosReady} iOS-ready leads are already tagged for testing.</p>
          </article>
          <article className="card">
            <h3>Faction coverage</h3>
            <p>{snapshot.readiness.factionCoverageComplete ? 'Every faction has tagged prereg demand.' : 'Faction demand is still uneven and needs more capture.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Delivery checklist</div>
        <h2>The prototype now has an operator-facing build board</h2>
        <div className="grid">
          {snapshot.deliveryChecklist.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Core loop</div>
        <h2>What the first playable shell needs to do</h2>
        <div className="grid">
          {snapshot.coreLoop.map((stage) => (
            <article className="card" key={stage.slug}>
              <h3>{stage.title}</h3>
              <p>{stage.summary}</p>
              <p>System: {stage.supportingSystem}</p>
              <p>KPI: {stage.kpi}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Commander loadout</div>
        <h2>Prototype roles with immediate battlefield purpose</h2>
        <div className="grid">
          {snapshot.commanderLoadout.map((slot) => (
            <article className="card" key={slot.slot}>
              <div className="eyebrow">{slot.slot}</div>
              <h3>{slot.commander}</h3>
              <p>{slot.faction} · {slot.role}</p>
              <p>{slot.whyNow}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Scenario queue</div>
        <h2>Real prototype scenarios derived from current implementation data</h2>
        <div className="grid">
          {snapshot.scenarios.map((scenario) => (
            <article className="card" key={scenario.slug}>
              <div className="eyebrow">{scenario.phase}</div>
              <h3>{scenario.title}</h3>
              <p>{scenario.objective}</p>
              <p>Success metric: {scenario.successMetric}</p>
              <p>{scenario.recommendedFaction} · {scenario.recommendedCommander}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Prototype operator console</div>
        <h2>Persist build status, scenario selection, and notes from the site</h2>
        <p>The prototype surface is no longer read-only. Operators can now keep the active scenario and build notes in sync through the live prototype API.</p>
        <PrototypeBoardConsole
          initialState={snapshot.state}
          initialNotes={snapshot.notes}
          scenarios={snapshot.scenarios.map((scenario) => ({ slug: scenario.slug, title: scenario.title }))}
        />
      </section>

    </main>
  );
}
