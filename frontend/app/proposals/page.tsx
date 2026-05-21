'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectFreighter } from '@/lib/stellar';

interface Proposal {
  id: number;
  description_hash: string;
  voting_end_time: number;
  for_votes: number;
  against_votes: number;
  abstain_votes: number;
}

export default function ProposalsPage() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      const key = await connectFreighter();
      setPublicKey(key);
      setIsConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to Freighter wallet');
    }
  };

  const loadProposals = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual contract calls
      const mockProposals: Proposal[] = [
        {
          id: 1,
          description_hash: '0x1234567890abcdef',
          voting_end_time: Date.now() + 86400000,
          for_votes: 150,
          against_votes: 30,
          abstain_votes: 20,
        },
        {
          id: 2,
          description_hash: '0xfedcba0987654321',
          voting_end_time: Date.now() + 172800000,
          for_votes: 75,
          against_votes: 45,
          abstain_votes: 10,
        },
      ];
      setProposals(mockProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const isVotingOpen = (endTime: number) => {
    return Date.now() < endTime;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Governance Proposals</h1>
            <p className="text-gray-400">Active DAO proposals on Stellar Testnet</p>
          </div>
          <button
            onClick={handleConnect}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isConnected
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isConnected ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : 'Connect Wallet'}
          </button>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No proposals found</div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Proposal #{proposal.id}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Hash: {proposal.description_hash}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isVotingOpen(proposal.voting_end_time)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isVotingOpen(proposal.voting_end_time) ? 'Voting Open' : 'Voting Closed'}
                  </span>
                </div>

                {/* Voting Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{proposal.for_votes}</div>
                    <div className="text-sm text-gray-400">For</div>
                  </div>
                  <div className="bg-red-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">{proposal.against_votes}</div>
                    <div className="text-sm text-gray-400">Against</div>
                  </div>
                  <div className="bg-gray-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-gray-400">{proposal.abstain_votes}</div>
                    <div className="text-sm text-gray-400">Abstain</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    Ends: {formatDate(proposal.voting_end_time)}
                  </p>
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
