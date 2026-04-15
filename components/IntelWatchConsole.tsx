'use client';

import { FormEvent, useState } from 'react';

type IntelState = {
  owner: string;
  posture: 'stable' | 'watch' | 'escalated';
  updatedAt: string;
};

type WatchItem = {
  slug: string;
  title: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  status: 'monitoring' | 'action-needed' | 'resolved';
  owner: string;
  note?: string;
};

type Props = {
  initialState: IntelState;
  watchlist: WatchItem[];
};

export function IntelWatchConsole({ initialState, watchlist }: Props) {
  const [intelState, setIntelState] = useState(initialState);
  const [items, setItems] = useState(watchlist);
  const [note, setNote] = useState('');
  const [savingIntel, setSavingIntel] = useState(false);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSaveIntel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingIntel(true);
    setMessage('');

    try {
      const response = await fetch('/api/intel-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: intelState.owner,
          posture: intelState.posture,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setIntelState((current) => ({ ...current, updatedAt: data.state?.updatedAt ?? new Date().toISOString() }));
      setNote('');
      setMessage('Intel posture saved. Refresh to see latest note ordering.');
    } catch {
      setMessage('Could not save intel posture just now.');
    } finally {
      setSavingIntel(false);
    }
  }

  async function onSaveItem(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingItem(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'monitoring') as WatchItem['status'];
    const owner = String(form.get('owner') || '');
    const itemNote = String(form.get('note') || '');

    try {
      const response = await fetch('/api/intel-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemSlug: slug,
          itemStatus: status,
          itemOwner: owner,
          itemNote: itemNote.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setItems((current) => current.map((item) => item.slug === slug ? { ...item, status, owner, note: itemNote } : item));
      setMessage(`Saved ${slug} in intel watch.`);
    } catch {
      setMessage(`Could not save ${slug} just now.`);
    } finally {
      setSavingItem(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {message ? <p style={{ color: message.startsWith('Saved') || message.startsWith('Intel posture saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}

      <form onSubmit={onSaveIntel} className="card" style={{ display: 'grid', gap: 16 }}>
        <div>
          <div className="eyebrow">Intel posture</div>
          <h3>Persist the current watch state</h3>
        </div>

        <div className="grid">
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Posture</span>
            <select value={intelState.posture} onChange={(event) => setIntelState((current) => ({ ...current, posture: event.target.value as IntelState['posture'] }))} className="fieldInput">
              <option value="stable">Stable</option>
              <option value="watch">Watch</option>
              <option value="escalated">Escalated</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input value={intelState.owner} onChange={(event) => setIntelState((current) => ({ ...current, owner: event.target.value }))} className="fieldInput" />
          </label>
        </div>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} className="fieldInput" rows={4} placeholder="Add escalation note, risk summary, or handoff" style={{ resize: 'vertical' }} />
        </label>

        <div className="ctaRow" style={{ marginTop: 0 }}>
          <button className="button buttonPrimary" type="submit" disabled={savingIntel}>
            {savingIntel ? 'Saving...' : 'Save Intel Posture'}
          </button>
          <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
            Last updated: {intelState.updatedAt ? new Date(intelState.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
          </span>
        </div>
      </form>

      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item) => (
          <form key={item.slug} onSubmit={(event) => onSaveItem(event, item.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
            <div>
              <div className="eyebrow">{item.severity} severity</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>

            <div className="grid">
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
                <select name="status" defaultValue={item.status} className="fieldInput">
                  <option value="monitoring">Monitoring</option>
                  <option value="action-needed">Action needed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
                <input name="owner" defaultValue={item.owner} className="fieldInput" />
              </label>
            </div>

            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
              <textarea name="note" defaultValue={item.note || ''} className="fieldInput" rows={3} placeholder="What changed, why it matters, or who owns the next move" style={{ resize: 'vertical' }} />
            </label>

            <div className="ctaRow" style={{ marginTop: 0 }}>
              <button className="button buttonPrimary" type="submit" disabled={savingItem === item.slug}>
                {savingItem === item.slug ? 'Saving...' : 'Save Watch Item'}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
