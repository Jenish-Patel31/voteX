import axios from 'axios';

// Base API URL - can be easily changed for deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://votex-djrk.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for blockchain operations
});

// Helper function to make API calls with blockchain-specific handling and retry logic
const makeBlockchainApiCall = async (apiCall, operation = "blockchain operation", maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      // Only log success on first attempt or after retries
      if (attempt > 1) {
        console.log(`${operation} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.log(`${operation} failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Don't retry on certain errors
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying ${operation} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
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
