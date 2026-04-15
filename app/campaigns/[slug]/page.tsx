import { notFound } from 'next/navigation';

import { CampaignPacketConsole } from '../../../components/CampaignPacketConsole';
import { CardGrid } from '../../../components/CardGrid';
import { PageHero } from '../../../components/PageHero';
import { buildCampaignPacket } from '../../../lib/campaign-packets';
import { readLeads } from '../../../lib/leads';

export default async function CampaignPacketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const packet = await buildCampaignPacket(slug, await readLeads());

  if (!packet) {
    notFound();
  }

  const { campaign, readiness, checklist } = packet;

  return (
    <main>
      <PageHero
        eyebrow="Campaign packet"
        title={campaign.name}
        body={`${campaign.summary} This packet ties execution state, launch checklist progress, cohort fit, and frontline context into one operator surface.`}
      />

      <section className="section">
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Readiness score</div>
            <h3>{readiness.score}%</h3>
            <p>{readiness.headline}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Execution</div>
            <h3>{campaign.executionStatus}</h3>
            <p>{campaign.executionOwner} via {campaign.executionChannel}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Checklist progress</div>
            <h3>{readiness.done} / {readiness.total} done</h3>
            <p>{readiness.blocked ? 'Launch blockers still need attention.' : 'No immediate blockers are flagged.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Cohort fit</div>
            <h3>{campaign.playtestFit.recommendedWave}</h3>
            <p>{campaign.playtestFit.qualifiedLeads} qualified leads and {campaign.playtestFit.iosReady} iOS-ready prospects support this test wave.</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Campaign context</div>
        <h2>Frontline and operator brief</h2>
        <CardGrid>
          <article className="card">
            <h3>Objective</h3>
            <p>{campaign.objective}</p>
            <p><strong>Reward:</strong> {campaign.reward}</p>
            <p><strong>Window:</strong> {campaign.window}</p>
          </article>
          <article className="card">
            <h3>Frontline</h3>
            <p>{campaign.zone ? `${campaign.zone.name} · ${campaign.zone.control} control · ${campaign.zone.pressure} pressure` : 'No linked frontline yet.'}</p>
            <p>{campaign.zone?.strategicValue || 'Map this campaign to a zone to make frontline stakes visible.'}</p>
          </article>
          <article className="card">
            <h3>Commander anchor</h3>
            <p>{campaign.commander ? `${campaign.commander.name} · ${campaign.commander.role}` : 'No featured commander mapped yet.'}</p>
            <p>{campaign.commander?.specialty || 'Attach a commander to make the campaign fantasy and counterplay legible.'}</p>
          </article>
          <article className="card">
            <h3>Demand signal</h3>
            <p>{campaign.factionDemand ? `${campaign.factionDemand.name} has ${campaign.factionDemand.leads} tagged leads.` : 'No faction demand mapping yet.'}</p>
            <p>{campaign.actionLine}</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Launch checklist</div>
        <h2>Persist campaign readiness from the site</h2>
        <p>This checklist writes to the Dominion Nexus data layer, so campaign readiness now has a dedicated per-event execution surface instead of living only in notes.</p>
        <CampaignPacketConsole slug={campaign.slug} name={campaign.name} initialChecklist={checklist} />
      </section>
    </main>
  );
}
