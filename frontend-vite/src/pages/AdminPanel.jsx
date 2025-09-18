import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, Power, Users, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorRetry from '../components/ErrorRetry';
import { getCandidateErrorMessage, getAuthorizeErrorMessage, getElectionErrorMessage } from '../utils/errorHandler';

const AdminPanel = () => {
  const [status, setStatus] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Form states
  const [newCandidateName, setNewCandidateName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [restartPassword, setRestartPassword] = useState('');
  const [newRestartPassword, setNewRestartPassword] = useState('');

  useEffect(() => {
    fetchData();
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

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidateName.trim()) {
      toast.error('Please enter a candidate name');
      return;
    }

    try {
      setActionLoading('add-candidate');
      const response = await apiService.addCandidate(newCandidateName.trim());
      if (response.success) {
        toast.success('Candidate added successfully!');
        setNewCandidateName('');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to add candidate');
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error(getCandidateErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAuthorizeVoter = async (e) => {
    e.preventDefault();
    if (!voterAddress.trim()) {
      toast.error('Please enter a voter address');
      return;
    }

    // Basic address validation
    if (!voterAddress.startsWith('0x') || voterAddress.length !== 42) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      setActionLoading('authorize-voter');
      const response = await apiService.authorizeVoter(voterAddress.trim());
      if (response.success) {
        toast.success('Voter authorized successfully!');
        setVoterAddress('');
      } else {
        toast.error('Failed to authorize voter');
      }
    } catch (error) {
      console.error('Error authorizing voter:', error);
      toast.error(getAuthorizeErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndElection = async () => {
    if (!window.confirm('Are you sure you want to end the election? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('end-election');
      const response = await apiService.endElection();
      if (response.success) {
        toast.success('Election ended successfully!');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to end election');
      }
    } catch (error) {
      console.error('Error ending election:', error);
      toast.error(getElectionErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartElection = async () => {
    if (!restartPassword.trim()) {
      toast.error('Please enter the restart password');
      return;
    }

    if (!window.confirm('Are you sure you want to restart the election? This will clear all candidates and reset the election. This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('restart-election');
      const response = await apiService.restartElection(restartPassword.trim());
      if (response.success) {
        toast.success('Election restarted successfully!');
        setRestartPassword('');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to restart election');
      }
    } catch (error) {
      console.error('Error restarting election:', error);
      toast.error('Failed to restart election. Please check your password.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetRestartPassword = async () => {
    if (!newRestartPassword.trim()) {
      toast.error('Please enter a new restart password');
      return;
    }

    if (newRestartPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setActionLoading('set-password');
      const response = await apiService.setRestartPassword(newRestartPassword.trim());
      if (response.success) {
        toast.success('Restart password updated successfully!');
        setNewRestartPassword('');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to update restart password');
      }
    } catch (error) {
      console.error('Error setting restart password:', error);
      toast.error('Failed to update restart password');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading blockchain data..." />;
  }

  if (error) {
    return <ErrorRetry message={error} onRetry={fetchData} retrying={false} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-lg text-gray-600">
          Manage candidates, authorize voters, and control the election
        </p>
      </div>

      {/* Election Status Alert */}
      {status?.electionEnded && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Election Ended</h3>
              <p className="text-sm text-red-600">
                This election has been ended. No new votes can be cast.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Candidate */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Plus className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Add Candidate</h2>
          </div>
          
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div>
              <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                id="candidateName"
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter candidate name"
                disabled={actionLoading === 'add-candidate' || status?.electionEnded}
              />
            </div>
            
            <button
              type="submit"
              disabled={actionLoading === 'add-candidate' || status?.electionEnded}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {actionLoading === 'add-candidate' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Candidate'
              )}
            </button>
          </form>
        </div>

        {/* Authorize Voter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <UserPlus className="h-6 w-6 text-success-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Authorize Voter</h2>
          </div>
          
          <form onSubmit={handleAuthorizeVoter} className="space-y-4">
            <div>
              <label htmlFor="voterAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Voter Address
              </label>
              <input
                type="text"
                id="voterAddress"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-success-500 font-mono text-sm"
                placeholder="0x..."
                disabled={actionLoading === 'authorize-voter' || status?.electionEnded}
              />
            </div>
            
            <button
              type="submit"
              disabled={actionLoading === 'authorize-voter' || status?.electionEnded}
              className="w-full bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 focus:ring-2 focus:ring-success-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {actionLoading === 'authorize-voter' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authorizing...
                </div>
              ) : (
                'Authorize Voter'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Current Candidates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Current Candidates</h2>
        </div>
        
        {candidates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No candidates added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {candidate.votes} votes
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${candidates.length > 0 ? (parseInt(candidate.votes) / Math.max(...candidates.map(c => parseInt(c.votes))) * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End Election */}
      {!status?.electionEnded && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <Power className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">End Election</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Once you end the election, no more votes can be cast. This action cannot be undone.
          </p>
          
          <button
            onClick={handleEndElection}
            disabled={actionLoading === 'end-election'}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {actionLoading === 'end-election' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ending Election...
              </div>
            ) : (
              'End Election'
            )}
          </button>
        </div>
      )}

      {/* Restart Election */}
      {status?.electionEnded && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <Power className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Restart Election</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              The election has ended. You can restart it with a new round. This will clear all candidates and reset the election.
            </p>
            
            {status?.electionRound && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current Round:</strong> {status.electionRound}
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="restartPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Restart Password
              </label>
              <input
                type="password"
                id="restartPassword"
                value={restartPassword}
                onChange={(e) => setRestartPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restart password"
                disabled={actionLoading === 'restart-election'}
              />
            </div>
            
            <button
              onClick={handleRestartElection}
              disabled={actionLoading === 'restart-election' || !restartPassword.trim()}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {actionLoading === 'restart-election' ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Restarting Election...
                </div>
              ) : (
                'Restart Election'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Set Restart Password */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center mb-4">
          <Power className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Manage Restart Password</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Set or update the password required to restart the election. This provides security for the restart functionality.
          </p>
          
          {status?.restartPasswordSet && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Status:</strong> Custom restart password is set
              </p>
            </div>
          )}
          
          <div>
            <label htmlFor="newRestartPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Restart Password
            </label>
            <input
              type="password"
              id="newRestartPassword"
              value={newRestartPassword}
              onChange={(e) => setNewRestartPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter new restart password (min 6 characters)"
              disabled={actionLoading === 'set-password'}
            />
          </div>
          
          <button
            onClick={handleSetRestartPassword}
            disabled={actionLoading === 'set-password' || !newRestartPassword.trim() || newRestartPassword.length < 6}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {actionLoading === 'set-password' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Password...
              </div>
            ) : (
              'Update Restart Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
