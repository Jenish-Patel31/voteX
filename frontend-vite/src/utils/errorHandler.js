// Utility function to handle blockchain errors and return user-friendly messages
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  const errorMessage = error.response?.data?.error || error.message || defaultMessage;
  
  // Common blockchain error patterns
  const errorPatterns = {
    'Already authorized': 'This voter is already authorized',
    'already authorized': 'This voter is already authorized',
    'Not authorized': 'You are not authorized to perform this action',
    'not authorized': 'You are not authorized to perform this action',
    'Election ended': 'The election has ended',
    'election ended': 'The election has ended',
    'Already voted': 'You have already voted in this election',
    'already voted': 'You have already voted in this election',
    'Invalid address': 'Please enter a valid Ethereum address',
    'invalid address': 'Please enter a valid Ethereum address',
    'Invalid candidate': 'Please select a valid candidate',
    'invalid candidate': 'Please select a valid candidate',
    'Candidate already exists': 'A candidate with this name already exists',
    'already exists': 'A candidate with this name already exists',
    'Already ended': 'The election has already ended',
    'already ended': 'The election has already ended',
  };
  
  // Check for specific error patterns
  for (const [pattern, friendlyMessage] of Object.entries(errorPatterns)) {
    if (errorMessage.includes(pattern)) {
      return friendlyMessage;
    }
  }
  
  // Return generic message for unknown errors
  return defaultMessage;
};

// Specific error handlers for different operations
export const getVoteErrorMessage = (error) => {
  return getErrorMessage(error, 'Failed to cast vote. Please try again.');
};

export const getAuthorizeErrorMessage = (error) => {
  return getErrorMessage(error, 'Failed to authorize voter. Please try again.');
};

export const getCandidateErrorMessage = (error) => {
  return getErrorMessage(error, 'Failed to add candidate. Please try again.');
};

export const getElectionErrorMessage = (error) => {
  return getErrorMessage(error, 'Failed to end election. Please try again.');
};

export const getVoteStatusErrorMessage = (error) => {
  return getErrorMessage(error, 'Failed to check vote status. Please try again.');
};
