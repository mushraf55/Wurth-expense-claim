import React from 'react';

const MetricCards = ({ pendingReviews, approvedCount, flaggedCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-outline-variant p-6 shadow-sm group hover:border-primary transition-colors rounded">
        <div className="flex justify-between items-start">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Pending Reviews</span>
          <span className="material-symbols-outlined text-primary bg-primary-fixed p-1.5 rounded select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
            pending_actions
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
            {String(pendingReviews.length).padStart(2, '0')}
          </span>
          <span className="font-label-sm text-label-sm text-secondary flex items-center font-semibold">
            Awaiting review
          </span>
        </div>
      </div>

      <div className="bg-white border border-outline-variant p-6 shadow-sm hover:border-primary transition-colors rounded">
        <div className="flex justify-between items-start">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Approved This Month</span>
          <span className="material-symbols-outlined text-on-secondary-container bg-secondary-container p-1.5 rounded select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-headline-xl text-headline-xl text-on-surface font-bold">{approvedCount}</span>
          <span className="font-label-sm text-label-sm text-secondary flex items-center font-semibold">This month</span>
        </div>
      </div>

      <div className="bg-white border border-outline-variant p-6 shadow-sm hover:border-primary transition-colors rounded sm:col-span-2 lg:col-span-1">
        <div className="flex justify-between items-start">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Flagged Issues</span>
          <span className={`material-symbols-outlined p-1.5 rounded select-none ${flaggedCount > 0 ? 'text-error bg-error-container animate-bounce' : 'text-secondary bg-surface-container'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            report
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-headline-xl text-headline-xl text-on-surface font-bold">{String(flaggedCount).padStart(2, '0')}</span>
          <span className="font-label-sm text-label-sm text-secondary font-semibold">{flaggedCount > 0 ? 'Requires attention' : 'All compliant'}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
