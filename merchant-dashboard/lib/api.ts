const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Makes an authenticated fetch to the API.
 * Redirects to /login if the token is missing or the server returns 401.
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token && typeof window !== 'undefined') {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('merchant');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  /** Get the authenticated merchant's profile */
  getMe: () => fetchWithAuth('/merchants/me'),

  /** Get dashboard stats (totalVolume, pendingSettlements, activeCustomers) */
  getStats: () => fetchWithAuth('/merchants/me/stats'),

  /** Get paginated transaction history */
  getTransactions: () => fetchWithAuth('/merchants/me/transactions'),

  /** Trigger a Stellar payment transfer */
  transfer: (amount: number, asset: string) =>
    fetchWithAuth('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ amount, asset }),
    }),

  /** Get a single transaction by ID */
  getTransaction: (id: string) => fetchWithAuth(`/payments/${id}`),
};

/**
 * Sign out the current user by clearing local storage.
 */
export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
    window.location.href = '/login';
  }
}

/**
 * Returns true if the user appears to be authenticated (token present in localStorage).
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
