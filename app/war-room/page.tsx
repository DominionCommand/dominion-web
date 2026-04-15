import { PageHero } from '../../components/PageHero';
import { WarRoomFocusBoard } from '../../components/WarRoomFocusBoard';
import { readLeads } from '../../lib/leads';
import { buildWarRoomBriefing } from '../../lib/war-room';

export default async function WarRoomPage() {
  const briefing = await buildWarRoomBriefing(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="War Room"
        title="Dominion Nexus now has a generated operational briefing surface"
        body="This page turns the current site content, world map, event schedule, and prereg funnel into a concrete daily command readout instead of leaving those systems disconnected."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <h3>Headline</h3>
            <p>{briefing.headline}</p>
          </article>
          <article className="card">
            <h3>Status line</h3>
            <p>{briefing.statusLine}</p>
          </article>
          <article className="card">
            <h3>Next invite wave</h3>
            <p>{briefing.nextWave.label}</p>
            <p>{briefing.nextWave.qualifiedLeads} qualified leads currently sit in this cohort.</p>
          </article>
          <article className="card">
            <h3>Coverage pressure</h3>
            <p>{briefing.nextWave.shortage}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Focus queue</div>
        <h2>What to build or operate next</h2>
        <div className="grid">
          {briefing.focusQueue.map((focus) => (
            <article className="card" key={focus.slug}>
              <div className="eyebrow">{focus.urgency} priority · {focus.operatorStatus}</div>
              <h3>{focus.title}</h3>
              <p>{focus.reason}</p>
              <p>Action: {focus.action}</p>
              <p>Suggested owner: {focus.owner}</p>
              <p>Operator owner: {focus.operatorOwner || 'Unassigned'}</p>
              <p>Operator note: {focus.operatorNote || 'No note saved yet.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Execution board</div>
        <h2>The war room now persists operator follow-through</h2>
        <div className="grid">
          <article className="card">
            <div className="eyebrow">To do</div>
            <h3>{briefing.board.summary.todo}</h3>
            <p>Generated priorities that still need an owner or active movement.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Active</div>
            <h3>{briefing.board.summary.active}</h3>
            <p>Frontline or growth actions currently being worked.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Blocked</div>
            <h3>{briefing.board.summary.blocked}</h3>
            <p>Items waiting on assets, product hooks, or operator decisions.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Done</div>
            <h3>{briefing.board.summary.done}</h3>
            <p>War room actions that have already been pushed across the line.</p>
          </article>
        </div>
        <p>Statuses, owners, and notes now save through the live war-room API so the generated brief can become an actual execution surface.</p>
        <WarRoomFocusBoard initialFocusQueue={briefing.focusQueue} />
      </section>

      <section className="section">
        <div className="eyebrow">Critical fronts</div>
        <h2>Zones driving current prototype pressure</h2>
        <div className="grid">
          {briefing.criticalFronts.map((front) => (
            <article className="card" key={front.slug}>
              <div className="eyebrow">{front.priority}</div>
              <h3>{front.zone}</h3>
              <p>{front.faction}</p>
              <p>Recommended commander: {front.commander}</p>
              <p>Reward: {front.reward}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Event alignment</div>
        <h2>Live content mapped onto current fronts</h2>
        <div className="grid">
          {briefing.eventAlignment.map((event) => (
            <article className="card" key={event.slug}>
              <div className="eyebrow">{event.status}</div>
              <h3>{event.name}</h3>
              <p>Best-fit zone: {event.zone}</p>
              <p>Reward: {event.reward}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Faction demand</div>
        <h2>Where the prereg funnel is strong or thin</h2>
        <div className="grid">
          {briefing.factionDemand.map((faction) => (
            <article className="card" key={faction.slug}>
              <div className="eyebrow">{faction.demandStatus}</div>
              <h3>{faction.name}</h3>
              <p>{faction.leads} leads tagged to this faction.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
