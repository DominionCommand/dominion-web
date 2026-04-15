'use client';

import { FormEvent, useState } from 'react';

const factions = [
  { value: 'dominion-core', label: 'Dominion Core' },
  { value: 'iron-rebellion', label: 'Iron Rebellion' },
  { value: 'eclipse-syndicate', label: 'Eclipse Syndicate' },
];

export default function PreregisterPage() {
  const [email, setEmail] = useState('');
  const [faction, setFaction] = useState(factions[0].value);
  const [platform, setPlatform] = useState('ios');
  const [playStyle, setPlayStyle] = useState('tactician');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resultSummary, setResultSummary] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');
    setResultSummary('');

    try {
      const response = await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'founder-page', faction, platform, playStyle }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setStatus('success');
      setMessage(data.duplicate ? 'You were already on the list. Redirecting now.' : 'You’re on the founder list. Redirecting now.');
      setResultSummary(
        `${data.leadProfile?.invitePriority === 'priority' ? 'Priority' : data.leadProfile?.invitePriority === 'standard' ? 'Standard' : 'Watchlist'} invite tier, ${data.leadProfile?.score ?? 'n/a'} score, ${data.playtest?.recommendedWave ?? 'unknown'} currently recommended.`,
      );
      setEmail('');
      const params = new URLSearchParams({
        wave: data.playtest?.recommendedWave ?? '',
        priority: data.leadProfile?.invitePriority ?? '',
        score: String(data.leadProfile?.score ?? ''),
      });
      window.location.href = `/thank-you?${params.toString()}`;
    } catch {
      setStatus('error');
      setMessage('That did not save cleanly. Try again in a minute.');
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Founder Access</div>
        <h1>Join the first wave</h1>
        <p>Founder rewards, launch updates, faction reveals, and early playtest targeting start here.</p>
      </section>

      <section className="section">
        <h2>Preregister interest</h2>
        <p>Drop your email, pick your likely faction, and tell us how you want to fight so the first tests can be shaped around real player intent.</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'white',
            }}
          />

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Faction interest</span>
              <select value={faction} onChange={(event) => setFaction(event.target.value)} className="fieldInput">
                {factions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Primary platform</span>
              <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="fieldInput">
                <option value="ios">iPhone / iPad</option>
                <option value="android">Android</option>
                <option value="web">Web follow-along only</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Play style</span>
              <select value={playStyle} onChange={(event) => setPlayStyle(event.target.value)} className="fieldInput">
                <option value="builder">Builder</option>
                <option value="raider">Raider</option>
                <option value="tactician">Tactician</option>
              </select>
            </label>
          </div>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving...' : 'Reserve Your Command'}
            </button>
          </div>
        </form>
        {message ? <p style={{ color: status === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
        {resultSummary ? <p style={{ color: '#d1d5db' }}>{resultSummary}</p> : null}
      </section>
    </main>
  );
}
