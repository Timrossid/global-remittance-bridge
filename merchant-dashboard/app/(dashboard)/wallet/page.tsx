import React from 'react';

export default function WalletPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Treasury Wallet</h1>
      <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl mb-8">
        <p className="text-indigo-100 text-sm mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold">$45,200.50 USD</h2>
        <div className="mt-6 flex gap-4">
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition">Withdraw Funds</button>
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-400 transition">Export Report</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Wallet Address</h3>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
            <code className="text-sm flex-1">GA1234567890ABCDEFGH...</code>
            <button className="text-indigo-600 text-xs font-bold">COPY</button>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Settlement Method</h3>
          <p className="text-gray-600">Automatic daily settlement to your linked bank account.</p>
        </div>
      </div>
    </div>
  );
}
