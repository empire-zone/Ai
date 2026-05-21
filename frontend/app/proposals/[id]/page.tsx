'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { connectFreighter, vote, hasVoted } from '@/lib/stellar';

interface Proposal {
  id: number;
  description_hash: string;
  voting_end_time: number;
  for_votes: number;
  against_votes: number;
  abstain_votes: number;
}

interface SummaryResponse {
  summary: string;
  pros: string[];
  cons: string[];
  financial_impact: string;
}

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleConnect = async () => {
    try {
      const key = await connectFreighter();
      setPublicKey(key);
      setIsConnected(true);
      checkVotingStatus(parseInt(params.id), key);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to Freighter wallet');
    }
  };

  const checkVotingStatus = async (proposalId: number, voterKey: string) => {
    try {
      // Replace with actual contract call
      // const voted = await hasVoted(proposalId, voterKey);
      setHasUserVoted(false); // Mock for now
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const loadProposal = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual contract call
      const mockProposal: Proposal = {
        id: parseInt(params.id),
        description_hash: '0x1234567890abcdef',
        voting_end_time: Date.now() + 86400000,
        for_votes: 150,
        against_votes: 30,
        abstain_votes: 20,
      };
      setProposal(mockProposal);

      // Load AI summary
      const summaryResponse = await fetch('/api/proposals/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Proposal #${params.id}: This proposal aims to implement a new governance mechanism that will enhance community participation and decision-making processes within the DAO. The proposed changes include a new voting system, enhanced transparency measures, and improved proposal tracking capabilities.`
        }),
      });
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setVoting(true);
    try {
      // Replace with actual contract call
      // await vote(parseInt(params.id), voteType, publicKey);
      
      // Mock success
      alert('Vote submitted successfully!');
      setHasUserVoted(true);
      
      // Refresh proposal data
      loadProposal();
    } catch (error) {
      console.error('Voting error:', error);
      alert('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    loadProposal();
  }, [params.id]);

  const isVotingOpen = proposal ? Date.now() < proposal.voting_end_time : false;
  const totalVotes = proposal ? proposal.for_votes + proposal.against_votes + proposal.abstain_votes : 0;
  const forPercentage = totalVotes > 0 ? (proposal!.for_votes / totalVotes * 100).toFixed(1) : 0;
  const againstPercentage = totalVotes > 0 ? (proposal!.against_votes / totalVotes * 100).toFixed(1) : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal!.abstain_votes / totalVotes * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading proposal...</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Proposal not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Proposals
          </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Proposal Details */}
          <div className="space-y-6">
            {/* Proposal Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-white">Proposal #{proposal.id}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isVotingOpen
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {isVotingOpen ? 'Voting Open' : 'Voting Closed'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Hash: {proposal.description_hash}
              </p>
              <p className="text-gray-400 text-sm">
                Voting ends: {new Date(proposal.voting_end_time).toLocaleString()}
              </p>
            </div>

            {/* AI Summary */}
            {summary && (
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-300 mb-4">AI Analysis</h2>
                <p className="text-gray-200 mb-6">{summary.summary}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Pros</h3>
                    <ul className="space-y-2">
                      {summary.pros.map((pro, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Cons</h3>
                    <ul className="space-y-2">
                      {summary.cons.map((con, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-red-400 mr-2">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Financial Impact</h3>
                  <p className="text-gray-300 text-sm">{summary.financial_impact}</p>
                </div>
              </div>
            )}

            {/* Voting Actions */}
            {isVotingOpen && !hasUserVoted && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Cast Your Vote</h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleVote(0)}
                    disabled={voting || !isConnected}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => handleVote(1)}
                    disabled={voting || !isConnected}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Vote Against
                  </button>
                  <button
                    onClick={() => handleVote(2)}
                    disabled={voting || !isConnected}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Abstain
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Connect your wallet to vote
                  </p>
                )}
                {hasUserVoted && (
                  <p className="text-green-400 text-sm mt-2 text-center">
                    You have already voted on this proposal
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Voting Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">Voting Results</h2>
              
              {/* Vote Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-400">For</span>
                    <span className="text-white">{proposal.for_votes} votes ({forPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">Against</span>
                    <span className="text-white">{proposal.against_votes} votes ({againstPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Abstain</span>
                    <span className="text-white">{proposal.abstain_votes} votes ({abstainPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gray-500 h-3 rounded-full transition-all"
                      style={{ width: `${abstainPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Votes */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Votes</span>
                  <span className="text-2xl font-bold text-white">{totalVotes}</span>
                </div>
              </div>
            </div>

            {/* Participation Info */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-300 mb-4">Participation Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">Stellar Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract</span>
                  <span className="text-white font-mono text-xs">
                    {process.env.CONTRACT_ID || 'Not deployed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={isVotingOpen ? 'text-green-400' : 'text-red-400'}>
                    {isVotingOpen ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
