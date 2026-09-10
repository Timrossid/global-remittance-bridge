import { verifyWebhookSignature } from '../../src/common/webhooks/signature.verifier';

describe('verifyWebhookSignature', () => {
  const payload = '{"event":"test"}';
  const secret = 'whsec_test';

  it('returns true for valid HMAC-SHA256', () => {
    const crypto = require('crypto');
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
  });

  it('returns false for tampered payload', () => {
    expect(verifyWebhookSignature('tampered', 'anysig', secret)).toBe(false);
  });

  it('returns false when secret is empty', () => {
    expect(verifyWebhookSignature(payload, 'anysig', '')).toBe(false);
  });

  it('returns false when signature is empty', () => {
    expect(verifyWebhookSignature(payload, '', secret)).toBe(false);
  });
});
