'use client';

import { FormEvent, useState } from 'react';

import type { CampaignExecutionChannel, CampaignExecutionStatus } from '../lib/campaign-ops';

type CampaignRow = {
  slug: string;
  name: string;
  status: CampaignExecutionStatus;
  owner: string;
  channel: CampaignExecutionChannel;
  note: string;
  cadence: string;
  window: string;
  zoneLabel: string;
  commanderLabel: string;
};

type Props = {
  initialCampaigns: CampaignRow[];
};

export function CampaignBoardConsole({ initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingSlug(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'planned') as CampaignExecutionStatus;
    const owner = String(form.get('owner') || 'Unassigned');
    const channel = String(form.get('channel') || 'liveops') as CampaignExecutionChannel;
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status, owner, channel, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setCampaigns((current) => current.map((campaign) => (
        campaign.slug === slug
          ? { ...campaign, status, owner, channel, note }
          : campaign
      )));
      setMessage(`Saved campaign update for ${slug}.`);
    } catch {
      setMessage(`Could not save campaign update for ${slug}.`);
    } finally {
      setSavingSlug(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {campaigns.map((campaign) => (
        <form key={campaign.slug} onSubmit={(event) => onSubmit(event, campaign.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{campaign.zoneLabel} · {campaign.commanderLabel}</div>
            <h3>{campaign.name}</h3>
            <p>{campaign.cadence} · {campaign.window}</p>
          </div>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Execution status</span>
              <select name="status" defaultValue={campaign.status} className="fieldInput">
                <option value="planned">Planned</option>
                <option value="ready">Ready</option>
                <option value="live">Live</option>
                <option value="blocked">Blocked</option>
                <option value="complete">Complete</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Primary channel</span>
              <select name="channel" defaultValue={campaign.channel} className="fieldInput">
                <option value="liveops">Live Ops</option>
                <option value="community">Community</option>
                <option value="paid">Paid</option>
                <option value="crm">CRM</option>
                <option value="qa">QA</option>
              </select>
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input name="owner" defaultValue={campaign.owner} className="fieldInput" placeholder="Operator owner" />
          </label>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Execution note</span>
            <textarea
              name="note"
              defaultValue={campaign.note}
              className="fieldInput"
              rows={3}
              placeholder="Add launch blocker, asset dependency, or frontline note"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingSlug === campaign.slug}>
              {savingSlug === campaign.slug ? 'Saving...' : 'Save Campaign'}
            </button>
            <a className="button buttonSecondary" href={`/events/${campaign.slug}`}>Open event brief</a>
          </div>
        </form>
      ))}
    </div>
  );
}
