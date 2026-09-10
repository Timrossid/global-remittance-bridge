import { ArrowRight, Globe, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-indigo-700">Global Remittance Bridge</h1>
          <a href="https://github.com/Timrossid/global-remittance-bridge" className="text-sm text-gray-600 hover:text-indigo-600">
            GitHub
          </a>
        </div>
      </nav>
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Send money globally in seconds
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Powered by Stellar and Soroban smart contracts. Low fees, instant settlement, transparent escrow.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="#docs" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
            Get Started
          </a>
          <a href="https://stellar.expert/explorer/testnet" className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
            Explore Testnet
          </a>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Globe, title: 'Global Reach', desc: 'Send to any Stellar address worldwide in under 5 seconds.' },
          { icon: Shield, title: 'Escrow Protected', desc: 'Soroban smart contracts hold funds securely until conditions are met.' },
          { icon: Zap, title: 'Low Fees', desc: 'Sub-cent settlement costs powered by the Stellar network.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border p-6 text-left">
            <Icon className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
