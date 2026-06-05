import React from 'react';
import { formatCurrencyDisplay, FX_RATES } from '../../../constants/fxRates';

const SubmissionQueueTable = ({ filteredQueue, onApprove, onReject, onPreviewReceipt }) => {
  return (
    <div className="bg-white border border-outline-variant shadow-sm overflow-hidden rounded">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Submission Queue</h3>
        <div className="flex gap-2">
          <button className="p-1.5 border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer rounded" title="Filter Queue">
            <span className="material-symbols-outlined text-sm select-none">filter_list</span>
          </button>
          <button className="p-1.5 border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer rounded" title="Download Queue">
            <span className="material-symbols-outlined text-sm select-none">download</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Employee Name</th>
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Submission Date</th>
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Purpose</th>
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase text-right font-bold">Total Amount (AED)</th>
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase text-center font-bold">Receipt</th>
              <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((claim) => (
                <tr key={claim._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-surface-variant rounded-full flex items-center justify-center text-xs font-bold text-secondary font-mono select-none">{claim.employeeInitials}</div>
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{claim.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-secondary">{claim.date}</td>
                  <td className="px-6 py-4 font-body-md text-body-md text-secondary max-w-[200px] truncate" title={claim.purpose}>{claim.purpose}</td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface text-right font-semibold" title={`Original: ${formatCurrencyDisplay(claim.currency, claim.amount)} • FX Rate: 1 ${claim.currency} = ${(FX_RATES[claim.currency] || 1).toFixed(2)} AED`}>
                    {formatCurrencyDisplay('AED', claim.totalAed)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {claim.attachments && claim.attachments.length > 0 ? (
                      <button onClick={() => onPreviewReceipt(claim.attachments[0])} className="inline-flex items-center gap-1 text-primary hover:bg-primary-fixed px-2 py-1 rounded transition-colors text-sm cursor-pointer" title="View receipt">
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                        <span className="font-bold">{claim.attachments.length}</span>
                      </button>
                    ) : (
                      <span className="text-secondary/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => onApprove(claim._id, claim.employeeName)} className="text-primary hover:bg-primary-fixed px-3 py-1 rounded transition-colors font-bold text-sm cursor-pointer">Approve</button>
                      <button onClick={() => onReject(claim._id, claim.employeeName)} className="text-secondary hover:bg-surface-container-high px-3 py-1 rounded transition-colors font-bold text-sm cursor-pointer">Reject</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-secondary font-body-md">No pending expense claims in the queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionQueueTable;
