import { FounderPipelineConsole } from '../../components/FounderPipelineConsole';
import { PageHero } from '../../components/PageHero';
import { buildFounderPipeline } from '../../lib/founder-pipeline';
import { readLeads } from '../../lib/leads';
import { buildLeadHref } from '../../lib/lead-routes';

export default async function FounderPipelinePage() {
  const pipeline = await buildFounderPipeline(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Founder Pipeline"
        title="Dominion Nexus now has a persisted founder follow-up board"
        body="This operator surface turns high-value prereg leads into a live CRM lane with stage, channel, owner, and handoff notes saved into the app data layer."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Tracked leads</div>
            <h3>{pipeline.summary.totalTracked}</h3>
            <p>Top-scoring prereg leads are now visible in a single founder operations board.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Qualified</div>
            <h3>{pipeline.summary.qualified}</h3>
            <p>These leads are ready for operator review and invite prep.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Contacting</div>
            <h3>{pipeline.summary.contacting}</h3>
            <p>Active outreach can now be tracked without dropping into side docs.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invited</div>
            <h3>{pipeline.summary.invited}</h3>
            <p>Accepted founder outreach can move cleanly into invite execution.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Stage board</div>
        <h2>Live founder CRM posture</h2>
        <div className="grid">
          {pipeline.stageBoard.map((column) => (
            <article className="card" key={column.stage}>
              <h3>{column.label}</h3>
              <p>{column.count} leads currently sit in this stage.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator actions</div>
        <h2>What the founder queue is saying</h2>
        <div className="grid">
          {pipeline.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Handoff queue</div>
        <h2>Immediate founder follow-up lane</h2>
        <div className="grid">
          {pipeline.handoffQueue.length ? pipeline.handoffQueue.map((item) => (
            <article className="card" key={item.email}>
              <div className="eyebrow">{item.stage} · {item.channel}</div>
              <h3>{item.email}</h3>
              <p>Owner: {item.owner}</p>
              <p>Score: {item.score}</p>
              <p>{item.nextMove}</p>
              <a className="button buttonSecondary" href={buildLeadHref(item.email)}>Open intake dossier</a>
            </article>
          )) : (
            <article className="card">
              <h3>No active founder handoffs</h3>
              <p>As founder notes and stages get saved, the next-move queue will appear here.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Pipeline console</div>
        <h2>Save stage, owner, and outreach channel directly from the site</h2>
        <p>Each update writes founder CRM state into the Dominion Nexus data layer, so follow-up survives refreshes and operator handoffs.</p>
        <FounderPipelineConsole initialQueue={pipeline.queue} />
      </section>
    </main>
  );
}
