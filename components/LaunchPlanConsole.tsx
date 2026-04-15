'use client';

import { FormEvent, useState } from 'react';

type LaunchPlanState = {
  status: 'draft' | 'active' | 'blocked';
  owner: string;
  targetWave: string;
  updatedAt: string;
};

type Props = {
  initialState: LaunchPlanState;
};

type SubmitState = 'idle' | 'saving' | 'success' | 'error';

export function LaunchPlanConsole({ initialState }: Props) {
  const [statusValue, setStatusValue] = useState(initialState.status);
  const [owner, setOwner] = useState(initialState.owner);
  const [targetWave, setTargetWave] = useState(initialState.targetWave);
  const [note, setNote] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState(initialState.updatedAt);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState('saving');
    setMessage('');

    try {
      const response = await fetch('/api/launch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusValue,
          owner,
          targetWave,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to update launch plan');

      setSubmitState('success');
      setMessage('Launch plan saved. Refresh the page to see the latest note ordering.');
      setUpdatedAt(data.state?.updatedAt ?? new Date().toISOString());
      setNote('');
    } catch {
      setSubmitState('error');
      setMessage('Could not save the launch plan just now. Try again.');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Plan status</span>
          <select value={statusValue} onChange={(event) => setStatusValue(event.target.value as LaunchPlanState['status'])} className="fieldInput">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
          <input value={owner} onChange={(event) => setOwner(event.target.value)} className="fieldInput" />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Target wave</span>
          <input value={targetWave} onChange={(event) => setTargetWave(event.target.value)} className="fieldInput" />
        </label>
      </div>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="fieldInput"
          rows={4}
          placeholder="Add launch risk, next step, or handoff note"
          style={{ resize: 'vertical' }}
        />
      </label>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={submitState === 'saving'}>
          {submitState === 'saving' ? 'Saving...' : 'Save Launch Plan'}
        </button>
        <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
        </span>
      </div>

      {message ? <p style={{ color: submitState === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
    </form>
  );
}
