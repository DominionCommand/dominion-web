'use client';

import { FormEvent, useState } from 'react';

type ReleaseRoomState = {
  decision: 'go' | 'hold' | 'blocked';
  owner: string;
  nextMilestone: string;
  updatedAt: string;
};

type Props = {
  initialState: ReleaseRoomState;
};

export function ReleaseRoomConsole({ initialState }: Props) {
  const [state, setState] = useState(initialState);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/release-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: state.decision,
          owner: state.owner,
          nextMilestone: state.nextMilestone,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setState((current) => ({
        ...current,
        updatedAt: data.state?.updatedAt ?? new Date().toISOString(),
      }));
      setNote('');
      setMessage('Release room saved. Refresh to pull the latest note order.');
    } catch {
      setMessage('Could not save the release room just now.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Release room saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}

      <div>
        <div className="eyebrow">Release command</div>
        <h3>Set the shipping posture</h3>
        <p>Persist the current go, hold, or blocked decision and pin the next milestone for the team.</p>
      </div>

      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Decision</span>
          <select
            value={state.decision}
            onChange={(event) => setState((current) => ({ ...current, decision: event.target.value as ReleaseRoomState['decision'] }))}
            className="fieldInput"
          >
            <option value="go">Go</option>
            <option value="hold">Hold</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
          <input
            value={state.owner}
            onChange={(event) => setState((current) => ({ ...current, owner: event.target.value }))}
            className="fieldInput"
          />
        </label>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Next milestone</span>
          <input
            value={state.nextMilestone}
            onChange={(event) => setState((current) => ({ ...current, nextMilestone: event.target.value }))}
            className="fieldInput"
          />
        </label>
      </div>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="fieldInput"
          rows={4}
          placeholder="Capture the current release call, next gate, or blocker context"
          style={{ resize: 'vertical' }}
        />
      </label>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Release Room'}
        </button>
        <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
          Last updated: {state.updatedAt ? new Date(state.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
        </span>
      </div>
    </form>
  );
}
