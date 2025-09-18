import React, { useState, useEffect } from 'react';
import { Vote as VoteIcon, CheckCircle, XCircle, AlertTriangle, Wallet, ExternalLink, Shield } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorRetry from '../components/ErrorRetry';
import { getVoteErrorMessage, getVoteStatusErrorMessage } from '../utils/errorHandler';

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [checkingVote, setCheckingVote] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  useEffect(() => {
    fetchData();
    checkWalletConnection();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate that we get proper responses from blockchain
      const [statusData, candidatesData] = await Promise.all([
        apiService.getStatus(),
        apiService.getCandidates()
      ]);
      
      // Validate response data structure
      if (!statusData || typeof statusData !== 'object') {
        throw new Error('Invalid status data received from blockchain');
      }
      
      if (!Array.isArray(candidatesData)) {
        throw new Error('Invalid candidates data received from blockchain');
      }
      
      // Only set data if we get valid responses
      setStatus(statusData);
      setCandidates(candidatesData);
      
      // Only set loading to false after successful data validation
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to connect to blockchain. Please check your network connection and try again.';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Blockchain connection timed out. The network may be slow. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Invalid data received from blockchain. Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          await checkVoteStatus(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setConnectingWallet(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setConnectedWallet(accounts[0]);
        toast.success('Wallet connected successfully!');
        await checkVoteStatus(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  const checkVoteStatus = async (address = connectedWallet) => {
    if (!address) return;

    try {
      setCheckingVote(true);
      const voteData = await apiService.hasVoted(address);
      setVoteStatus(voteData);
      
      if (voteData.voted) {
        toast.success('You have already voted!');
      } else {
        toast.success('You are eligible to vote!');
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
      toast.error(getVoteStatusErrorMessage(error));
    } finally {
      setCheckingVote(false);
    }
  };

  const handleVote = async () => {
    if (!connectedWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (selectedCandidate === null) {
      toast.error('Please select a candidate');
      return;
    }

    if (!voteStatus || voteStatus.voted) {
      toast.error('You have already voted or are not authorized');
      return;
    }

    if (status?.electionEnded) {
      toast.error('Election has ended');
      return;
    }

    try {
      setVoting(true);
      
      const response = await apiService.castVote(selectedCandidate, connectedWallet);
      
      if (response.success) {
        toast.success(`Vote cast successfully for ${candidates.find(c => c.id === selectedCandidate)?.name}!`);
        
        // Refresh the data to show updated vote counts
        await fetchData();
        await checkVoteStatus();
        
        // Reset the form
        setSelectedCandidate(null);
      } else {
        toast.error('Failed to cast vote');
      }
      
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(getVoteErrorMessage(error));
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to blockchain..." />;
  }

  if (error) {
    return <ErrorRetry message={error} onRetry={fetchData} retrying={false} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cast Your Vote</h1>
        <p className="text-lg text-gray-600">
          Secure blockchain voting with wallet authentication
        </p>
      </div>

      {/* Election Status */}
      {status?.electionEnded ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Election Ended</h3>
              <p className="text-red-600">
                This election has ended. No more votes can be cast.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Election Active</h3>
              <p className="text-green-600">
                The election is currently active. Connect your wallet to vote.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Wallet className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
        </div>
        
        {!connectedWallet ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Secure Voting</p>
                <p className="text-sm text-blue-700">
                  Connect your MetaMask wallet to authenticate and cast your vote securely on the blockchain.
                </p>
              </div>
            </div>
            
            <button
              onClick={connectWallet}
              disabled={connectingWallet}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
            >
              {connectingWallet ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect MetaMask Wallet
                </div>
              )}
            </button>
            
            <div className="text-sm text-gray-500 text-center">
              <p>Need MetaMask? <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
                Install MetaMask <ExternalLink className="h-3 w-3 ml-1" />
              </a></p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">Wallet Connected</span>
              </div>
              <span className="text-sm font-mono text-gray-600">
                {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
              </span>
            </div>
            
            <button
              onClick={() => checkVoteStatus()}
              disabled={checkingVote}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {checkingVote ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking Vote Status...
                </div>
              ) : (
                'Check Vote Status'
              )}
            </button>
          </div>
        )}

        {/* Vote Status Display */}
        {voteStatus && connectedWallet && (
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center">
              {voteStatus.voted ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">You have already voted</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">You are eligible to vote</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Candidates Selection */}
      {candidates.length > 0 && !status?.electionEnded && connectedWallet && voteStatus && !voteStatus.voted && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <VoteIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Select Your Candidate</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedCandidate === candidate.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">
                      {candidate.votes} votes
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedCandidate === candidate.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedCandidate === candidate.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleVote}
              disabled={voting || selectedCandidate === null}
              className="w-full bg-success-600 text-white py-3 px-4 rounded-lg hover:bg-success-700 focus:ring-2 focus:ring-success-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
            >
              {voting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Casting Vote...
                </div>
              ) : (
                'Cast Vote'
              )}
            </button>
          </div>
        </div>
      )}

      {/* No Candidates Message */}
      {candidates.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">No Candidates</h3>
              <p className="text-yellow-600">
                No candidates have been added to this election yet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Blockchain Security</h3>
            <p className="text-blue-600 mt-1">
              Your vote is secured by blockchain technology with wallet authentication.
            </p>
            <ul className="text-sm text-blue-600 mt-2 space-y-1">
              <li>• Wallet address verified on-chain</li>
              <li>• One vote per address</li>
              <li>• Permanent blockchain record</li>
              <li>• Private key stays in MetaMask</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;