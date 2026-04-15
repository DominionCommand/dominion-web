import { PageHero } from '../../components/PageHero';
import { SeasonControlConsole } from '../../components/SeasonControlConsole';
import { readLeads } from '../../lib/leads';
import { buildSeasonControlSnapshot } from '../../lib/season-control';
import { siteContent } from '../../lib/content';

export default async function CommandCenterPage() {
  const snapshot = await buildSeasonControlSnapshot(await readLeads());
  const featuredZoneName = snapshot.featuredZone ? ('name' in snapshot.featuredZone ? snapshot.featuredZone.name : snapshot.featuredZone.zone) : 'No zone selected';
  const featuredZoneObjective = snapshot.featuredZone?.objective ?? 'No frontline objective selected.';
  const featuredZoneStrategicValue = snapshot.featuredZone && 'strategicValue' in snapshot.featuredZone
    ? snapshot.featuredZone.strategicValue
    : 'Select a frontline zone to expose its strategic value here.';

  return (
    <main>
      <PageHero
        eyebrow="Command Center"
        title="Season control, live-event focus, and frontline pressure now share one surface"
        body="This page gives Dominion Nexus a real command layer for selecting the active seasonal beat, featured event, featured zone, and live operator notes without burying that state in docs."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="eyebrow">Season state</div>
            <h3>{snapshot.state.status}</h3>
            <p>{snapshot.activeBeat?.focus ?? 'No seasonal beat selected yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Featured event</div>
            <h3>{snapshot.featuredEvent?.name ?? 'No event selected'}</h3>
            <p>{snapshot.featuredEvent?.window ?? 'Timing not set'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Featured zone</div>
            <h3>{featuredZoneName}</h3>
            <p>{featuredZoneObjective}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Pressure summary</div>
            <h3>{snapshot.pressureSummary.criticalFronts} critical fronts</h3>
            <p>{snapshot.pressureSummary.highPressureZones} high-pressure zones are active across {snapshot.pressureSummary.activeFronts} surfaced fronts.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Operator headline</div>
        <h2>{snapshot.headline}</h2>
        <div className="grid">
          {snapshot.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Season control console</div>
        <h2>Persist live season settings and notes</h2>
        <article className="card">
          <SeasonControlConsole
            initialState={snapshot.state}
            beatOptions={siteContent.seasonBeats.map((beat) => ({ value: beat.phase, label: `${beat.phase} · ${beat.focus}` }))}
            eventOptions={siteContent.events.map((event) => ({ value: event.slug, label: `${event.name} · ${event.status}` }))}
            zoneOptions={siteContent.worldZones.map((zone) => ({ value: zone.slug, label: `${zone.name} · ${zone.control}` }))}
          />
        </article>
      </section>

      <section className="section">
        <div className="eyebrow">Beat progress</div>
        <h2>Current seasonal arc</h2>
        <div className="grid">
          {snapshot.beatProgress.map((beat) => (
            <article className="card" key={beat.phase}>
              <div className="eyebrow">{beat.status}</div>
              <h3>{beat.phase}</h3>
              <p>{beat.focus}</p>
              <p>{beat.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Linked execution</div>
        <h2>Cross-links from the active frontline story</h2>
        <div className="grid">
          <article className="card">
            <h3>Recommended frontline</h3>
            <p>{snapshot.recommendedZone ? `${snapshot.recommendedZone.zone} is the strongest next pressure story.` : 'No recommended frontline surfaced yet.'}</p>
            <a className="button buttonSecondary" href="/war-room">Open war room</a>
          </article>
          <article className="card">
            <h3>Event support</h3>
            <p>{snapshot.linkedEvent ? `${snapshot.linkedEvent.name} is linked to the selected zone.` : 'No linked event is attached to the selected zone yet.'}</p>
            <a className="button buttonSecondary" href="/events">Open events</a>
          </article>
          <article className="card">
            <h3>World-state context</h3>
            <p>{featuredZoneStrategicValue}</p>
            <a className="button buttonSecondary" href="/world">Open world state</a>
          </article>
          <article className="card">
            <h3>Control tower handoff</h3>
            <p>The cross-functional tower can now consume a clearly selected seasonal beat and live focus zone.</p>
            <a className="button buttonSecondary" href="/control-tower">Open control tower</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Recent notes</div>
        <h2>Live-ops memory for the active season</h2>
        <div className="grid">
          {snapshot.notes.length ? snapshot.notes.map((note) => (
            <article className="card" key={note.id}>
              <div className="eyebrow">{new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <p>{note.text}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No season notes saved yet</h3>
              <p>Use the console above to pin live-ops direction, timing risks, or handoff context to the current season state.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
