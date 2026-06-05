import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import EstimatedPayoutCard from './components/EstimatedPayoutCard';
import RecentClaimsTable from './components/RecentClaimsTable';
import ExpenseFormModal from './components/ExpenseFormModal';

const ClaimantWorkspace = ({ currentUser }) => {
  const { expenses, submitClaim } = useExpenses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmitClaim = async (claimPayload) => submitClaim(claimPayload);

  const myClaims = expenses
    .filter(e => e.employeeName === (currentUser?.name || 'John Doe'))
    .sort((a, b) => new Date(b.date || b._id) - new Date(a.date || a._id))
    .slice(0, 10);

  const estimatedPayout = myClaims.reduce((sum, c) => sum + (parseFloat(c.totalAed) || 0), 0);

  return (
    <section className="p-4 lg:p-xl max-w-[1200px] mx-auto w-full space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 border shadow-lg flex items-center gap-2 transition-all rounded ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-label-md text-label-md font-bold">{notification.message}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Claimant Dashboard</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">Welcome, {currentUser?.name || 'User'}</p>
        </div>
        <button onClick={openForm} className="bg-primary text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span>New Expense Claim</span>
        </button>
      </div>
      <EstimatedPayoutCard estimatedPayout={estimatedPayout} claimsCount={myClaims.length} />
      <RecentClaimsTable claims={myClaims} />
      <ExpenseFormModal isOpen={isFormOpen} onClose={closeForm} onSubmit={handleSubmitClaim} currentUser={currentUser} />
    </section>
  );
};

export default ClaimantWorkspace;
