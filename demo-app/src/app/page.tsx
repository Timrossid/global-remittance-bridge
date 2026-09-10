import { useCheckoutStore } from '@/store/checkout';

export default function DemoPage() {
  const { amount, currency, recipient, setAmount, setCurrency, setRecipient } = useCheckoutStore();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Remittance Bridge Demo</h1>
          <p className="text-sm text-gray-500 mt-1">Send a cross-border payment via the Bridge.</p>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Recipient address</span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="G..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="100.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="USDC">USDC</option>
              <option value="XLM">XLM</option>
            </select>
          </label>
          <button
            className="w-full rounded-lg bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-700 transition"
            disabled={!amount || !recipient}
          >
            Send payment
          </button>
        </div>
      </div>
    </main>
  );
}
