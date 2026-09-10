'use client';

import React, { useEffect, useState } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-gray-900 text-white rounded-xl shadow-lg p-4 flex flex-col gap-3">
        <p className="text-xs leading-5 text-gray-300">
          This dashboard uses cookies and local storage for authentication and analytics. By continuing, you agree to our use of cookies.
        </p>
        <button
          onClick={accept}
          className="self-end px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
