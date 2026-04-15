import { PageHero } from '../../components/PageHero';
import { readLeads } from '../../lib/leads';
import { buildDailyBriefing } from '../../lib/briefing';

export default async function BriefingPage() {
  const briefing = await buildDailyBriefing(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Daily Briefing"
        title="One operator surface for the current Dominion Nexus story"
        body="This briefing folds live fronts, event focus, launch readiness, and invite pressure into one page so product direction is visible without hopping between tools."
      />

      <section className="section">
        <div className="eyebrow">Headline</div>
        <h2>{briefing.headline}</h2>
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{briefing.summary.recommendedWave.label}</h3>
            <p>{briefing.summary.recommendedWave.qualifiedLeads} qualified leads are ready for the current invite recommendation.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Hottest front</div>
            <h3>{briefing.summary.hottestFront?.zone ?? 'No frontline selected'}</h3>
            <p>{briefing.summary.hottestFront ? `${briefing.summary.hottestFront.commander} is the recommended commander and ${briefing.summary.hottestFront.priority} pressure is active.` : 'No frontline pressure has been surfaced yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Featured event</div>
            <h3>{briefing.summary.activeEvent?.name ?? 'No event selected'}</h3>
            <p>{briefing.summary.activeEvent?.window ?? 'Set a live event window to anchor the story.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Tower focus</div>
            <h3>{briefing.summary.focusLane}</h3>
            <p>Control tower is currently in {briefing.summary.towerStatus} mode.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Top calls</div>
        <h2>What to do next</h2>
        <div className="grid">
          {briefing.topCalls.map((call) => (
            <article className="card" key={call}>
              <p>{call}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Execution queue</div>
        <h2>The highest-priority work across growth, launch, and war-room lanes</h2>
        <div className="grid">
          {briefing.queue.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.lane} · {item.status}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <p>Owner: {item.owner}</p>
              <p>Surface: {item.surface}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Known blockers</div>
        <h2>What is slowing the launch path down</h2>
        <div className="grid">
          {briefing.blockers.length ? briefing.blockers.map((blocker) => (
            <article className="card" key={blocker}>
              <p>{blocker}</p>
            </article>
          )) : (
            <article className="card">
              <p>No major blockers are surfaced right now.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Founder follow-up</div>
        <h2>High-value leads still closest to handoff</h2>
        <div className="grid">
          {briefing.recentFounderLeads.length ? briefing.recentFounderLeads.map((lead) => (
            <article className="card" key={lead.email}>
              <div className="eyebrow">{lead.stage}</div>
              <h3>{lead.email}</h3>
              <p>Owner: {lead.owner || 'Unassigned'}</p>
              <p>Channel: {lead.channel || 'Not selected'}</p>
              <p>{lead.nextMove}</p>
            </article>
          )) : (
            <article className="card">
              <p>No founder leads are in the handoff queue yet.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
