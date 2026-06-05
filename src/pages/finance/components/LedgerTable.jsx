import React from 'react';
import { formatCurrencyDisplay } from '../../../constants/fxRates';

const LedgerTable = ({ entries, onSelectClaim }) => {
  if (entries.length === 0) {
    return <div className="flex-grow flex items-center justify-center text-secondary font-body-md py-12">No matching ledger entries found.</div>;
  }

  return (
    <div className="overflow-x-auto custom-scrollbar flex-grow">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Date</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Claimant</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Purpose</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Cost Type</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Pillar</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Country</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Receipt ID</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Orig. Currency</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase text-right font-bold">Total (AED)</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase font-bold">Routing</th>
            <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase text-center font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {entries.map((entry) => (
            <tr key={entry.id} onClick={() => onSelectClaim(entry)} className="hover:bg-surface-container-low/40 transition-colors cursor-pointer">
              <td className="px-6 py-4 font-body-md text-body-md font-semibold text-on-surface">{entry.date}</td>
              <td className="px-6 py-4 font-body-md text-body-md text-on-surface">{entry.claimant}</td>
              <td className="px-6 py-4 font-body-sm text-body-sm text-secondary max-w-[150px] truncate" title={entry.purpose}>{entry.purpose}</td>
              <td className="px-6 py-4"><span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] rounded font-bold">{entry.costType}</span></td>
              <td className="px-6 py-4 font-body-sm text-body-sm text-secondary">{entry.pillar}</td>
              <td className="px-6 py-4 font-body-sm text-body-sm text-secondary">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">public</span><span>{entry.country.split(' ')[0]}</span></div>
              </td>
              <td className="px-6 py-4 font-label-md text-label-md text-secondary font-semibold">{entry.receiptId}</td>
              <td className="px-6 py-4 font-body-md text-body-md text-on-surface whitespace-nowrap" title={`FX Rate: ${entry.rateText}${entry.currency !== 'AED' ? ` • Total: ${parseFloat(entry.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED` : ''}`}>
                {formatCurrencyDisplay(entry.currency, entry.origAmount)}
                <span className="text-[10px] opacity-60 ml-1 font-mono">({entry.rateText})</span>
              </td>
              <td className="px-6 py-4 font-body-md text-body-md font-bold text-primary text-right">{parseFloat(entry.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-4 font-label-sm text-label-sm font-mono text-tertiary">{entry.routing}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${entry.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' : (entry.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}`}>{entry.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LedgerTable;
