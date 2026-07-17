const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

if (typeof window !== 'undefined' && !API_URL) {
  console.error('[API] NEXT_PUBLIC_API_URL is not configured. Set it in your Vercel environment variables.');
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

function setTokens(accessToken: string, refreshToken: string | null) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('merchant');
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || !API_URL) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  setTokens(data.access_token, data.refresh_token);

  if (data.merchant) {
    localStorage.setItem('merchant', JSON.stringify(data.merchant));
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  if (!API_URL) {
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL in your deployment environment.');
  }

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

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = getRefreshToken();
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .catch((err) => {
          clearTokens();
          window.location.href = '/login';
          throw err;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      await refreshPromise;

      const newToken = localStorage.getItem('token');
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    } else if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearTokens();
      window.location.href = '/login';
    }
    throw new Error(errorBody.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getMe: () => fetchWithAuth('/merchants/me'),
  getStats: () => fetchWithAuth('/merchants/me/stats'),
  getAnalytics: () => fetchWithAuth('/merchants/me/analytics'),
  getTransactions: () => fetchWithAuth('/merchants/me/transactions'),
  transfer: (amount: number, asset: string) =>
    fetchWithAuth('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ amount, asset }),
    }),
  getTransaction: (id: string) => fetchWithAuth(`/payments/${id}`),
};

export function signOut() {
  if (typeof window !== 'undefined') {
    clearTokens();
    window.location.href = '/login';
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
