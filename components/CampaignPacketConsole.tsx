'use client';

import { FormEvent, useState } from 'react';

import type { CampaignChecklistItem, CampaignChecklistStatus } from '../lib/campaign-packets';

type Props = {
  slug: string;
  name: string;
  initialChecklist: CampaignChecklistItem[];
};

export function CampaignPacketConsole({ slug, name, initialChecklist }: Props) {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const nextChecklist = checklist.map((item) => ({
      ...item,
      status: String(form.get(`${item.key}:status`) || item.status) as CampaignChecklistStatus,
      owner: String(form.get(`${item.key}:owner`) || item.owner || 'Unassigned'),
      note: String(form.get(`${item.key}:note`) || item.note || ''),
    }));

    try {
      const response = await fetch(`/api/campaigns/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: nextChecklist }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setChecklist(nextChecklist);
      setMessage(`Saved checklist for ${name}.`);
    } catch {
      setMessage(`Could not save checklist for ${name}.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {checklist.map((item) => (
        <article className="card" key={item.key} style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{item.team}</div>
            <h3>{item.label}</h3>
          </div>
          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
              <select name={`${item.key}:status`} defaultValue={item.status} className="fieldInput">
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
              <input name={`${item.key}:owner`} defaultValue={item.owner} className="fieldInput" placeholder="Owner" />
            </label>
          </div>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Note</span>
            <textarea
              name={`${item.key}:note`}
              defaultValue={item.note}
              className="fieldInput"
              rows={3}
              placeholder="Dependency, blocker, or execution note"
              style={{ resize: 'vertical' }}
            />
          </label>
        </article>
      ))}
      <div className="ctaRow">
        <button className="button buttonPrimary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Checklist'}
        </button>
        <a className="button buttonSecondary" href="/campaigns">Back to campaigns</a>
      </div>
    </form>
  );
}
