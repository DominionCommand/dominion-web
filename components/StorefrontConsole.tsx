'use client';

import { FormEvent, useState } from 'react';

type StorefrontState = {
  status: 'draft' | 'active' | 'watch';
  owner: string;
  featuredOfferSlug: string;
  updatedAt: string;
};

type Offer = {
  slug: string;
  name: string;
};

type Props = {
  initialState: StorefrontState;
  offers: Offer[];
};

export function StorefrontConsole({ initialState, offers }: Props) {
  const [statusValue, setStatusValue] = useState(initialState.status);
  const [owner, setOwner] = useState(initialState.owner);
  const [featuredOfferSlug, setFeaturedOfferSlug] = useState(initialState.featuredOfferSlug);
  const [note, setNote] = useState('');
  const [updatedAt, setUpdatedAt] = useState(initialState.updatedAt);
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState('saving');
    setMessage('');

    try {
      const response = await fetch('/api/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusValue,
          owner,
          featuredOfferSlug,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to update storefront');

      setSubmitState('success');
      setMessage('Storefront state saved. Refresh the page to see the latest note ordering.');
      setUpdatedAt(data.state?.updatedAt ?? new Date().toISOString());
      setNote('');
    } catch {
      setSubmitState('error');
      setMessage('Could not save the storefront right now. Try again.');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Storefront status</span>
          <select value={statusValue} onChange={(event) => setStatusValue(event.target.value as StorefrontState['status'])} className="fieldInput">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="watch">Watch</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Owner</span>
          <input value={owner} onChange={(event) => setOwner(event.target.value)} className="fieldInput" />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Featured offer</span>
          <select value={featuredOfferSlug} onChange={(event) => setFeaturedOfferSlug(event.target.value)} className="fieldInput">
            {offers.map((offer) => (
              <option key={offer.slug} value={offer.slug}>{offer.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Store note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="fieldInput"
          rows={4}
          placeholder="Add conversion hypothesis, segment note, or live-op constraint"
          style={{ resize: 'vertical' }}
        />
      </label>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={submitState === 'saving'}>
          {submitState === 'saving' ? 'Saving...' : 'Save Storefront'}
        </button>
        <span style={{ color: '#9ca3af', alignSelf: 'center' }}>
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not saved yet'}
        </span>
      </div>

      {message ? <p style={{ color: submitState === 'success' ? '#d4a017' : '#fca5a5' }}>{message}</p> : null}
    </form>
  );
}
