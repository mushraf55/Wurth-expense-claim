import React from 'react';
import { formatCurrencyDisplay } from '../../../constants/fxRates';
import { generateClaimPdf } from '../../../utils/generateClaimPdf';

const ClaimDetailDrawer = ({ claim, expenses, onClose, onNotify }) => {
  if (!claim) return null;

  const API_BASE = 'http://localhost:3000';

  const handleDownloadPdf = async () => {
    const fullClaim = expenses.find(e => e._id === claim.id);
    if (fullClaim) {
      await generateClaimPdf(fullClaim, API_BASE);
    } else {
      await generateClaimPdf({
        ref: claim.receiptId?.replace('#', '') || '', employeeName: claim.claimant, date: claim.date,
        purpose: claim.purpose, costType: claim.costType, pillar: claim.pillar, country: claim.country,
        currency: claim.currency, amount: claim.origAmount, totalAed: claim.totalAed, status: claim.status,
        iban: claim.routing, category: claim.category, receiptNo: claim.receiptId, description: claim.purpose, attachments: []
      }, API_BASE);
    }
    onNotify('PDF downloaded successfully.', 'success');
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{claim.receiptId}</h3>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${claim.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' : (claim.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}`}>{claim.status}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Claimant</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.claimant}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Date</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.date}</p></div>
            <div className="col-span-2"><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Purpose</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.purpose}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Category</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.category || '—'}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Cost Type</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.costType}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Pillar</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.pillar}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Country</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.country}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Receipt No.</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5">{claim.receiptId}</p></div>
            <div><p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Routing / IBAN</p><p className="font-body-md text-body-md text-on-surface font-bold mt-0.5 font-mono">{claim.routing}</p></div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Original Amount</p>
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">{formatCurrencyDisplay(claim.currency, claim.origAmount)}</p>
              <p className="font-label-sm text-label-sm text-secondary mt-0.5">Rate: {claim.rateText}</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-outline-variant" />
            <div className="bg-primary-container border border-primary/20 rounded-lg p-4 w-full sm:w-auto">
              <p className="font-label-sm text-label-sm text-white uppercase font-semibold">Total (AED)</p>
              <p className="font-headline-md text-headline-md text-white font-bold mt-0.5">{parseFloat(claim.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
            <button onClick={handleDownloadPdf} className="px-5 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-sm">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailDrawer;
