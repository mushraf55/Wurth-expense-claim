import React from 'react';

const InsightPanels = ({ totalQueueValue, pendingAuditsCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-primary text-white p-6 rounded-xl flex flex-col justify-between shadow-md">
        <span className="font-label-md text-label-md uppercase opacity-85 font-semibold">Total Queue Value</span>
        <div className="font-headline-md text-headline-md font-bold mt-2">
          AED {totalQueueValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
        <span className="font-label-md text-label-md uppercase text-secondary font-semibold">Pending Audits</span>
        <div className="flex items-end justify-between mt-2">
          <span className="font-headline-md text-headline-md text-on-background font-bold">{pendingAuditsCount}</span>
          <span className="text-error font-bold font-label-sm text-label-sm">{pendingAuditsCount > 0 ? `+${pendingAuditsCount} pending` : 'All cleared'}</span>
        </div>
      </div>
    </div>
  );
};

export default InsightPanels;
