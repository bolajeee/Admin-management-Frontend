import React from 'react';

const ChartLoadingSkeleton = () => {
  return (
    <div className="flex items-center justify-center h-full animate-pulse text-base-content/60">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-2"></div>
        <p>Loading analytics...</p>
      </div>
    </div>
  );
};

export default ChartLoadingSkeleton;
