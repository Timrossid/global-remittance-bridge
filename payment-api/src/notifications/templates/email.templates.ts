export const EMAIL_TEMPLATES = {
  payment_received: (merchantName: string, amount: string, currency: string, txHash: string) => ({
    subject: `Payment Received — ${amount} ${currency}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Payment Received</h2>
        <p>Hi ${merchantName},</p>
        <p>A payment of <strong>${amount} ${currency}</strong> has been received.</p>
        <p>Transaction: <code>${txHash}</code></p>
        <p style="color: #6b7280; font-size: 12px;">Global Micro-Remittance Bridge</p>
      </div>
    `,
    text: `Payment of ${amount} ${currency} received. Transaction: ${txHash}`,
  }),
  escrow_created: (sender: string, amount: string, escrowId: string) => ({
    subject: `Escrow Created — ${amount} stroops`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Escrow Created</h2>
        <p>An escrow has been created by <code>${sender}</code> for <strong>${amount} stroops</strong>.</p>
        <p>Escrow ID: <code>${escrowId}</code></p>
      </div>
    `,
    text: `Escrow created by ${sender} for ${amount} stroops. ID: ${escrowId}`,
  }),
  settlement_processed: (merchantName: string, net: string, fee: string, currency: string) => ({
    subject: `Settlement Processed — Net ${net} ${currency}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Settlement Processed</h2>
        <p>Hi ${merchantName},</p>
        <p>Your settlement has been processed.</p>
        <p>Net amount: <strong>${net} ${currency}</strong></p>
        <p>Protocol fee: ${fee} ${currency}</p>
      </div>
    `,
    text: `Settlement processed. Net: ${net} ${currency}, Fee: ${fee} ${currency}`,
  }),
} as const;
