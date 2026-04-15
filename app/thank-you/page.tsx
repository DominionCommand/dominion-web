const waveLabels: Record<string, string> = {
  'wave-0-founder': 'Wave 0, founder strike team',
  'wave-1-mobile-core': 'Wave 1, mobile core',
  'wave-2-alliance-pressure': 'Wave 2, alliance pressure',
  'wave-3-broader-market': 'Wave 3, broader market',
};

const priorityLabels: Record<string, string> = {
  priority: 'Priority invite tier',
  standard: 'Standard invite tier',
  watchlist: 'Watchlist tier',
};

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const wave = typeof params.wave === 'string' ? params.wave : '';
  const priority = typeof params.priority === 'string' ? params.priority : '';
  const score = typeof params.score === 'string' ? params.score : '';

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Founder Access Confirmed</div>
        <h1>You’re on the list</h1>
        <p>We’ve saved your prereg interest for Dominion Nexus founder updates, faction reveals, and launch notices.</p>
      </section>

      {wave || priority || score ? (
        <section className="section">
          <h2>Your intake profile</h2>
          <div className="grid">
            <article className="card">
              <h3>Recommended wave</h3>
              <p>{waveLabels[wave] ?? 'Wave assignment pending'}</p>
            </article>
            <article className="card">
              <h3>Invite priority</h3>
              <p>{priorityLabels[priority] ?? 'Priority pending'}</p>
            </article>
            <article className="card">
              <h3>Current score</h3>
              <p>{score || 'Not available'}</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2>What happens next</h2>
        <div className="grid">
          <article className="card">
            <h3>Faction reveals</h3>
            <p>You’ll see the major power blocs before public launch messaging fully opens up.</p>
          </article>
          <article className="card">
            <h3>Founder rewards</h3>
            <p>We’ll use this list to shape founder reward access, early comms, and launch-day notification flows.</p>
          </article>
          <article className="card">
            <h3>Launch updates</h3>
            <p>You’ll get the important beats, not just noise.</p>
          </article>
          <article className="card">
            <h3>Prototype surface</h3>
            <p>The gameplay prototype route now shows the current loop, commander roles, and scenario queue behind this intake.</p>
            <a className="button buttonSecondary" href="/prototype">Open prototype surface</a>
          </article>
        </div>
      </section>
    </main>
  );
}
