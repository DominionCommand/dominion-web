'use client';

import { FormEvent, useState } from 'react';

type AllianceHQState = {
  status: 'forming' | 'mobilizing' | 'war-ready';
  owner: string;
  priority: 'recruitment' | 'frontline' | 'logistics';
  updatedAt: string;
};

type Campaign = {
  slug: string;
  title: string;
  lane: string;
  status: 'planned' | 'active' | 'blocked' | 'done';
  owner: string;
  detail: string;
  target: string;
  surface: string;
  operatorNote?: string;
};

type Props = {
  initialState: AllianceHQState;
  campaigns: Campaign[];
};

export function AllianceHQConsole({ initialState, campaigns }: Props) {
  const [hqState, setHQState] = useState(initialState);
  const [savingHQ, setSavingHQ] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  async function onSaveHQ(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingHQ(true);
    setMessage('');

    try {
      const response = await fetch('/api/alliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: hqState.status,
          owner: hqState.owner,
          priority: hqState.priority,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setHQState((current) => ({
        ...current,
        updatedAt: data.state?.updatedAt ?? new Date().toISOString(),
      }));
      setNote('');
      setMessage('Alliance HQ saved. Refresh to see updated note ordering.');
    } catch {
      setMessage('Could not save Alliance HQ just now.');
    } finally {
      setSavingHQ(false);
    }
  }

  async function onSaveCampaign(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingCampaign(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'planned');
    const owner = String(form.get('owner') || '');
    const campaignNote = String(form.get('note') || '');

    try {
      const response = await fetch('/api/alliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignSlug: slug,
          campaignStatus: status,
          campaignOwner: owner,
          campaignNote: campaignNote.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setMessage(`Saved ${slug} in Alliance HQ.`);
    } catch {
      setMessage(`Could not save ${slug} just now.`);
    } finally {
      setSavingCampaign(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {message ? <p style={{ color: message.startsWith('Saved') || message.startsWith('Alliance HQ saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}

      <form onSubmit={onSaveHQ} className="card" style={{ display: 'grid', gap: 16 }}>
        <div>
          <div className="eyebrow">Alliance HQ</div>
          <h3>Persist alliance command state</h3>
        </div>

        <div className="grid">
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
            <select value={hqState.status} onChange={(event) => setHQState((current) => ({ ...current, status: event.target.value as AllianceHQState['status'] }))} className="fieldInput">
              <option value="forming">Forming</option>
              <option value="mobilizing">Mobilizing</option>
              <option value="war-ready">War ready</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input value={hqState.owner} onChange={(event) => setHQState((current) => ({ ...current, owner: event.target.value }))} className="fieldInput" />
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Priority lane</span>
            <select value={hqState.priority} onChange={(event) => setHQState((current) => ({ ...current, priority: event.target.value as AllianceHQState['priority'] }))} className="fieldInput">
              <option value="recruitment">Recruitment</option>
              <option value="frontline">Frontline</option>
              <option value="logistics">Logistics</option>
            </select>
          </label>
        </div>

        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Command note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} className="fieldInput" rows={4} placeholder="Add alliance focus, blocker, or handoff" style={{ resize: 'vertical' }} />
        </label>

        <div className="ctaRow" style={{ marginTop: 0 }}>
          <button className="button buttonPrimary" type="submit" disabled={savingHQ}>
            {savingHQ ? 'Saving...' : 'Save Alliance HQ'}
          </button>
          <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
            Last updated: {hqState.updatedAt ? new Date(hqState.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
          </span>
        </div>
      </form>

      <div style={{ display: 'grid', gap: 16 }}>
        {campaigns.map((campaign) => (
          <form key={campaign.slug} onSubmit={(event) => onSaveCampaign(event, campaign.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
            <div>
              <div className="eyebrow">{campaign.lane} · {campaign.surface}</div>
              <h3>{campaign.title}</h3>
              <p>{campaign.detail}</p>
              <p>{campaign.target}</p>
            </div>

            <div className="grid">
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
                <select name="status" defaultValue={campaign.status} className="fieldInput">
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
                <input name="owner" defaultValue={campaign.owner} className="fieldInput" />
              </label>
            </div>

            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
              <textarea name="note" defaultValue={campaign.operatorNote || ''} className="fieldInput" rows={3} placeholder="Add execution note or blocker" style={{ resize: 'vertical' }} />
            </label>

            <div className="ctaRow" style={{ marginTop: 0 }}>
              <button className="button buttonPrimary" type="submit" disabled={savingCampaign === campaign.slug}>
                {savingCampaign === campaign.slug ? 'Saving...' : 'Save Campaign'}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
