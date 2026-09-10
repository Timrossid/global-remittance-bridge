import { EMAIL_TEMPLATES } from '../../src/notifications/templates/email.templates';

describe('EMAIL_TEMPLATES', () => {
  it('payment_received has subject html and text', () => {
    const tpl = EMAIL_TEMPLATES.payment_received('Acme', '100.00', 'USDC', 'abc123');
    expect(tpl.subject).toContain('100.00');
    expect(tpl.html).toContain('Acme');
    expect(tpl.text).toContain('abc123');
  });

  it('escrow_created includes escrowId', () => {
    const tpl = EMAIL_TEMPLATES.escrow_created('GSRC', '1000000', 'esc-0');
    expect(tpl.html).toContain('esc-0');
    expect(tpl.text).toContain('esc-0');
  });

  it('settlement_processed includes net and fee', () => {
    const tpl = EMAIL_TEMPLATES.settlement_processed('Acme', '99.50', '0.50', 'USDC');
    expect(tpl.subject).toContain('99.50');
    expect(tpl.html).toContain('0.50');
  });
});
