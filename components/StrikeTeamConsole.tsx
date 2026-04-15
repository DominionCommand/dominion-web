'use client';

import { FormEvent, useState } from 'react';

import type { StrikeTeamSlotStatus } from '../lib/strike-team';

type Slot = {
  slot: string;
  email?: string;
  commanderSlug: string;
  commanderName: string;
  factionName: string;
  roleFocus: string;
  status: StrikeTeamSlotStatus;
  owner: string;
  note?: string;
  assignedLead: {
    email: string;
    score: number;
    invitePriority: string;
    factionLabel: string;
    platformLabel: string;
    playStyleLabel: string;
    role: string;
  } | null;
};

type Candidate = {
  email: string;
  score: number;
  invitePriority: string;
  factionLabel: string;
  platformLabel: string;
  playStyleLabel: string;
  role: string;
  reasons: string[];
};

type Props = {
  initialSlots: Slot[];
  candidates: Candidate[];
};

export function StrikeTeamConsole({ initialSlots, candidates }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>, slot: string) {
    event.preventDefault();
    setSavingSlot(slot);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const status = String(form.get('status') || 'candidate');
    const owner = String(form.get('owner') || 'Unassigned');
    const note = String(form.get('note') || '');

    try {
      const response = await fetch('/api/strike-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, email: email || undefined, status, owner, note }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setSlots(data.slots);
      setMessage(`Saved strike-team slot ${slot}.`);
    } catch {
      setMessage(`Could not save strike-team slot ${slot}.`);
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message ? <p style={{ color: message.startsWith('Saved') ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
      {slots.map((slot) => (
        <form key={slot.slot} onSubmit={(event) => onSubmit(event, slot.slot)} className="card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="eyebrow">{slot.factionName} · {slot.commanderName}</div>
            <h3>{slot.slot}</h3>
            <p>{slot.roleFocus}</p>
            <p>
              {slot.assignedLead
                ? `${slot.assignedLead.email} · ${slot.assignedLead.score} score · ${slot.assignedLead.platformLabel}`
                : 'No tester assigned yet.'}
            </p>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Assigned tester</span>
            <select name="email" defaultValue={slot.email || ''} className="fieldInput">
              <option value="">No assignment</option>
              {candidates.map((candidate) => (
                <option key={candidate.email} value={candidate.email}>
                  {candidate.email} · {candidate.score} · {candidate.role}
                </option>
              ))}
              {slot.assignedLead && !candidates.some((candidate) => candidate.email === slot.assignedLead?.email) ? (
                <option value={slot.assignedLead.email}>{slot.assignedLead.email} · {slot.assignedLead.score} · current</option>
              ) : null}
            </select>
          </label>

          <div className="grid">
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Status</span>
              <select name="status" defaultValue={slot.status} className="fieldInput">
                <option value="candidate">Candidate</option>
                <option value="assigned">Assigned</option>
                <option value="confirmed">Confirmed</option>
                <option value="hold">Hold</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
              <input name="owner" defaultValue={slot.owner} className="fieldInput" placeholder="Operator owner" />
            </label>
          </div>

          <label>
            <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Operator note</span>
            <textarea
              name="note"
              defaultValue={slot.note || ''}
              className="fieldInput"
              rows={3}
              placeholder="Why this tester fits, what to validate, or what is blocking confirmation"
              style={{ resize: 'vertical' }}
            />
          </label>

          <div className="ctaRow" style={{ marginTop: 0 }}>
            <button className="button buttonPrimary" type="submit" disabled={savingSlot === slot.slot}>
              {savingSlot === slot.slot ? 'Saving...' : 'Save Slot'}
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
