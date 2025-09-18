import axios from 'axios';

// Base API URL - can be easily changed for deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://votex-djrk.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for blockchain operations
});

// Helper function to make API calls with blockchain-specific handling
const makeBlockchainApiCall = async (apiCall, operation = "blockchain operation") => {
  try {
    return await apiCall();
  } catch (error) {
    console.log(`${operation} failed:`, error.message);
    throw error;
  }
};

// API service functions
export const apiService = {
  // Get all candidates
  getCandidates: async () => {
    return makeBlockchainApiCall(async () => {
      const response = await api.get('/candidates');
      return response.data;
    }, "Fetching candidates from blockchain");
  },

  // Add a new candidate (admin only)
  addCandidate: async (name) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/add-candidate', { name });
      return response.data;
    }, "Adding candidate to blockchain");
  },

  // Authorize a voter (admin only)
  authorizeVoter: async (address) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/authorize', { address });
      return response.data;
    }, "Authorizing voter on blockchain");
  },

  // End the election (admin only)
  endElection: async () => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/end');
      return response.data;
    }, "Ending election on blockchain");
  },

  // Restart the election (admin only)
  restartElection: async (password) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/restart', { password });
      return response.data;
    }, "Restarting election on blockchain");
  },

  // Set restart password (admin only)
  setRestartPassword: async (password) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/set-restart-password', { password });
      return response.data;
    }, "Setting restart password on blockchain");
  },

  // Get election status
  getStatus: async () => {
    return makeBlockchainApiCall(async () => {
      const response = await api.get('/status');
      return response.data;
    }, "Fetching election status from blockchain");
  },

  // Get election results
  getResults: async () => {
    return makeBlockchainApiCall(async () => {
      const response = await api.get('/results');
      return response.data;
    }, "Fetching election results from blockchain");
  },

  // Check if an address has voted
  hasVoted: async (address) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.get(`/has-voted/${address}`);
      return response.data;
    }, "Checking vote status on blockchain");
  },

  // Cast a vote
  castVote: async (candidateIndex, voterAddress) => {
    return makeBlockchainApiCall(async () => {
      const response = await api.post('/vote', { candidateIndex, voterAddress });
      return response.data;
    }, "Casting vote on blockchain");
  },
};

export default api;
