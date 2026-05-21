import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          GovLens AI
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          AI-Driven DAO Governance Summarizer & Voting Platform on Stellar
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/proposals"
            className="group rounded-lg border border-purple-500/30 bg-purple-950/20 p-6 transition-colors hover:border-purple-500/50 hover:bg-purple-950/40"
          >
            <h2 className="mb-3 text-2xl font-semibold text-purple-300">
              View Proposals
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Browse and analyze active governance proposals with AI-powered summaries.
            </p>
          </Link>
          
          <Link
            href="/proposals"
            className="group rounded-lg border border-pink-500/30 bg-pink-950/20 p-6 transition-colors hover:border-pink-500/50 hover:bg-pink-950/40"
          >
            <h2 className="mb-3 text-2xl font-semibold text-pink-300">
              Cast Your Vote
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Participate in governance by voting For, Against, or Abstain on proposals.
            </p>
          </Link>
          
          <div className="group rounded-lg border border-blue-500/30 bg-blue-950/20 p-6">
            <h2 className="mb-3 text-2xl font-semibold text-blue-300">
              AI Analysis
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Get instant AI-generated summaries, pros, cons, and financial impact analysis.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Powered by Stellar Network & Soroban Smart Contracts
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Connect with Freighter Wallet to interact with the blockchain
          </p>
        </div>
      </div>
    </main>
  );
}
