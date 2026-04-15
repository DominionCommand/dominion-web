import { PageHero } from '../../components/PageHero';
import { RecruitmentCampaignBoard } from '../../components/RecruitmentCampaignBoard';
import { readLeads } from '../../lib/leads';
import { buildRecruitmentSnapshot } from '../../lib/recruitment';

export default async function RecruitmentPage() {
  const recruitment = await buildRecruitmentSnapshot(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Recruitment"
        title="A live recruitment planner now turns funnel data into campaign actions"
        body="This surface connects lead quality, faction gaps, event hooks, and playable cohort readiness so growth work follows the actual state of Dominion Nexus."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{recruitment.summary.recommendedWave.label}</h3>
            <p>{recruitment.summary.recommendedWave.qualifiedLeads} qualified leads currently sit in this queue.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Strongest source</div>
            <h3>{recruitment.summary.strongestSource ?? 'No lead source yet'}</h3>
            <p>{recruitment.summary.strongestSourceCount} leads are coming from the strongest current source.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Weakest faction</div>
            <h3>{recruitment.summary.weakestFaction?.name ?? 'No gap detected'}</h3>
            <p>{recruitment.summary.weakestFaction ? `${recruitment.summary.weakestFaction.leads} tagged leads currently sit here.` : 'Faction demand is more evenly spread right now.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Hottest front</div>
            <h3>{recruitment.summary.hottestFront?.zone ?? 'No front loaded'}</h3>
            <p>{recruitment.summary.hottestFront ? `${recruitment.summary.hottestFront.priority} pressure is driving the clearest war narrative.` : 'Frontline storytelling will appear here once operations are populated.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Campaign stack</div>
        <h2>What growth should do next</h2>
        <div className="grid">
          {recruitment.campaigns.map((campaign) => (
            <article className="card" key={campaign.slug}>
              <div className="eyebrow">{campaign.priority} priority · {campaign.operatorStatus}</div>
              <h3>{campaign.title}</h3>
              <p><strong>Audience:</strong> {campaign.audience}</p>
              <p><strong>Message:</strong> {campaign.message}</p>
              <p><strong>CTA:</strong> {campaign.cta}</p>
              <p><strong>Support surface:</strong> {campaign.supportSurface}</p>
              <p><strong>Why now:</strong> {campaign.whyNow}</p>
              <p><strong>Owner:</strong> {campaign.operatorOwner || 'Unassigned'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Execution board</div>
        <h2>Campaign work now persists through the live recruitment API</h2>
        <div className="grid">
          <article className="card">
            <div className="eyebrow">To do</div>
            <h3>{recruitment.board.summary.todo}</h3>
            <p>Recommendations not claimed yet.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Active</div>
            <h3>{recruitment.board.summary.active}</h3>
            <p>Campaigns currently being worked.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Blocked</div>
            <h3>{recruitment.board.summary.blocked}</h3>
            <p>Execution items waiting on assets, copy, or decisions.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Done</div>
            <h3>{recruitment.board.summary.done}</h3>
            <p>Completed recruitment pushes tracked in-product.</p>
          </article>
        </div>
        <p>Owners, statuses, and notes now save into the Dominion Nexus data layer so growth execution can survive refreshes and handoffs.</p>
        <RecruitmentCampaignBoard initialCampaigns={recruitment.campaigns} />
      </section>

      <section className="section">
        <div className="eyebrow">Recruit queue</div>
        <h2>The strongest current leads and why they rank</h2>
        <div className="grid">
          {recruitment.recruitQueue.map((lead) => (
            <article className="card" key={lead.email}>
              <div className="eyebrow">score {lead.score}</div>
              <h3>{lead.email}</h3>
              <p>{lead.wave}</p>
              <p>{lead.reasons.join(' · ')}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
