import React from 'react';

const EstimatedPayoutCard = ({ estimatedPayout, claimsCount }) => {
  return (
    <div className="bg-primary text-white p-6 rounded-xl shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-label-md text-label-md uppercase opacity-85 font-semibold">Estimated Payout</p>
          <div className="font-headline-xl text-headline-xl font-bold mt-2">
            {estimatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
          </div>
          <p className="font-label-sm text-label-sm opacity-75 mt-1">
            Based on {claimsCount} claim{claimsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
        </div>
      </div>
    </div>
  );
};

export default EstimatedPayoutCard;
