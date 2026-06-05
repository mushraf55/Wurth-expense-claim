import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import MetricCards from './components/MetricCards';
import SubmissionQueueTable from './components/SubmissionQueueTable';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';

const ApproverDashboard = ({ searchTerm }) => {
  const { pendingReviews, approvedCount, flaggedCount, approveClaim, rejectClaim, approveAllClaims } = useExpenses();

  const [toast, setToast] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id, name) => { approveClaim(id); triggerToast(`Approved claim for ${name}`, 'success'); };
  const handleReject = (id, name) => { rejectClaim(id); triggerToast(`Rejected/Flagged claim for ${name}`, 'error'); };

  const handleBatchApprove = () => {
    if (pendingReviews.length === 0) { triggerToast('No pending claims to approve.', 'error'); return; }
    approveAllClaims();
    triggerToast('All pending claims approved successfully.', 'success');
  };

  const filteredQueue = pendingReviews.filter(claim => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return claim.employeeName.toLowerCase().includes(q) || claim.purpose.toLowerCase().includes(q) || claim.ref.toLowerCase().includes(q);
  });

  return (
    <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 border shadow-lg flex items-center gap-2 transition-all rounded ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-label-md text-label-md font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Approver Dashboard</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">Operational overview for enterprise expense compliance.</p>
        </div>
        <button onClick={handleBatchApprove} className="bg-primary text-white px-6 py-2 font-bold rounded flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shadow">
          <span className="material-symbols-outlined">verified_user</span>
          <span>Batch Approval</span>
        </button>
      </div>

      <MetricCards pendingReviews={pendingReviews} approvedCount={approvedCount} flaggedCount={flaggedCount} />
      <SubmissionQueueTable filteredQueue={filteredQueue} onApprove={handleApprove} onReject={handleReject} onPreviewReceipt={setPreviewImg} />
      <ReceiptPreviewModal previewImg={previewImg} onClose={() => setPreviewImg(null)} />
    </main>
  );
};

export default ApproverDashboard;
