import { PageHero } from '../../components/PageHero';
import { StrikeTeamConsole } from '../../components/StrikeTeamConsole';
import { readLeads } from '../../lib/leads';
import { buildStrikeTeamBoard } from '../../lib/strike-team';

export default async function StrikeTeamPage() {
  const board = await buildStrikeTeamBoard(await readLeads());

  return (
    <main>
      <PageHero
        eyebrow="Strike Team"
        title="Dominion Nexus now has a live prototype roster assignment surface"
        body="This page converts scored playtest demand into actual role slots for the next prototype wave, with persisted tester assignments, ownership, and operator notes."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Total slots</div>
            <h3>{board.summary.totalSlots}</h3>
            <p>The next prototype wave now has a fixed role skeleton instead of an implied tester pool.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Assigned</div>
            <h3>{board.summary.assigned}</h3>
            <p>These slots already have a tester attached from the live playtest funnel.</p>
          </article>
          <article className="card">
            <div className="eyebrow">Confirmed</div>
            <h3>{board.summary.confirmed}</h3>
            <p>Confirmed slots are ready for real outreach or TestFlight execution.</p>
          </article>
          <article className="card">
            <div className="eyebrow">iOS-ready candidates</div>
            <h3>{board.summary.iosReadyCandidates}</h3>
            <p>Unassigned iPhone and iPad candidates can be pulled directly into open slots.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Coverage view</div>
        <h2>Faction and roster balance for the next wave</h2>
        <div className="grid">
          {board.coverage.map((entry) => (
            <article className="card" key={entry.faction}>
              <h3>{entry.faction}</h3>
              <p>Assigned slots: {entry.assigned}</p>
              <p>Candidate pool: {entry.candidatePool}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator actions</div>
        <h2>What the current roster tells us</h2>
        <div className="grid">
          {board.actions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Open candidates</div>
        <h2>Highest-scoring unassigned testers</h2>
        <div className="grid">
          {board.candidates.length ? board.candidates.slice(0, 6).map((candidate) => (
            <article className="card" key={candidate.email}>
              <div className="eyebrow">{candidate.invitePriority} · {candidate.role}</div>
              <h3>{candidate.email}</h3>
              <p>{candidate.score} score · {candidate.factionLabel}</p>
              <p>{candidate.platformLabel} · {candidate.playStyleLabel}</p>
              <p>{candidate.reasons.slice(0, 3).join(' · ')}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No unassigned candidates</h3>
              <p>As new playtest leads arrive, the next available testers will appear here.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Strike-team console</div>
        <h2>Assign, confirm, and hand off tester slots from the site</h2>
        <p>Each saved update writes prototype roster state into the Dominion Nexus data layer so roster planning survives refreshes and operator handoffs.</p>
        <StrikeTeamConsole initialSlots={board.slots} candidates={board.candidates} />
      </section>
    </main>
  );
}
