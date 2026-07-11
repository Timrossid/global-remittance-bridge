const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getMe: () => fetchWithAuth('/merchants/me'),
  getStats: () => fetchWithAuth('/merchants/me/stats'),
  getTransactions: () => fetchWithAuth('/merchants/me/transactions'), // I'll need to add this to API if I want it
};
