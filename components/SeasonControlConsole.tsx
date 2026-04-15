'use client';

import { FormEvent, useState } from 'react';

type SeasonControlState = {
  status: 'planning' | 'live' | 'cooldown';
  activeBeat: string;
  featuredEventSlug: string;
  featuredZoneSlug: string;
  owner: string;
  updatedAt: string;
};

type Option = {
  value: string;
  label: string;
};

type Props = {
  initialState: SeasonControlState;
  beatOptions: Option[];
  eventOptions: Option[];
  zoneOptions: Option[];
};

type SubmitState = 'idle' | 'saving' | 'success' | 'error';

export function SeasonControlConsole({ initialState, beatOptions, eventOptions, zoneOptions }: Props) {
  const [statusValue, setStatusValue] = useState(initialState.status);
  const [activeBeat, setActiveBeat] = useState(initialState.activeBeat);
  const [featuredEventSlug, setFeaturedEventSlug] = useState(initialState.featuredEventSlug);
  const [featuredZoneSlug, setFeaturedZoneSlug] = useState(initialState.featuredZoneSlug);
  const [owner, setOwner] = useState(initialState.owner);
  const [note, setNote] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState(initialState.updatedAt);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState('saving');
    setMessage('');

    try {
      const response = await fetch('/api/season-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusValue,
          activeBeat,
          featuredEventSlug,
          featuredZoneSlug,
          owner,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to update season control');

      setSubmitState('success');
      setMessage('Season control saved. Refresh to see the latest note ordering.');
      setUpdatedAt(data.state?.updatedAt ?? new Date().toISOString());
      setNote('');
    } catch {
      setSubmitState('error');
      setMessage('Could not save season control just now. Try again.');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Season status</span>
          <select value={statusValue} onChange={(event) => setStatusValue(event.target.value as SeasonControlState['status'])} className="fieldInput">
            <option value="planning">Planning</option>
            <option value="live">Live</option>
            <option value="cooldown">Cooldown</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Active beat</span>
          <select value={activeBeat} onChange={(event) => setActiveBeat(event.target.value)} className="fieldInput">
            {beatOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
          <input value={owner} onChange={(event) => setOwner(event.target.value)} className="fieldInput" />
        </label>
      </div>

      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Featured event</span>
          <select value={featuredEventSlug} onChange={(event) => setFeaturedEventSlug(event.target.value)} className="fieldInput">
            {eventOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Featured zone</span>
          <select value={featuredZoneSlug} onChange={(event) => setFeaturedZoneSlug(event.target.value)} className="fieldInput">
            {zoneOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="fieldInput"
          rows={4}
          placeholder="Add live-ops note, seasonal risk, or timing adjustment"
          style={{ resize: 'vertical' }}
        />
      </label>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={submitState === 'saving'}>
          {submitState === 'saving' ? 'Saving...' : 'Save Season Control'}
        </button>
        <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
        </span>
      </div>

      {message ? <p style={{ color: submitState === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
    </form>
  );
}
