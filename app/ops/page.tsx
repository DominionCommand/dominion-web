import { PageHero } from '../../components/PageHero';
import { siteContent } from '../../lib/content';
import { readLeads, summarizeLeads } from '../../lib/leads';
import { buildOperationsSnapshot } from '../../lib/operations';

const waveLabels = {
  'wave-0-founder': 'Wave 0, founder strike team',
  'wave-1-mobile-core': 'Wave 1, mobile core',
  'wave-2-alliance-pressure': 'Wave 2, alliance pressure',
  'wave-3-broader-market': 'Wave 3, broader market',
} as const;

function getWaveLabel(wave: keyof typeof waveLabels) {
  return waveLabels[wave];
}

export default async function OpsPage() {
  const leads = await readLeads();
  const leadSummary = summarizeLeads(leads);
  const operationsSnapshot = await buildOperationsSnapshot(leads);
  const playtestSummary = operationsSnapshot.playtest;

  return (
    <main>
      <PageHero
        eyebrow="Ops"
        title="Dominion Nexus now has a merged internal ops board"
        body="This surface now combines world pressure, control-tower posture, intake queue state, playtest readiness, and recent operator motion in one place instead of leaving ops as a thin summary page."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Lead funnel</div>
            <h3>{leadSummary.unique} unique leads</h3>
            <p>{leadSummary.total} total submissions and {Object.keys(leadSummary.bySource).length} active acquisition sources are now feeding the board.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Command post</div>
            <h3>{operationsSnapshot.commandPost.status}</h3>
            <p>{operationsSnapshot.commandPost.focusLane} is the active lane under {operationsSnapshot.commandPost.owner || 'unassigned command'}.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Intake queue</div>
            <h3>{operationsSnapshot.intakeQueue.selectedInvites} selected</h3>
            <p>{operationsSnapshot.intakeQueue.openContacts} open contact requests, {operationsSnapshot.intakeQueue.unownedContacts} still unowned.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Content footprint</div>
            <h3>{siteContent.worldZones.length} world zones</h3>
            <p>{siteContent.factions.length} factions and {siteContent.commanders.length} commanders are currently wired into the operating model.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Command posture</div>
        <h2>The current operating call</h2>
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Headline</div>
            <h3>{operationsSnapshot.commandPost.headline}</h3>
            <p>Updated {new Date(operationsSnapshot.commandPost.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recommended wave</div>
            <h3>{getWaveLabel(playtestSummary.recommendedNextWave)}</h3>
            <p>{operationsSnapshot.intakeQueue.selectedInvites} currently selected, {operationsSnapshot.intakeQueue.invitesSent} already sent, {operationsSnapshot.intakeQueue.onHold} on hold.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Recent operator motion</div>
            <h3>{operationsSnapshot.summary.recentActivity} records</h3>
            <p>The ops board is now pulling recent command activity into the same surface as intake and world pressure.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What the merged ops model says to do next</h2>
        <div className="grid">
          {operationsSnapshot.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Frontline board</div>
        <h2>Active war pressure and who owns it</h2>
        <div className="grid">
          {operationsSnapshot.frontlineBoard.map((operation) => (
            <article className="card" key={operation.slug}>
              <div className="eyebrow">{operation.priority} · {operation.owner}</div>
              <h3>{operation.zone}</h3>
              <p>{operation.objective}</p>
              <p>{operation.faction} · {operation.recommendedCommander}</p>
              <p>{operation.nextAction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Alliance readiness</div>
        <h2>Systems most ready for pressure testing</h2>
        <div className="grid">
          {operationsSnapshot.allianceReadiness.map((item) => (
            <article className="card" key={item.slug}>
              <div className="eyebrow">{item.readiness}</div>
              <h3>{item.title}</h3>
              <p>Score: {item.score}</p>
              <p>{item.requirement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Wave readiness</div>
        <h2>Invite sequencing and faction coverage</h2>
        <div className="grid">
          {Object.entries(playtestSummary.byWave).map(([wave, count]) => (
            <article className="card" key={wave}>
              <h3>{getWaveLabel(wave as keyof typeof waveLabels)}</h3>
              <p>{count} leads currently qualify for this cohort.</p>
            </article>
          ))}
          {playtestSummary.factionCoverage.map((entry) => (
            <article className="card" key={entry.slug}>
              <h3>{entry.name}</h3>
              <p>{entry.leads} interested leads</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Prototype missions</div>
        <h2>The implementation scaffolds with the clearest downstream dependencies</h2>
        <div className="grid">
          {operationsSnapshot.prototypeMissions.map((mission) => (
            <article className="card" key={mission.slug}>
              <div className="eyebrow">{mission.phase}</div>
              <h3>{mission.title}</h3>
              <p>{mission.objective}</p>
              <p>Owner: {mission.owner}</p>
              <p>Dependency: {mission.dependency}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Execution risks</div>
        <h2>The issues still pushing back on launch and ops flow</h2>
        <div className="grid">
          {operationsSnapshot.executionRisks.map((risk) => (
            <article className="card" key={risk}>
              <p>{risk}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Inbound and activity</div>
        <h2>Queue updates and recent operator trail</h2>
        <div className="grid">
          {operationsSnapshot.contactQueue.recentUpdates.map((entry) => (
            <article className="card" key={entry.requestId}>
              <div className="eyebrow">{entry.topic} · {entry.priority}</div>
              <h3>{entry.name || entry.email}</h3>
              <p>{entry.message}</p>
              <p>{entry.status} · {entry.owner || 'unassigned'}</p>
            </article>
          ))}
          {operationsSnapshot.recentActivity.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="eyebrow">{entry.entity}</div>
              <h3>{entry.summary}</h3>
              <p>{entry.detail ?? entry.action}</p>
              <p>{entry.actor}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
