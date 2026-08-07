'use client';

import React, { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { captureEvent } from '@/components/posthog-provider';

const FEEDBACK_FORM_URL = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL?.trim();
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ratingOptions = [1, 2, 3, 4, 5];

const ratingLabels: Record<number, string> = {
  1: 'Very bad',
  2: 'Poor',
  3: 'OK',
  4: 'Good',
  5: 'Excellent',
};

const networkOptions = ['Testnet', 'Mainnet'];

const FEEDBACK_STORAGE_KEY = 'grb_feedback_responses';

interface FeedbackPayload {
  name: string;
  email: string;
  walletAddress: string;
  network: string;
  rating: number;
  likedMost: string;
  missingFeature: string;
  issues: string;
  recommend: string;
  improvements: string;
  submittedAt: string;
}

function readStoredResponses(): FeedbackPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FeedbackPayload[]) : [];
  } catch {
    return [];
  }
}

function storeResponse(payload: FeedbackPayload) {
  if (typeof window === 'undefined') return;
  const responses = readStoredResponses();
  responses.push(payload);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(responses));
}

function seedPrefill() {
  if (typeof window === 'undefined') {
    return { name: '', email: '', walletAddress: '' };
  }
  const merchant = localStorage.getItem('merchant');
  if (!merchant) return { name: '', email: '', walletAddress: '' };
  try {
    const m = JSON.parse(merchant);
    return {
      name: m.name || m.email || '',
      email: m.email || '',
      walletAddress: m.walletAddress || '',
    };
  } catch {
    return { name: '', email: '', walletAddress: '' };
  }
}

export default function FeedbackPage() {
  const prefill = seedPrefill();
  const [form, setForm] = useState({
    name: prefill.name,
    email: prefill.email,
    walletAddress: prefill.walletAddress,
    network: networkOptions[0],
  });
  const [rating, setRating] = useState<number | null>(null);
  const [likedMost, setLikedMost] = useState('');
  const [missingFeature, setMissingFeature] = useState('');
  const [issues, setIssues] = useState('');
  const [recommend, setRecommend] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function resetForm() {
    const p = seedPrefill();
    setForm({ name: p.name, email: p.email, walletAddress: p.walletAddress, network: networkOptions[0] });
    setRating(null);
    setLikedMost('');
    setMissingFeature('');
    setIssues('');
    setRecommend('');
    setImprovements('');
    setSubmitError(null);
    setSubmitting(false);
  }

  async function persistToApi(payload: FeedbackPayload) {
    if (!API_URL) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        walletAddress: payload.walletAddress,
        network: payload.network,
        rating: payload.rating,
        likedMost: payload.likedMost,
        missingFeature: payload.missingFeature,
        issues: payload.issues,
        recommend: payload.recommend,
        improvements: payload.improvements,
      }),
    });

    if (!response.ok) {
      // The feedback must still be captured locally even if the API is down.
      throw new Error(`Feedback API error: ${response.status}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: FeedbackPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      walletAddress: form.walletAddress.trim(),
      network: form.network,
      rating,
      likedMost: likedMost.trim(),
      missingFeature: missingFeature.trim(),
      issues: issues.trim(),
      recommend: recommend.trim(),
      improvements: improvements.trim(),
      submittedAt: new Date().toISOString(),
    };

    storeResponse(payload);

    try {
      await persistToApi(payload);
    } catch (err) {
      Sentry.captureException(err);
      setSubmitError(
        'We could not reach the server, but your feedback was saved locally. Please try again later if you would like us to record it remotely.'
      );
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      captureEvent('feedback_submitted', {
        rating: payload.rating,
        network: payload.network,
        recommend: payload.recommend,
      });
    }
  }

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mt-12 sm:mt-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your input helps us improve the Global Remittance Bridge for merchants worldwide.
          </p>
          {submitError && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              {submitError}
            </div>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              resetForm();
            }}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Share Feedback</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Help us improve. Your feedback directly shapes the product.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Jane Merchant"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address <span className="text-red-400">*</span>
              </label>
              <input
                id="walletAddress"
                name="walletAddress"
                type="text"
                required
                value={form.walletAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                placeholder="G..."
              />
            </div>
            <div>
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-2">
                Network <span className="text-red-400">*</span>
              </label>
              <select
                id="network"
                name="network"
                value={form.network}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                {networkOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall experience <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ratingOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-lg border text-lg transition-colors ${
                    rating !== null && n <= rating
                      ? 'bg-yellow-400 border-yellow-400 text-white'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                  aria-label={`Rate ${n} out of 5`}
                >
                  ★
                </button>
              ))}
              {rating && (
                <span className="ml-2 text-sm text-gray-500">{ratingLabels[rating]}</span>
              )}
            </div>
          </div>

          {/* Feedback questions */}
          <div>
            <label htmlFor="likedMost" className="block text-sm font-medium text-gray-700 mb-2">
              Which feature did you like the most? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="likedMost"
              name="likedMost"
              required
              rows={3}
              value={likedMost}
              onChange={(e) => setLikedMost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="e.g. The escrow flow, instant settlements, the analytics dashboard..."
            />
          </div>

          <div>
            <label htmlFor="missingFeature" className="block text-sm font-medium text-gray-700 mb-2">
              What feature do you think is missing? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="missingFeature"
              name="missingFeature"
              required
              rows={3}
              value={missingFeature}
              onChange={(e) => setMissingFeature(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="e.g. Multi-currency support, mobile wallet integration..."
            />
          </div>

          <div>
            <label htmlFor="issues" className="block text-sm font-medium text-gray-700 mb-2">
              Did you encounter any bugs or usability issues? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="issues"
              name="issues"
              required
              rows={3}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="Describe any bugs or friction you ran into (or 'None')"
            />
          </div>

          <div>
            <label htmlFor="recommend" className="block text-sm font-medium text-gray-700 mb-2">
              Would you recommend this product to others? <span className="text-red-400">*</span>
            </label>
            <select
              id="recommend"
              name="recommend"
              required
              value={recommend}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="">Select an option</option>
              <option value="Yes, definitely">Yes, definitely</option>
              <option value="Probably">Probably</option>
              <option value="Not sure">Not sure</option>
              <option value="Probably not">Probably not</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
              What improvements would you like to see? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="improvements"
              name="improvements"
              required
              rows={3}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="Any suggestions for the roadmap?"
            />
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={!rating || submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
      </div>

      {/* External form link */}
      <div className="bg-gray-50 border rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Prefer an external form?</p>
        {FEEDBACK_FORM_URL ? (
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Fill out our Google Form ↗
          </a>
        ) : (
          <p className="text-sm text-gray-500">
            Set NEXT_PUBLIC_FEEDBACK_FORM_URL in your deployment environment to enable the external form link.
          </p>
        )}
      </div>
    </div>
  );
}
