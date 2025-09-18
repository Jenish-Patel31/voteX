import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorRetry from '../components/ErrorRetry';

const Results = () => {
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate that we get proper responses from blockchain
      const [resultsData, statusData] = await Promise.all([
        apiService.getResults(),
        apiService.getStatus()
      ]);
      
      // Validate response data structure
      if (!resultsData || typeof resultsData !== 'object') {
        throw new Error('Invalid results data received from blockchain');
      }
      
      if (!statusData || typeof statusData !== 'object') {
        throw new Error('Invalid status data received from blockchain');
      }
      
      // Validate candidates array if it exists
      if (resultsData.candidates && !Array.isArray(resultsData.candidates)) {
        throw new Error('Invalid candidates data received from blockchain');
      }
      
      // Only set data if we get valid responses
      setResults(resultsData);
      setStatus(statusData);
      
      // Only set loading to false after successful data validation
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      
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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
      toast.success('Results updated!');
    } catch (error) {
      toast.error('Failed to refresh results');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching results from blockchain..." />;
  }

  if (error) {
    return <ErrorRetry message={error} onRetry={fetchData} retrying={false} />;
  }

  const maxVotes = results?.candidates.reduce((max, candidate) => 
    Math.max(max, parseInt(candidate.votes)), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Election Results</h1>
        <p className="text-lg text-gray-600">
          Live results from the {status?.electionName || 'election'}
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Results'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Votes</p>
              <p className="text-2xl font-semibold text-gray-900">{results?.totalVotes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{results?.candidates.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {status?.electionEnded ? 'Ended' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {results?.winner && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-8">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-yellow-800 mb-2">Winner</h2>
            <p className="text-2xl font-semibold text-yellow-900">{results.winner}</p>
            <p className="text-yellow-700 mt-2">
              {results.candidates.find(c => c.name === results.winner)?.votes} votes
            </p>
          </div>
        </div>
      )}

      {/* Results Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Vote Distribution</h2>
        </div>

        {!results?.candidates || results.candidates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No candidates to display.</p>
        ) : (
          <div className="space-y-4">
            {results?.candidates
              .sort((a, b) => parseInt(b.votes) - parseInt(a.votes))
              .map((candidate, index) => {
                const votePercentage = maxVotes > 0 ? (parseInt(candidate.votes) / maxVotes) * 100 : 0;
                const isWinner = candidate.name === results?.winner;
                
                return (
                  <div key={candidate.index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                        <span className="font-semibold text-gray-900">{candidate.name}</span>
                        {index === 0 && !isWinner && (
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                            Leading
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          {candidate.votes} votes
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({maxVotes > 0 ? ((parseInt(candidate.votes) / results?.totalVotes) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          isWinner
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            : index === 0
                            ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${votePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Detailed Results Table */}
      {results?.candidates && results.candidates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Results</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results?.candidates
                  .sort((a, b) => parseInt(b.votes) - parseInt(a.votes))
                  .map((candidate, index) => {
                    const percentage = maxVotes > 0 ? ((parseInt(candidate.votes) / results?.totalVotes) * 100).toFixed(1) : '0.0';
                    const isWinner = candidate.name === results?.winner;
                    
                    return (
                      <tr key={candidate.index} className={isWinner ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isWinner && <Trophy className="h-4 w-4 text-yellow-500 mr-2" />}
                            <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.votes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isWinner ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Winner
                            </span>
                          ) : index === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Leading
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Candidate
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
