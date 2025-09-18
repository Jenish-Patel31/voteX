import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Users, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorRetry from '../components/ErrorRetry';

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

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

  const handleRetry = async () => {
    setRetrying(true);
    await fetchData();
    setRetrying(false);
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to blockchain..." />;
  }

  if (error) {
    return <ErrorRetry message={error} onRetry={handleRetry} retrying={retrying} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {status?.electionName || 'Election Dashboard'}
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to the decentralized voting platform
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Vote className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Votes</p>
              <p className="text-2xl font-semibold text-gray-900">{status?.totalVotes || '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="flex items-center">
                {status?.electionEnded ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-lg font-semibold text-red-600">Ended</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-lg font-semibold text-green-600">Active</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Owner</p>
              <p className="text-sm font-mono text-gray-900 truncate">
                {status?.owner ? `${status.owner.slice(0, 6)}...${status.owner.slice(-4)}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/vote"
            className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <Vote className="h-6 w-6 text-primary-600 mr-3" />
            <span className="font-medium text-primary-700">Cast Your Vote</span>
          </Link>
          
          <Link
            to="/results"
            className="flex items-center justify-center p-4 border-2 border-dashed border-success-300 rounded-lg hover:border-success-500 hover:bg-success-50 transition-colors duration-200"
          >
            <BarChart3 className="h-6 w-6 text-success-600 mr-3" />
            <span className="font-medium text-success-700">View Results</span>
          </Link>
          
          <Link
            to="/admin"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors duration-200"
          >
            <Users className="h-6 w-6 text-gray-600 mr-3" />
            <span className="font-medium text-gray-700">Admin Panel</span>
          </Link>
        </div>
      </div>

      {/* Candidates Preview */}
      {candidates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidates</h2>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
