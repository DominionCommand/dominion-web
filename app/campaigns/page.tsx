import { CampaignBoardConsole } from '../../components/CampaignBoardConsole';
import { CardGrid } from '../../components/CardGrid';
import { PageHero } from '../../components/PageHero';
import { buildCampaignBriefs } from '../../lib/campaigns';
import { readLeads } from '../../lib/leads';

export default async function CampaignsPage() {
  const snapshot = await buildCampaignBriefs(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Campaigns"
        title="Live campaign briefs now connect events, frontlines, commanders, and cohort readiness"
        body="This surface turns Dominion Nexus event concepts into linked operational briefs, so product, growth, and live-ops can see how each campaign maps to a zone, a commander, and the current playtest cohort."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Campaign coverage</div>
            <h3>{snapshot.summary.totalCampaigns} campaigns surfaced</h3>
            <p>{snapshot.summary.activeCampaigns} active and {snapshot.summary.highPressureCampaigns} tied to high-pressure fronts.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recommended cohort</div>
            <h3>{snapshot.summary.recommendedWave}</h3>
            <p>{snapshot.summary.qualifiedLeads} leads currently qualify for the next campaign test wave.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Execution posture</div>
            <h3>{snapshot.summary.liveCampaigns} live / {snapshot.summary.blockedCampaigns} blocked</h3>
            <p>Campaign execution now persists owner, channel, and blockers instead of living only in static briefs.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Coverage gaps</div>
            <h3>{snapshot.summary.factionCoverageGaps.length ? 'Needs attention' : 'Balanced enough to test'}</h3>
            <p>{snapshot.summary.factionCoverageGaps.length ? snapshot.summary.factionCoverageGaps.join(', ') : 'No campaign is currently blocked by thin faction demand.'}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Campaign ladder</div>
        <h2>Operational briefs</h2>
        <CardGrid>
          {snapshot.campaigns.map((campaign) => (
            <article className="card" key={campaign.slug}>
              <div className="eyebrow">{campaign.status} event · {campaign.executionStatus} execution · {campaign.cadence}</div>
              <h3>{campaign.name}</h3>
              <p>{campaign.summary}</p>
              <p><strong>Objective:</strong> {campaign.objective}</p>
              <p><strong>Window:</strong> {campaign.window}</p>
              <p><strong>Frontline:</strong> {campaign.zone ? `${campaign.zone.name} · ${campaign.zone.control} control · ${campaign.zone.pressure} pressure` : 'No linked zone yet'}</p>
              <p><strong>Commander:</strong> {campaign.commander ? `${campaign.commander.name} · ${campaign.commander.role}` : 'No featured commander yet'}</p>
              <p><strong>Faction demand:</strong> {campaign.factionDemand ? `${campaign.factionDemand.name} has ${campaign.factionDemand.leads} tagged leads (${campaign.factionDemand.coverageState})` : 'No demand mapping yet'}</p>
              <p><strong>Action:</strong> {campaign.actionLine}</p>
              <p><strong>Operator:</strong> {campaign.executionOwner} via {campaign.executionChannel}</p>
              <p><strong>Execution note:</strong> {campaign.executionNote || 'No execution note saved yet.'}</p>
              <div className="ctaRow" style={{ marginTop: 12 }}>
                <a className="button buttonSecondary" href={`/campaigns/${campaign.slug}`}>Open campaign packet</a>
                <a className="button buttonSecondary" href={`/events/${campaign.slug}`}>Open event brief</a>
                {campaign.zone ? <a className="button buttonSecondary" href={`/world/${campaign.zone.slug}`}>Open frontline</a> : null}
                {campaign.commander ? <a className="button buttonSecondary" href={`/commanders/${campaign.commander.slug}`}>Open commander</a> : null}
              </div>
            </article>
          ))}
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Campaign console</div>
        <h2>Save campaign execution state from the site</h2>
        <p>This console writes campaign owner, execution status, primary channel, and blocker notes into the Dominion Nexus data layer and activity feed.</p>
        <CampaignBoardConsole
          initialCampaigns={snapshot.campaigns.map((campaign) => ({
            slug: campaign.slug,
            name: campaign.name,
            status: campaign.executionStatus,
            owner: campaign.executionOwner,
            channel: campaign.executionChannel,
            note: campaign.executionNote,
            cadence: campaign.cadence,
            window: campaign.window,
            zoneLabel: campaign.zone?.name ?? 'Unmapped frontline',
            commanderLabel: campaign.commander?.name ?? 'Unmapped commander',
          }))}
        />
      </section>
    </main>
  );
}
