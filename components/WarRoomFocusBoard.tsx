'use client';

import { FormEvent, useState } from 'react';

type FocusStatus = 'todo' | 'active' | 'blocked' | 'done';

type FocusItem = {
  slug: string;
  title: string;
  urgency: 'now' | 'next' | 'watch';
  reason: string;
  action: string;
  owner: string;
  operatorStatus: FocusStatus;
  operatorOwner: string;
  operatorNote: string;
  operatorUpdatedAt: string | null;
};

type Props = {
  initialFocusQueue: FocusItem[];
};

export function WarRoomFocusBoard({ initialFocusQueue }: Props) {
  const [focusQueue, setFocusQueue] = useState(initialFocusQueue);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingSlug(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'todo') as FocusStatus;
    const owner = String(form.get('owner') || '');
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/war-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status, owner, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      const updatedItem = data.focusQueue.find((item: FocusItem) => item.slug === slug);
      if (updatedItem) {
        setFocusQueue((current) => current.map((item) => (item.slug === slug ? updatedItem : item)));
      }

      setMessage('War room board saved.');
    } catch {
      setMessage('Could not save war room update.');
    } finally {
      setSavingSlug(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('War room board saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {focusQueue.map((focus) => (
        <form key={focus.slug} onSubmit={(event) => onSubmit(event, focus.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{focus.urgency} priority</div>
            <h3>{focus.title}</h3>
            <p><strong>Reason:</strong> {focus.reason}</p>
            <p><strong>Action:</strong> {focus.action}</p>
            <p><strong>Suggested owner:</strong> {focus.owner}</p>
          </div>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Execution status</span>
              <select name="status" defaultValue={focus.operatorStatus} className="fieldInput">
                <option value="todo">To do</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator owner</span>
              <input name="owner" defaultValue={focus.operatorOwner} className="fieldInput" placeholder="Design, web, gameplay, growth" />
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={focus.operatorNote}
              className="fieldInput"
              rows={3}
              placeholder="Add blocker, dependency, or next step"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingSlug === focus.slug}>
              {savingSlug === focus.slug ? 'Saving...' : 'Save Focus Item'}
            </button>
            <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
              {focus.operatorUpdatedAt
                ? `Last updated ${new Date(focus.operatorUpdatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                : 'No operator update saved yet'}
            </span>
          </div>
        </form>
      ))}
    </div>
  );
}
