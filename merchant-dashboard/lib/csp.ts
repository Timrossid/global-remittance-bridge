import { Metadata } from 'next';

export const cspTemplate = (nonce?: string) => {
  const nonceAttr = nonce ? `'nonce-${nonce}'` : '';
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src 'self' ${nonceAttr} 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  };
};

export function generateCSPHeader(nonce?: string): Record<string, string> {
  return cspTemplate(nonce);
}
