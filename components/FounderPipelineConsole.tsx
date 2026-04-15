'use client';

import { FormEvent, useState } from 'react';

import type { FounderPipelineChannel, FounderPipelineStage } from '../lib/founder-pipeline';
import { buildLeadHref } from '../lib/lead-routes';

type PipelineLead = {
  email: string;
  score: number;
  stage: FounderPipelineStage;
  owner: string;
  channel: FounderPipelineChannel;
  note: string;
  factionLabel: string;
  platformLabel: string;
  playStyleLabel: string;
};

type Props = {
  initialQueue: PipelineLead[];
};

export function FounderPipelineConsole({ initialQueue }: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, email: string) {
    event.preventDefault();
    setSavingEmail(email);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const stage = String(form.get('stage') || 'new') as FounderPipelineStage;
    const owner = String(form.get('owner') || 'Unassigned');
    const channel = String(form.get('channel') || 'email') as FounderPipelineChannel;
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/founder-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, stage, owner, channel, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setQueue((current) => current.map((lead) => (
        lead.email === email
          ? { ...lead, stage, owner, channel, note }
          : lead
      )));
      setMessage(`Saved founder pipeline update for ${email}.`);
    } catch {
      setMessage(`Could not save founder pipeline update for ${email}.`);
    } finally {
      setSavingEmail(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {queue.map((lead) => (
        <form key={lead.email} onSubmit={(event) => onSubmit(event, lead.email)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{lead.factionLabel} · {lead.platformLabel}</div>
            <h3>{lead.email}</h3>
            <p>{lead.playStyleLabel} · score {lead.score}</p>
          </div>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Stage</span>
              <select name="stage" defaultValue={lead.stage} className="fieldInput">
                <option value="new">New</option>
                <option value="contacting">Contacting</option>
                <option value="qualified">Qualified</option>
                <option value="invited">Invited</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Channel</span>
              <select name="channel" defaultValue={lead.channel} className="fieldInput">
                <option value="email">Email</option>
                <option value="discord">Discord</option>
                <option value="testflight">TestFlight</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
            <input name="owner" defaultValue={lead.owner} className="fieldInput" placeholder="Operator owner" />
          </label>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={lead.note}
              className="fieldInput"
              rows={3}
              placeholder="Add outreach plan, blocker, or handoff context"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingEmail === lead.email}>
              {savingEmail === lead.email ? 'Saving...' : 'Save Pipeline'}
            </button>
            <a className="button buttonSecondary" href={buildLeadHref(lead.email)}>Open intake dossier</a>
          </div>
        </form>
      ))}
    </div>
  );
}
