'use client';

import { useState } from 'react';

export function ContactForm() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '', honeypot: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.honeypot) return; // Bot detected

    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', message: '', honeypot: '' });
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <input type="text" name="honeypot" value={form.honeypot} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="firstName" className="block font-semibold">First Name</label>
          <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label htmlFor="lastName" className="block font-semibold">Last Name</label>
          <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block font-semibold">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="message" className="block font-semibold">Message</label>
        <textarea id="message" name="message" value={form.message} onChange={handleChange} required className="w-full border rounded px-3 py-2" rows={5} />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Thank you! We'll be in touch soon.</div>}
      <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
} 