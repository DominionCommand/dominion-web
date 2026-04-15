'use client';

import { FormEvent, useState } from 'react';

type ControlTowerState = {
  status: 'monitoring' | 'executing' | 'blocked';
  owner: string;
  focusLane: 'Growth' | 'Launch' | 'War Room';
  updatedAt: string;
};

type QueueItem = {
  slug: string;
  lane: 'Growth' | 'Launch' | 'War Room';
  title: string;
  status: 'todo' | 'active' | 'blocked' | 'done';
  owner: string;
  detail: string;
  surface: string;
  operatorNote?: string;
};

type Props = {
  initialState: ControlTowerState;
  queue: QueueItem[];
};

export function ControlTowerConsole({ initialState, queue }: Props) {
  const [towerState, setTowerState] = useState(initialState);
  const [items, setItems] = useState(queue);
  const [towerNote, setTowerNote] = useState('');
  const [savingTower, setSavingTower] = useState(false);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSaveTower(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTower(true);
    setMessage('');

    try {
      const response = await fetch('/api/control-tower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: towerState.status,
          owner: towerState.owner,
          focusLane: towerState.focusLane,
          note: towerNote.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setTowerState((current) => ({
        ...current,
        updatedAt: data.state?.updatedAt ?? new Date().toISOString(),
      }));
      setTowerNote('');
      setMessage('Control tower saved. Refresh to see latest note ordering.');
    } catch {
      setMessage('Could not save control tower just now.');
    } finally {
      setSavingTower(false);
    }
  }

  async function onSaveItem(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingItem(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'todo') as QueueItem['status'];
    const owner = String(form.get('owner') || '');
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/control-tower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemSlug: slug,
          itemStatus: status,
          itemOwner: owner,
          itemNote: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setItems((current) => current.map((item) => (
        item.slug === slug
          ? { ...item, status, owner, operatorNote: note }
          : item
      )));
      setMessage(`Saved ${slug} in the control tower.`);
    } catch {
      setMessage(`Could not save ${slug} just now.`);
    } finally {
      setSavingItem(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {message ? <p style={{ color: message.startsWith('Saved') || message.startsWith('Control tower saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}

      <form onSubmit={onSaveTower} className="card" style={{ display: 'grid', gap: 16 }}>
        <div>
          <div className="eyebrow">Tower state</div>
          <h3>Persist the command view</h3>
        </div>

        <div className="grid">
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
            <select
              value={towerState.status}
              onChange={(event) => setTowerState((current) => ({ ...current, status: event.target.value as ControlTowerState['status'] }))}
              className="fieldInput"
            >
              <option value="monitoring">Monitoring</option>
              <option value="executing">Executing</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input
              value={towerState.owner}
              onChange={(event) => setTowerState((current) => ({ ...current, owner: event.target.value }))}
              className="fieldInput"
            />
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Focus lane</span>
            <select
              value={towerState.focusLane}
              onChange={(event) => setTowerState((current) => ({ ...current, focusLane: event.target.value as ControlTowerState['focusLane'] }))}
              className="fieldInput"
            >
              <option value="Growth">Growth</option>
              <option value="Launch">Launch</option>
              <option value="War Room">War Room</option>
            </select>
          </label>
        </div>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
          <textarea
            value={towerNote}
            onChange={(event) => setTowerNote(event.target.value)}
            className="fieldInput"
            rows={4}
            placeholder="Add command note, blocker, or cross-functional handoff"
            style={{ resize: 'vertical' }}
          />
        </label>

        <div className="ctaRow" style={{ marginTop: 0 }}>
          <button className="button buttonPrimary" type="submit" disabled={savingTower}>
            {savingTower ? 'Saving...' : 'Save Control Tower'}
          </button>
          <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
            Last updated: {towerState.updatedAt ? new Date(towerState.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
          </span>
        </div>
      </form>

      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item) => (
          <form key={item.slug} onSubmit={(event) => onSaveItem(event, item.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
            <div>
              <div className="eyebrow">{item.lane} · {item.surface}</div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>

            <div className="grid">
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
                <select name="status" defaultValue={item.status} className="fieldInput">
                  <option value="todo">Todo</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
                <input name="owner" defaultValue={item.owner} className="fieldInput" />
              </label>
            </div>

            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
              <textarea
                name="note"
                defaultValue={item.operatorNote || ''}
                className="fieldInput"
                rows={3}
                placeholder="Add execution note, blocker, or handoff"
                style={{ resize: 'vertical' }}
              />
            </label>

            <div className="ctaRow" style={{ marginTop: 0 }}>
              <button className="button buttonPrimary" type="submit" disabled={savingItem === item.slug}>
                {savingItem === item.slug ? 'Saving...' : 'Save Queue Item'}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
