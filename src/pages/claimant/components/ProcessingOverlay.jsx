import React from 'react';

const ProcessingOverlay = ({ isProcessing, progress }) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-surface-container-high rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">image</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">Processing files...</p>
          <p className="font-body-md text-body-md text-secondary">Reading and optimizing receipt{progress.total > 1 ? 's' : ''} for upload</p>
        </div>
        {progress.total > 0 && (
          <div className="w-full space-y-2">
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
            </div>
            <p className="font-label-sm text-label-sm text-secondary text-center font-semibold">{progress.current} of {progress.total}{progress.total > 1 && ` file${progress.total > 1 ? 's' : ''}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOverlay;
