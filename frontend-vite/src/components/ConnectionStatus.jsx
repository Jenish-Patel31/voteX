import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show status briefly when connection changes
    if (!isOnline) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  if (!showStatus && isOnline) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Connected to internet' : 'No internet connection'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
