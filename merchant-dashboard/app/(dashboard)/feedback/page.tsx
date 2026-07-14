'use client';

import React, { useState } from 'react';

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd_placeholder_replace_with_real_form/viewform';

const ratingOptions = [1, 2, 3, 4, 5];

const categoryOptions = [
  'General feedback',
  'Bug report',
  'Feature request',
  'Performance issue',
  'Documentation',
  'Other',
];

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this would POST to an API endpoint or a form service.
    // For now, we log the submission and mark as submitted.
    console.log('Feedback submitted:', { rating, category, message });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mt-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your input helps us improve the Global Remittance Bridge for merchants worldwide.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setRating(null);
              setMessage('');
              setCategory(categoryOptions[0]);
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
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Share Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">
          Help us improve. Your feedback directly shapes the product.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall experience <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
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
                <span className="ml-2 self-center text-sm text-gray-500">
                  {['', 'Very bad', 'Poor', 'OK', 'Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Feedback type
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="Tell us what's working well, what's broken, or what you'd like to see..."
            />
          </div>

          <button
            type="submit"
            disabled={!rating || !message.trim()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Submit feedback
          </button>
        </form>
      </div>

      {/* External form link */}
      <div className="bg-gray-50 border rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Prefer an external form?</p>
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Fill out our Google Form ↗
        </a>
      </div>
    </div>
  );
}
