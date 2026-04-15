'use client';

import { FormEvent, useState } from 'react';

type SubmitState = 'idle' | 'saving' | 'success' | 'error';

export function PlaytestIntakeForm() {
  const [email, setEmail] = useState('');
  const [faction, setFaction] = useState('dominion-core');
  const [platform, setPlatform] = useState('ios');
  const [playStyle, setPlayStyle] = useState('tactician');
  const [allianceRole, setAllianceRole] = useState('shot-caller');
  const [weeklyHours, setWeeklyHours] = useState('6-10');
  const [testIntent, setTestIntent] = useState('day-one');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [resultReasons, setResultReasons] = useState<string[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');
    setResultSummary('');
    setResultReasons([]);

    try {
      const response = await fetch('/api/playtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'playtest-page',
          faction,
          platform,
          playStyle,
          allianceRole,
          weeklyHours,
          testIntent,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setStatus('success');
      setMessage(data.duplicate ? 'You were already in the queue. Your current playtest profile is below.' : 'You’re now in the playtest queue.');
      setResultSummary(
        `${data.leadProfile?.invitePriority === 'priority' ? 'Priority' : data.leadProfile?.invitePriority === 'standard' ? 'Standard' : 'Watchlist'} tier, ${data.leadProfile?.score ?? 'n/a'} score, ${data.playtest?.recommendedWaveLabel ?? data.playtest?.recommendedWave ?? 'unknown'} next.`,
      );
      setResultReasons(Array.isArray(data.scoreReasons) ? data.scoreReasons : []);

      if (!data.duplicate) {
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMessage('That did not save cleanly. Try again in a minute.');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        className="fieldInput"
      />

      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Faction interest</span>
          <select value={faction} onChange={(event) => setFaction(event.target.value)} className="fieldInput">
            <option value="dominion-core">Dominion Core</option>
            <option value="iron-rebellion">Iron Rebellion</option>
            <option value="eclipse-syndicate">Eclipse Syndicate</option>
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
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Alliance role</span>
          <select value={allianceRole} onChange={(event) => setAllianceRole(event.target.value)} className="fieldInput">
            <option value="shot-caller">Shot caller</option>
            <option value="frontliner">Frontliner</option>
            <option value="logistics">Logistics / support</option>
            <option value="scout">Scout / intel</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Weekly hours</span>
          <select value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} className="fieldInput">
            <option value="1-3">1 to 3</option>
            <option value="4-5">4 to 5</option>
            <option value="6-10">6 to 10</option>
            <option value="10-plus">10+</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Test intent</span>
          <select value={testIntent} onChange={(event) => setTestIntent(event.target.value)} className="fieldInput">
            <option value="day-one">Ready for the earliest wave</option>
            <option value="weekend">Weekend-focused sessions</option>
            <option value="spectator">Want updates first, test later</option>
          </select>
        </label>
      </div>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Apply for Playtest'}
        </button>
      </div>

      {message ? <p style={{ color: status === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {resultSummary ? <p style={{ color: '#d1d5db' }}>{resultSummary}</p> : null}
      {resultReasons.length ? (
        <ul style={{ color: '#9ca3af', margin: 0, paddingLeft: 20 }}>
          {resultReasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      ) : null}
    </form>
  );
}
