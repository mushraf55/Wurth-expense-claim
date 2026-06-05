import React from 'react';
import { getRateText, formatCurrencyDisplay } from '../../../constants/fxRates';

const RecentClaimsTable = ({ claims }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          My Recent Claims
        </h3>
        <span className="font-label-sm text-label-sm text-secondary font-semibold bg-surface-container-high px-2 py-1 rounded-full">
          {claims.length} claim{claims.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-4 py-3 font-label-md text-label-md text-secondary uppercase font-bold">Ref</th>
              <th className="px-4 py-3 font-label-md text-label-md text-secondary uppercase font-bold">Date</th>
              <th className="px-4 py-3 font-label-md text-label-md text-secondary uppercase font-bold">Purpose</th>
              <th className="px-4 py-3 font-label-md text-label-md text-secondary uppercase font-bold">Amount</th>
              <th className="px-4 py-3 font-label-md text-label-md text-secondary uppercase text-center font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {claims.length > 0 ? (
              claims.map((claim) => (
                <tr key={claim._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3 font-label-md text-label-md text-secondary font-semibold">{claim.ref}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface">{claim.date}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-secondary max-w-[250px] truncate" title={claim.purpose}>{claim.purpose}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface font-semibold whitespace-nowrap" title={`${getRateText(claim.currency)} • AED ${parseFloat(claim.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}>
                    {formatCurrencyDisplay(claim.currency, claim.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      claim.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' :
                      (claim.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                    }`}>{claim.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-secondary font-body-md">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-30">receipt_long</span>
                    <p className="font-semibold">No claims yet</p>
                    <p className="text-xs">Submit your first expense claim using the button above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentClaimsTable;
