import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorRetry = ({ message, onRetry, retrying = false }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <p className="text-gray-600 text-center max-w-md">{message}</p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
        <span>{retrying ? 'Retrying...' : 'Retry'}</span>
      </button>
    </div>
  );
};

export default ErrorRetry;
