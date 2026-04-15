'use client';

import { FormEvent, useState } from 'react';

type PrototypeBoardState = {
  status: 'draft' | 'active' | 'blocked';
  owner: string;
  selectedScenario: string;
  updatedAt: string;
};

type PrototypeBoardNote = {
  id: string;
  text: string;
  createdAt: string;
  status: 'open' | 'done';
};

type ScenarioOption = {
  slug: string;
  title: string;
};

type Props = {
  initialState: PrototypeBoardState;
  initialNotes: PrototypeBoardNote[];
  scenarios: ScenarioOption[];
};

type SubmitState = 'idle' | 'saving' | 'success' | 'error';

export function PrototypeBoardConsole({ initialState, initialNotes, scenarios }: Props) {
  const [statusValue, setStatusValue] = useState(initialState.status);
  const [owner, setOwner] = useState(initialState.owner);
  const [selectedScenario, setSelectedScenario] = useState(initialState.selectedScenario);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(initialNotes);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState(initialState.updatedAt);
  const [busyNoteId, setBusyNoteId] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState('saving');
    setMessage('');

    try {
      const response = await fetch('/api/prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusValue,
          owner,
          selectedScenario,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to update prototype board');

      setSubmitState('success');
      setMessage('Prototype board saved and notes updated live.');
      setUpdatedAt(data.state?.updatedAt ?? new Date().toISOString());
      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setNote('');
    } catch {
      setSubmitState('error');
      setMessage('Could not save the prototype board just now. Try again.');
    }
  }

  async function updateNote(noteId: string, nextStatus?: PrototypeBoardNote['status'], remove?: boolean) {
    setBusyNoteId(noteId);
    setMessage('');

    try {
      const response = await fetch('/api/prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          noteStatus: nextStatus,
          deleteNote: remove || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to update note');

      setSubmitState('success');
      setMessage(remove ? 'Prototype note deleted.' : 'Prototype note updated.');
      setUpdatedAt(data.state?.updatedAt ?? new Date().toISOString());
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch {
      setSubmitState('error');
      setMessage('Could not update that note right now. Try again.');
    } finally {
      setBusyNoteId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
        <div className="grid">
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Board status</span>
            <select value={statusValue} onChange={(event) => setStatusValue(event.target.value as PrototypeBoardState['status'])} className="fieldInput">
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
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Selected scenario</span>
            <select value={selectedScenario} onChange={(event) => setSelectedScenario(event.target.value)} className="fieldInput">
              {scenarios.map((scenario) => (
                <option key={scenario.slug} value={scenario.slug}>{scenario.title}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Prototype note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="fieldInput"
            rows={4}
            placeholder="Add build blocker, test note, or scenario handoff"
            style={{ resize: 'vertical' }}
          />
        </label>

        <div className="ctaRow" style={{ marginTop: 0 }}>
          <button className="button buttonPrimary" type="submit" disabled={submitState === 'saving'}>
            {submitState === 'saving' ? 'Saving...' : 'Save Prototype Board'}
          </button>
          <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
            Last updated: {updatedAt ? new Date(updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
          </span>
        </div>

        {message ? <p style={{ color: submitState === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        <div className="eyebrow">Live note queue</div>
        {notes.length ? notes.map((entry) => (
          <article className="card" key={entry.id} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div className="eyebrow">{entry.status}</div>
                <h3 style={{ marginBottom: 6 }}>{new Date(entry.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              </div>
              <div className="ctaRow" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="button buttonSecondary"
                  disabled={busyNoteId === entry.id}
                  onClick={() => updateNote(entry.id, entry.status === 'open' ? 'done' : 'open')}
                >
                  {busyNoteId === entry.id ? 'Saving...' : entry.status === 'open' ? 'Mark done' : 'Reopen'}
                </button>
                <button
                  type="button"
                  className="button buttonSecondary"
                  disabled={busyNoteId === entry.id}
                  onClick={() => updateNote(entry.id, undefined, true)}
                  style={{ borderColor: 'rgba(185, 28, 28, 0.5)', color: '#fca5a5' }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p style={{ margin: 0 }}>{entry.text}</p>
          </article>
        )) : (
          <article className="card">
            <h3>No prototype notes saved yet</h3>
            <p>Use the form above to capture blockers, test decisions, and scenario handoffs without leaving the page.</p>
          </article>
        )}
      </div>
    </div>
  );
}
