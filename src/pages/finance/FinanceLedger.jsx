import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { exportExpenseClaimExcel } from '../../utils/exportExcel';
import InsightPanels from './components/InsightPanels';
import FilterBar from './components/FilterBar';
import LedgerTable from './components/LedgerTable';
import PaginationFooter from './components/PaginationFooter';
import ClaimDetailDrawer from './components/ClaimDetailDrawer';

const FinanceLedger = ({ searchTerm }) => {
  const { expenses, ledgerEntries } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [claimantFilter, setClaimantFilter] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const filteredEntries = ledgerEntries.filter(entry => {
    if (statusFilter !== 'ALL' && entry.status !== statusFilter) return false;
    if (claimantFilter !== 'ALL' && entry.claimant !== claimantFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return entry.claimant.toLowerCase().includes(q) || entry.purpose.toLowerCase().includes(q) || entry.costType.toLowerCase().includes(q) || entry.country.toLowerCase().includes(q) || entry.receiptId.toLowerCase().includes(q) || entry.status.toLowerCase().includes(q);
  });

  const uniqueClaimants = [...new Set(ledgerEntries.map(e => e.claimant))].sort();
  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + rowsPerPage);
  const totalQueueValueAed = filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry.totalAed) || 0), 0);
  const pendingAuditsCount = ledgerEntries.filter(e => e.status === 'PENDING').length;

  const handleExport = async () => {
    if (filteredEntries.length === 0) { setFeedbackMsg('No entries to export.'); setTimeout(() => setFeedbackMsg(null), 3000); return; }
    try {
      const claimantName = claimantFilter !== 'ALL' ? claimantFilter : (filteredEntries[0]?.claimant || '');
      const nameParts = (claimantName || '').split(' ');
      const claimantData = { firstName: nameParts.slice(0, -1).join(' ') || nameParts[0] || '', lastName: nameParts[nameParts.length - 1] || '', accountNo: '', referenceCode: `LEDGER-${new Date().toISOString().split('T')[0]}`, submissionDate: new Date().toISOString().split('T')[0] };
      const categoryToSection = { 'Travel': 'A', 'Office': 'B', 'Meals & Entertainment': 'C', 'Telecommunication': 'D', 'Marketing': 'E', 'Logistics': 'F' };
      const lineItems = filteredEntries.map(entry => ({ category: categoryToSection[entry.category] || 'A', purpose: entry.purpose || '', plCostTypeNr: '', plCostTypeName: entry.costType || '', pillarName: entry.pillar || '', date: entry.date || '', description: entry.purpose || '', country: entry.country || '', receiptNo: entry.receiptId || '', originalAmount: parseFloat(entry.origAmount || 0), aedAmount: parseFloat(entry.totalAed || 0) }));
      await exportExpenseClaimExcel(claimantData, lineItems);
      setFeedbackMsg(`Exported ${filteredEntries.length} entries to Excel successfully.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (error) { console.error('Excel export error:', error); setFeedbackMsg('Failed to export. Please try again.'); setTimeout(() => setFeedbackMsg(null), 3000); }
  };

  const showNotification = (msg, type = 'success') => { setFeedbackMsg(msg); setTimeout(() => setFeedbackMsg(null), 3000); };

  return (
    <main className="flex-grow overflow-hidden flex flex-col p-4 lg:p-xl space-y-6">
      {feedbackMsg && (
        <div className="fixed top-4 right-4 z-50 px-6 py-4 bg-green-50 border border-green-200 text-green-800 shadow-lg flex items-center gap-2 transition-all rounded">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-label-md text-label-md font-bold">{feedbackMsg}</span>
        </div>
      )}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-background font-bold">Finance Master Ledger Queue</h1>
        <p className="font-body-md text-body-md text-secondary mt-1">Real-time enterprise expense tracking and auditing environment.</p>
      </div>
      <InsightPanels totalQueueValue={totalQueueValueAed} pendingAuditsCount={pendingAuditsCount} />
      <FilterBar statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} claimants={uniqueClaimants} claimantFilter={claimantFilter} onClaimantFilterChange={setClaimantFilter} ledgerEntries={ledgerEntries} onPageReset={() => setCurrentPage(1)} />
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm flex flex-col flex-grow overflow-hidden">
        <LedgerTable entries={paginatedEntries} onSelectClaim={setSelectedClaim} />
        <PaginationFooter currentPage={currentPage} totalPages={totalPages} totalEntries={totalEntries} startIndex={startIndex} rowsPerPage={rowsPerPage} onPageChange={(p) => setCurrentPage(p)} onRowsPerPageChange={(r) => { setRowsPerPage(r); setCurrentPage(1); }} />
      </div>
      {claimantFilter !== 'ALL' && (
        <div className="flex justify-end">
          <button onClick={handleExport} className="bg-primary text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-4 hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
            <span>Export to Excel</span>
          </button>
        </div>
      )}
      <ClaimDetailDrawer claim={selectedClaim} expenses={expenses} onClose={() => setSelectedClaim(null)} onNotify={showNotification} />
    </main>
  );
};

export default FinanceLedger;
