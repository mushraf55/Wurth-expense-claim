import React, { createContext, useContext, useState, useEffect } from 'react';
import { FX_RATES } from '../constants/fxRates';
import API_BASE from '../config';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children, currentUser }) => {
  const [expenses, setExpenses] = useState([]);

  // Fetch expenses from Backend API
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/expenses`);
      if (!res.ok) throw new Error('API returned non-200 response.');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Helper to get initials from a name string
  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Submit new Claim — uses currentUser for employee info, returns the reference number
  const submitClaim = async (claimData) => {
    const employeeName = currentUser?.name || 'John Doe';
    const employeeInitials = getInitials(employeeName);
    const refNum = `WPS-${new Date().getFullYear()}-${String(expenses.length + 91).padStart(3, '0')}`;

    const payload = {
      ref: refNum,
      employeeName,
      employeeInitials,
      date: claimData.date || new Date().toISOString().split('T')[0],
      purpose: claimData.purpose,
      costType: claimData.costType || '6540 - Business Meals',
      pillar: claimData.pillar || 'Manufacturing AD',
      country: claimData.country || 'United Arab Emirates',
      currency: claimData.currency || 'AED',
      amount: claimData.amount || '0.00',
      totalAed: claimData.totalAed || '0.00',
      status: 'PENDING',
      iban: 'AE****0123',
      category: claimData.category || 'Meals & Entertainment',
      attachments: claimData.attachments || [],
      receiptNo: claimData.receiptNo || '',
      description: claimData.description || ''
    };

    const res = await fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to submit claim');
    }

    await fetchExpenses();
    return refNum;
  };

  // Submit multiple claims at once (bulk)
  const submitBulkClaims = async (claimsData) => {
    const employeeName = currentUser?.name || 'John Doe';
    const employeeInitials = getInitials(employeeName);
    const baseRefNum = expenses.length + 91;

    const claims = claimsData.map((claimData, idx) => {
      const refNum = `WPS-${new Date().getFullYear()}-${String(baseRefNum + idx).padStart(3, '0')}`;
      return {
        ref: refNum,
        employeeName,
        employeeInitials,
        date: claimData.date || new Date().toISOString().split('T')[0],
        purpose: claimData.purpose,
        costType: claimData.costType || '6540 - Business Meals',
        pillar: claimData.pillar || 'Manufacturing AD',
        country: claimData.country || 'United Arab Emirates',
        currency: claimData.currency || 'AED',
        amount: claimData.amount || '0.00',
        totalAed: claimData.totalAed || '0.00',
        status: 'PENDING',
        iban: 'AE****0123',
        category: claimData.category || 'Meals & Entertainment',
        attachments: claimData.attachments || [],
        receiptNo: claimData.receiptNo || '',
        description: claimData.description || ''
      };
    });

    const res = await fetch(`${API_BASE}/api/expenses/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claims }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to submit bulk claims');
    }

    await fetchExpenses();
    return claims.map(c => c.ref);
  };

  // Change status (Approve / Reject)
  const updateClaimStatus = async (id, status) => {
    const res = await fetch(`${API_BASE}/api/expenses/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update status');
    }

    await fetchExpenses();
  };

  const approveClaim = (id) => updateClaimStatus(id, 'APPROVED');
  const rejectClaim = (id) => updateClaimStatus(id, 'REJECTED');

  const approveAllClaims = async () => {
    const pendingIds = expenses
      .filter(e => e.status === 'PENDING')
      .map(e => e._id);

    for (const id of pendingIds) {
      try {
        await updateClaimStatus(id, 'APPROVED');
      } catch (err) {
        console.error(`Failed to approve claim ${id}:`, err.message);
      }
    }
  };

  // Derived arrays
  const pendingReviews = expenses.filter(e => e.status === 'PENDING');

  // Counters
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length;
  const flaggedCount = expenses.filter(e => e.status === 'REJECTED').length;

  // Format list for Finance Ledger matching the design schema fields
  const ledgerEntries = expenses.map(e => ({
    id: e._id,
    date: e.date,
    claimant: e.employeeName === 'John Doe' ? 'J. Doe' : e.employeeName,
    initials: e.employeeInitials,
    purpose: e.purpose,
    category: e.category || 'Meals & Entertainment',
    costType: e.costType.split(' - ')[0],
    pillar: e.pillar.split(' ')[0],
    country: e.country,
    receiptId: `#${e.ref}`,
    currency: e.currency,
    origAmount: e.amount,
    rateText: e.currency === 'AED' ? 'Local' : `1.00 = ${(FX_RATES[e.currency] || 0).toFixed(2)}`,
    totalAed: e.totalAed,
    routing: e.iban,
    status: e.status
  }));

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        pendingReviews,
        approvedCount,
        flaggedCount,
        ledgerEntries,
        submitClaim,
        submitBulkClaims,
        approveClaim,
        rejectClaim,
        approveAllClaims
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
