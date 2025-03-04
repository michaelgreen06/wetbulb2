'use client';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  // Determine if this is a location permission error
  const isLocationError = error.toLowerCase().includes('location access denied');
  
  // Function to refresh the page
  const refreshPage = () => {
    window.location.reload();
  };
  
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-800">{error}</p>
      </div>
      
      {isLocationError && (
        <div className="mt-3 text-sm text-gray-700 bg-gray-100 p-3 rounded">
          <p className="font-semibold">How to enable location access:</p>
          <ol className="list-decimal ml-5 mt-1">
            <li>Click the lock/location icon in your browser's address bar</li>
            <li>Select "Allow" for location access</li>
            <li>Refresh the page</li>
          </ol>
          <button
            onClick={refreshPage}
            className="mt-3 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}
      
      {onRetry && !isLocationError && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}