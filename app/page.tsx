import { StatPill } from '../components/StatPill';
import { siteContent } from '../lib/content';
import { buildPlaytestSummary } from '../lib/funnel';
import { readLeads } from '../lib/leads';

const pillars = [
  {
    title: 'Build Your Dominion',
    body: 'Transform a vulnerable foothold into a fortified war machine with constant upgrade pressure and visible power growth.',
  },
  {
    title: 'Command Elite Heroes',
    body: 'Recruit commanders, assemble specialized squads, and optimize your roster for raids, defense, and seasonal conflict.',
  },
  {
    title: 'Forge Powerful Alliances',
    body: 'Coordinate rallies, contest territory, and turn alliance pressure into one of the strongest retention loops in the game.',
  },
  {
    title: 'Conquer the World Map',
    body: 'Fight for strongholds, resource nodes, and prestige objectives across a persistent war map built for rivalry.',
  },
];

export default async function HomePage() {
  const contestedZone = siteContent.worldZones.find((zone) => zone.control === 'contested');
  const playtestSummary = buildPlaytestSummary(await readLeads());

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">{siteContent.hero.eyebrow}</div>
        <h1>{siteContent.hero.title}</h1>
        <p>{siteContent.hero.description}</p>
        <div className="ctaRow">
          <a className="button buttonPrimary" href="/preregister">Preregister Now</a>
          <a className="button buttonSecondary" href="/economy">Open Economy Market</a>
          <a className="button buttonSecondary" href="/status">Open Status</a>
          <a className="button buttonSecondary" href="/command-center">Open Command Center</a>
          <a className="button buttonSecondary" href="/dashboard">Open Dashboard</a>
          <a className="button buttonSecondary" href="/mission-control">Open Mission Control</a>
          <a className="button buttonSecondary" href="/war-room">Open War Room</a>
          <a className="button buttonSecondary" href="/alliances">Open Alliance HQ</a>
          <a className="button buttonSecondary" href="/control-tower">Open Control Tower</a>
          <a className="button buttonSecondary" href="/release-room">Open Release Room</a>
          <a className="button buttonSecondary" href="/briefing">Open Daily Briefing</a>
          <a className="button buttonSecondary" href="/activity">Open Activity Feed</a>
          <a className="button buttonSecondary" href="/launch-plan">Open Launch Plan</a>
          <a className="button buttonSecondary" href="/storefront">Open Storefront</a>
          <a className="button buttonSecondary" href="/war-room">Open War Room Board</a>
          <a className="button buttonSecondary" href="/signals">Open Signals</a>
          <a className="button buttonSecondary" href="/roadmap">Open Roadmap Control</a>
          <a className="button buttonSecondary" href="/recruitment">Open Recruitment</a>
          <a className="button buttonSecondary" href="/intake">Open Intake</a>
          <a className="button buttonSecondary" href="/cohorts">Open Cohorts</a>
          <a className="button buttonSecondary" href="/founder-pipeline">Open Founder Pipeline</a>
          <a className="button buttonSecondary" href="/strike-team">Open Strike Team</a>
          <a className="button buttonSecondary" href="/invite-queue">Open Invite Queue</a>
          <a className="button buttonSecondary" href="/campaigns">Open Campaigns</a>
          <a className="button buttonSecondary" href="/factions">Explore Factions</a>
          <a className="button buttonSecondary" href="/commanders">Meet Commanders</a>
          <a className="button buttonSecondary" href="/events">View Events</a>
          <a className="button buttonSecondary" href="/public-kit">Open Public Kit</a>
          <a className="button buttonSecondary" href="/nexus">Open Nexus Graph</a>
          <a className="button buttonSecondary" href="/intel">Open Intel</a>
          <a className="button buttonSecondary" href="/contact-queue">Open Contact Ops Board</a>
          <a className="button buttonSecondary" href="/routes">Open Route Directory</a>
        </div>
        <div className="ctaRow" style={{ marginTop: 24 }}>
          <StatPill label="Mode" value="4X War Strategy" />
          <StatPill label="Focus" value="Alliance Warfare" />
          <StatPill label="Platform" value="iPhone / iPad" />
          <StatPill label="Content" value={`${siteContent.factions.length} factions / ${siteContent.commanders.length} commanders`} />
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Core Pillars</div>
        <h2>Built for pressure, prestige, and progression</h2>
        <div className="grid">
          {pillars.map((pillar) => (
            <article className="card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Seasonal War</div>
        <h2>The current conquest shell is now defined</h2>
        <div className="grid">
          {siteContent.seasonBeats.map((beat) => (
            <article className="card" key={beat.phase}>
              <div className="eyebrow">{beat.focus}</div>
              <h3>{beat.phase}</h3>
              <p>{beat.body}</p>
            </article>
          ))}
        </div>
        {contestedZone ? (
          <article className="card" style={{ marginTop: 16 }}>
            <div className="eyebrow">Featured contested zone</div>
            <h3>{contestedZone.name}</h3>
            <p>{contestedZone.objective}</p>
            <p>Reward: {contestedZone.reward}</p>
            <a className="button buttonSecondary" href="/world">Open world state</a>
          </article>
        ) : null}
      </section>

      <section className="section">
        <div className="eyebrow">Alliance Operations</div>
        <h2>Retention and prestige are being built around alliance play</h2>
        <div className="grid">
          {siteContent.allianceFeatures.map((feature) => (
            <article className="card" key={feature.slug}>
              <h3>{feature.title}</h3>
              <p>{feature.summary}</p>
              <p>{feature.impact}</p>
            </article>
          ))}
          <article className="card">
            <h3>Live command layer</h3>
            <p>A real season-control surface now persists the active beat, featured event, featured frontline, and operator notes instead of leaving live-ops state in static copy.</p>
            <a className="button buttonSecondary" href="/command-center">Open command center</a>
          </article>
          <article className="card">
            <h3>War room briefing</h3>
            <p>The war-room surface now goes beyond generated briefing copy and persists execution status, owners, and operator notes for each current focus item.</p>
            <a className="button buttonSecondary" href="/war-room">Open war room</a>
          </article>
          <article className="card">
            <h3>Alliance HQ</h3>
            <p>A new alliance command surface now persists intake priority, frontline campaign status, and logistics execution instead of leaving alliance ops as static copy.</p>
            <a className="button buttonSecondary" href="/alliances">Open Alliance HQ</a>
          </article>
          <article className="card">
            <h3>Control tower</h3>
            <p>A new cross-functional control tower now merges launch readiness, invite flow, growth execution, and frontline pressure into one operator surface.</p>
            <a className="button buttonSecondary" href="/control-tower">Open control tower</a>
          </article>
          <article className="card">
            <h3>Activity feed</h3>
            <p>Operator changes from season control, war room, control tower, and invite queue now flow into one visible activity trail instead of disappearing inside individual tools.</p>
            <a className="button buttonSecondary" href="/activity">Open activity feed</a>
          </article>
          <article className="card">
            <h3>Mission control</h3>
            <p>A new top-level operating board now merges release posture, season control, invite flow, war pressure, and storefront timing into one command snapshot.</p>
            <a className="button buttonSecondary" href="/mission-control">Open mission control</a>
          </article>
          <article className="card">
            <h3>Release room</h3>
            <p>A dedicated release surface now turns season state, invite posture, intake pressure, and store timing into a persisted go, hold, or blocked call.</p>
            <a className="button buttonSecondary" href="/release-room">Open release room</a>
          </article>
          <article className="card">
            <h3>Launch planning layer</h3>
            <p>A new launch-plan surface now persists operator notes and ties launch readiness to event timing, cohort strength, and faction coverage.</p>
            <a className="button buttonSecondary" href="/launch-plan">Open launch plan</a>
          </article>
          <article className="card">
            <h3>Signal board</h3>
            <p>A live signals surface now converts funnel velocity, acquisition mix, and coverage gaps into concrete operator actions.</p>
            <a className="button buttonSecondary" href="/signals">Open signals</a>
          </article>
          <article className="card">
            <h3>Storefront planner</h3>
            <p>A monetization surface now turns founder demand, alliance intent, and event timing into a persisted offer ladder with operator notes.</p>
            <a className="button buttonSecondary" href="/storefront">Open storefront</a>
          </article>
          <article className="card">
            <h3>Intel watch</h3>
            <p>The intel surface now aggregates funnel motion, frontline pressure, launch readiness, and operator activity into a persisted watch board with owner and status tracking.</p>
            <a className="button buttonSecondary" href="/intel">Open intel watch</a>
          </article>
          <article className="card">
            <h3>Recruitment planner</h3>
            <p>A new recruitment surface now converts lead quality, faction coverage gaps, and event hooks into concrete campaign priorities.</p>
            <a className="button buttonSecondary" href="/recruitment">Open recruitment</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Playtest Readiness</div>
        <h2>The lead funnel now feeds an actual cohort model</h2>
        <div className="grid">
          <article className="card">
            <h3>Recommended next wave</h3>
            <p>{playtestSummary.recommendedNextWave}</p>
            <p>{playtestSummary.byWave[playtestSummary.recommendedNextWave]} qualified leads currently sit in that cohort.</p>
          </article>
          <article className="card">
            <h3>Mobile readiness</h3>
            <p>{playtestSummary.totals.iosReady} iOS-tagged leads are already in the funnel.</p>
          </article>
          <article className="card">
            <h3>Faction coverage</h3>
            <p>{playtestSummary.factionCoverage.filter((entry) => entry.leads > 0).length} of {playtestSummary.factionCoverage.length} factions have prereg demand logged.</p>
          </article>
          <article className="card">
            <h3>Operator view</h3>
            <p>The internal ops page now exposes lead scoring, cohort counts, founder shortlist data, and alliance-role coverage.</p>
            <a className="button buttonSecondary" href="/ops">Open ops view</a>
          </article>
          <article className="card">
            <h3>Cohort planner</h3>
            <p>A new cohort-planning surface now turns playtest leads into a selected next-wave roster, reserve queue, and visible faction or role gaps.</p>
            <a className="button buttonSecondary" href="/cohorts">Open cohorts</a>
          </article>
          <article className="card">
            <h3>Founder pipeline</h3>
            <p>A new founder CRM surface now persists follow-up stage, outreach channel, owner, and handoff notes for high-value prereg leads.</p>
            <a className="button buttonSecondary" href="/founder-pipeline">Open founder pipeline</a>
          </article>
          <article className="card">
            <h3>Strike team roster</h3>
            <p>A new prototype roster surface now converts scored playtest leads into assigned and confirmed role slots for the next live test wave.</p>
            <a className="button buttonSecondary" href="/strike-team">Open strike team</a>
          </article>
          <article className="card">
            <h3>Invite queue</h3>
            <p>A persisted invite-queue surface now lets operators stage, hold, and mark playtest invites sent with notes attached to each lead.</p>
            <a className="button buttonSecondary" href="/invite-queue">Open invite queue</a>
          </article>
          <article className="card">
            <h3>Playtest intake</h3>
            <p>The playtest page now captures alliance role, weekly session depth, and early-access intent through a live intake form and scoring path.</p>
            <a className="button buttonSecondary" href="/playtest">Open playtest intake</a>
          </article>
          <article className="card">
            <h3>Prototype surface</h3>
            <p>A dedicated prototype route now translates world pressure, commander roles, and playtest readiness into a first playable loop scaffold.</p>
            <a className="button buttonSecondary" href="/prototype">Open prototype</a>
          </article>
          <article className="card">
            <h3>Campaign briefs</h3>
            <p>A new campaign surface now links event concepts to frontlines, featured commanders, and current cohort readiness instead of leaving campaign planning split across separate pages.</p>
            <a className="button buttonSecondary" href="/campaigns">Open campaigns</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Public Surfaces</div>
        <h2>The website now carries more of the pitch and support load</h2>
        <div className="grid">
          <article className="card">
            <h3>Status page</h3>
            <p>A new live system-status surface now rolls up command state, invite flow, recent activity, and route health into one operator-facing page.</p>
            <a className="button buttonSecondary" href="/status">Open status</a>
          </article>
          <article className="card">
            <h3>Mission control API</h3>
            <p>A new mission-control API now exposes the merged release, command, launch, war, and commerce operating picture as one payload for future automation or dashboards.</p>
            <a className="button buttonSecondary" href="/api/mission-control">Open mission-control API</a>
          </article>
          <article className="card">
            <h3>Roadmap control</h3>
            <p>The roadmap surface now rolls static phase copy together with real route coverage, release posture, control-tower state, blockers, and persisted operator overrides.</p>
            <a className="button buttonSecondary" href="/roadmap">Open roadmap control</a>
          </article>
          <article className="card">
            <h3>Events page</h3>
            <p>Live event cadence, windows, rewards, and seasonal support are now exposed as a first-class page.</p>
            <a className="button buttonSecondary" href="/events">Open events</a>
          </article>
          <article className="card">
            <h3>Nexus graph</h3>
            <p>A new connected-data surface now maps factions, commanders, zones, events, and news into one navigable graph instead of isolated content islands.</p>
            <a className="button buttonSecondary" href="/nexus">Open nexus graph</a>
          </article>
          <article className="card">
            <h3>FAQ page</h3>
            <p>Common launch, platform, and alliance questions now have a maintained answer surface instead of living only in docs.</p>
            <a className="button buttonSecondary" href="/faq">Open FAQ</a>
          </article>
          <article className="card">
            <h3>Press page</h3>
            <p>Press boilerplate, contact path, and current asset pack status are now visible on-site.</p>
            <a className="button buttonSecondary" href="/press">Open press kit</a>
          </article>
          <article className="card">
            <h3>Public kit</h3>
            <p>A single public-facing kit now packages press, media, and build updates into one shareable surface instead of splitting the external story across separate routes.</p>
            <a className="button buttonSecondary" href="/public-kit">Open public kit</a>
          </article>
          <article className="card">
            <h3>Contact queue</h3>
            <p>The public contact route now captures founder, partnership, press, and support requests through a persisted intake flow instead of a static email-only block.</p>
            <a className="button buttonSecondary" href="/contact">Open contact queue</a>
          </article>
          <article className="card">
            <h3>Contact ops board</h3>
            <p>A new internal contact-queue surface now lets operators triage, prioritize, assign, and close inbound requests while writing those updates into the shared activity log.</p>
            <a className="button buttonSecondary" href="/contact-queue">Open contact ops board</a>
          </article>
          <article className="card">
            <h3>Intake dashboard</h3>
            <p>A new intake surface now merges prereg leads, playtest qualification, contact requests, and operator activity into one follow-up board.</p>
            <a className="button buttonSecondary" href="/intake">Open intake</a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="eyebrow">Factions</div>
        <h2>Three paths to domination</h2>
        <div className="grid">
          {siteContent.factions.map((faction) => (
            <article className="card" key={faction.slug}>
              <h3>{faction.name}</h3>
              <p>{faction.summary}</p>
              <p>{faction.fantasy}</p>
              <a className="button buttonSecondary" href={`/factions/${faction.slug}`}>Faction brief</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
