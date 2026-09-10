import { render, screen } from '@testing-library/react';

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(ui, options);
}

export function waitForLoading() {
  return screen.findByRole('status');
}

export function mockApiResponse(data: any, delay = 0) {
  return new Promise((resolve) => setTimeout(() => resolve({ json: () => Promise.resolve(data) }), delay));
}
