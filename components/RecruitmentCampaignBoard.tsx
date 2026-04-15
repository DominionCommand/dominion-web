'use client';

import { FormEvent, useState } from 'react';

type CampaignStatus = 'todo' | 'active' | 'blocked' | 'done';

type Campaign = {
  slug: string;
  title: string;
  priority: 'now' | 'next' | 'watch';
  audience: string;
  cta: string;
  supportSurface: string;
  whyNow: string;
  operatorStatus: CampaignStatus;
  operatorOwner: string;
  operatorNote: string;
  operatorUpdatedAt: string | null;
};

type Props = {
  initialCampaigns: Campaign[];
};

export function RecruitmentCampaignBoard({ initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    setSavingSlug(slug);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'todo') as CampaignStatus;
    const owner = String(form.get('owner') || '');
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status, owner, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      const updatedCampaign = data.campaigns.find((campaign: Campaign) => campaign.slug === slug);
      if (updatedCampaign) {
        setCampaigns((current) => current.map((campaign) => (campaign.slug === slug ? updatedCampaign : campaign)));
      }

      setMessage('Recruitment board saved.');
    } catch {
      setMessage('Could not save recruitment board update.');
    } finally {
      setSavingSlug(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Recruitment board saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {campaigns.map((campaign) => (
        <form key={campaign.slug} onSubmit={(event) => onSubmit(event, campaign.slug)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{campaign.priority} priority</div>
            <h3>{campaign.title}</h3>
            <p><strong>Audience:</strong> {campaign.audience}</p>
            <p><strong>CTA:</strong> {campaign.cta}</p>
            <p><strong>Surface:</strong> {campaign.supportSurface}</p>
            <p><strong>Why now:</strong> {campaign.whyNow}</p>
          </div>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Execution status</span>
              <select name="status" defaultValue={campaign.operatorStatus} className="fieldInput">
                <option value="todo">To do</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
              <input name="owner" defaultValue={campaign.operatorOwner} className="fieldInput" placeholder="Growth, web, UA, founder" />
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={campaign.operatorNote}
              className="fieldInput"
              rows={3}
              placeholder="What changed, blocker, or next move"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingSlug === campaign.slug}>
              {savingSlug === campaign.slug ? 'Saving...' : 'Save Campaign'}
            </button>
            <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
              {campaign.operatorUpdatedAt
                ? `Last updated ${new Date(campaign.operatorUpdatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                : 'No operator update saved yet'}
            </span>
          </div>
        </form>
      ))}
    </div>
  );
}
