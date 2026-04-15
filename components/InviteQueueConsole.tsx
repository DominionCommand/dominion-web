'use client';

import { FormEvent, useState } from 'react';

import { buildLeadHref } from '../lib/lead-routes';
import { waveLabels } from '../lib/waves';

type InviteDecisionStatus = 'selected' | 'queued' | 'sent' | 'hold';

type QueueLead = {
  email: string;
  score: number;
  wave: keyof typeof waveLabels;
  decisionStatus: InviteDecisionStatus;
  decisionWave: keyof typeof waveLabels;
  decisionNote: string;
  factionLabel: string;
  platformLabel: string;
  playStyleLabel: string;
};

type Props = {
  initialQueue: QueueLead[];
};

export function InviteQueueConsole({ initialQueue }: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, email: string) {
    event.preventDefault();
    setSavingEmail(email);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || 'queued') as InviteDecisionStatus;
    const wave = String(form.get('wave') || 'wave-3-broader-market') as keyof typeof waveLabels;
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/invite-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status, wave, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setQueue((current) => current.map((lead) => (
        lead.email === email
          ? {
              ...lead,
              decisionStatus: status,
              decisionWave: wave,
              decisionNote: note,
            }
          : lead
      )));
      setMessage(`Saved invite decision for ${email}.`);
    } catch {
      setMessage(`Could not save invite decision for ${email}.`);
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
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Decision</span>
              <select name="status" defaultValue={lead.decisionStatus} className="fieldInput">
                <option value="selected">Selected</option>
                <option value="queued">Queued</option>
                <option value="sent">Invite sent</option>
                <option value="hold">Hold</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Wave</span>
              <select name="wave" defaultValue={lead.decisionWave} className="fieldInput">
                {Object.entries(waveLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={lead.decisionNote}
              className="fieldInput"
              rows={3}
              placeholder="Add blocker, follow-up plan, or invite context"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingEmail === lead.email}>
              {savingEmail === lead.email ? 'Saving...' : 'Save Decision'}
            </button>
            <a className="button buttonSecondary" href={buildLeadHref(lead.email)}>Open intake dossier</a>
          </div>
        </form>
      ))}
    </div>
  );
}
