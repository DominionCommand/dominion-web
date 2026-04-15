'use client';

import { FormEvent, useState } from 'react';

type SubmitState = 'idle' | 'saving' | 'success' | 'error';

const topics = [
  { value: 'founder-access', label: 'Founder access' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'press', label: 'Press' },
  { value: 'support', label: 'Support' },
];

export function ContactIntakeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topics[0].value);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [feedback, setFeedback] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setFeedback('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed');

      setStatus('success');
      setFeedback(data.duplicate ? 'That request is already in the queue.' : 'Request received. The queue is now live.');
      setName('');
      setEmail('');
      setMessage('');
      setTopic(topics[0].value);
    } catch {
      setStatus('error');
      setFeedback('That did not send cleanly. Try again in a minute.');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <div className="grid">
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="fieldInput" />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="fieldInput" />
        </label>
      </div>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Topic</span>
        <select value={topic} onChange={(event) => setTopic(event.target.value)} className="fieldInput">
          {topics.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label>
        <span style={{ display: 'block', marginBottom: 8, color: '#d1d5db' }}>Message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what you need, what kind of access you want, or what you want to cover."
          required
          minLength={10}
          rows={6}
          className="fieldInput"
          style={{ resize: 'vertical' }}
        />
      </label>

      <div className="ctaRow" style={{ marginTop: 0 }}>
        <button className="button buttonPrimary" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {feedback ? <p style={{ color: status === 'success' ? '#d4a017' : '#fca5a5' }}>{feedback}</p> : null}
    </form>
  );
}
