'use client';

import { FormEvent, useState } from 'react';

import { buildLeadHref } from '../lib/lead-routes';

type ContactQueueEntry = {
  requestId: string;
  ts: string;
  email: string;
  name?: string;
  topic: 'founder-access' | 'partnership' | 'press' | 'support';
  message: string;
  status: 'new' | 'triaged' | 'in-progress' | 'waiting' | 'closed';
  priority: 'critical' | 'high' | 'normal';
  owner: string;
  note: string;
  updatedAt: string;
};

type Props = {
  initialQueue: ContactQueueEntry[];
};

const topicLabels: Record<ContactQueueEntry['topic'], string> = {
  'founder-access': 'Founder access',
  partnership: 'Partnership',
  press: 'Press',
  support: 'Support',
};

export function ContactQueueConsole({ initialQueue }: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [savingRequestId, setSavingRequestId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, requestId: string) {
    event.preventDefault();
    setSavingRequestId(requestId);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'new');
    const priority = String(form.get('priority') || 'normal');
    const owner = String(form.get('owner') || '');
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, priority, owner, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setQueue(data.queue.queue);
      setMessage('Saved contact queue update.');
    } catch {
      setMessage('Could not save contact queue update.');
    } finally {
      setSavingRequestId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {queue.map((entry) => (
        <form key={entry.requestId} onSubmit={(event) => onSubmit(event, entry.requestId)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{topicLabels[entry.topic]} · {entry.priority}</div>
            <h3>{entry.name || entry.email}</h3>
            <p>{entry.email}</p>
            <p>{entry.message}</p>
          </div>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
              <select name="status" defaultValue={entry.status} className="fieldInput">
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="in-progress">In progress</option>
                <option value="waiting">Waiting</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Priority</span>
              <select name="priority" defaultValue={entry.priority} className="fieldInput">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input name="owner" defaultValue={entry.owner} className="fieldInput" placeholder="Assign operator or team" />
          </label>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={entry.note}
              className="fieldInput"
              rows={3}
              placeholder="Add next step, blocker, or reply context"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingRequestId === entry.requestId}>
              {savingRequestId === entry.requestId ? 'Saving...' : 'Save Queue State'}
            </button>
            <a className="button buttonSecondary" href={buildLeadHref(entry.email)}>Open intake dossier</a>
          </div>
        </form>
      ))}
    </div>
  );
}
