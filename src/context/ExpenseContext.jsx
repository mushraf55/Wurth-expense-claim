import React, { createContext, useContext, useState, useEffect } from 'react';
import { FX_RATES } from '../constants/fxRates';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children, currentUser }) => {
  const [expenses, setExpenses] = useState(() => {
    // Hydrate from localStorage on initial load (survives refresh when backend is down)
    try {
      const saved = localStorage.getItem('wps_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isApiOnline, setIsApiOnline] = useState(false);

  // Persist expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('wps_expenses', JSON.stringify(expenses));
    } catch {
      // localStorage may be full or unavailable — silently ignore
    }
  }, [expenses]);

  // Sync any locally-stored claims to the backend API (for claims that were
  // submitted while offline). This runs automatically when the API comes back.
  const syncLocalClaims = async (apiExpenses, localClaims) => {
    const apiIds = new Set(apiExpenses.map(e => e._id));

    for (const claim of localClaims) {
      if (apiIds.has(claim._id)) continue;
      try {
        await fetch('http://localhost:3000/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(claim),
        });
      } catch {
        // Silently skip — will retry on next fetch
      }
    }
  };

  // Fetch expenses from Backend API
  const fetchExpenses = async () => {
    // Keep a snapshot of the current expenses BEFORE the API call so we
    // can merge back any claims that only exist in local state.
    const prevExpenses = expenses;

    try {
      const res = await fetch('http://localhost:3000/api/expenses');
      if (!res.ok) throw new Error('API returned non-200 response.');
      const data = await res.json();

      setIsApiOnline(true);

      // Merge: keep any claims from local state that aren't yet in the API.
      // Claims stored locally have _id starting with 'e-'.
      const apiIds = new Set(data.map(e => e._id));
      const orphanedLocals = prevExpenses.filter(e =>
        String(e._id).startsWith('e-') && !apiIds.has(e._id)
      );

      if (orphanedLocals.length > 0) {
        setExpenses([...data, ...orphanedLocals]);
        // Fire-and-forget a sync attempt so they get persisted to MongoDB
        syncLocalClaims(data, orphanedLocals);
      } else {
        setExpenses(data);
      }
    } catch (err) {
      console.warn('Backend API unreachable. Falling back to local state.', err.message);
      setIsApiOnline(false);
      // localStorage hydrates the initial state, so data survives refresh even offline
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
      currency: claimData.currency || 'EUR',
      amount: claimData.amount || '0.00',
      totalAed: claimData.totalAed || '0.00',
      status: 'PENDING',
      iban: 'AE****0123',
      category: claimData.category || 'Meals & Entertainment',
      attachments: claimData.attachments || [],
      receiptNo: claimData.receiptNo || '',
      description: claimData.description || ''
    };

    // Always try the backend API first — even if previously offline, it may be back
    try {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsApiOnline(true);
        await fetchExpenses();
        return refNum; // exit early — data is in sync with backend
      }
    } catch (err) {
      console.warn('API submission failed. Storing locally.', err.message);
      setIsApiOnline(false);
    }

    // Fallback: store in local state so the UI updates immediately
    setExpenses(prev => [{ ...payload, _id: `e-${Date.now()}` }, ...prev]);
    return refNum;
  };

  // Change status (Approve / Reject) — always try the API first
  const updateClaimStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3000/api/expenses/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setIsApiOnline(true);
        fetchExpenses();
        return; // exit early — data is in sync with backend
      }
    } catch (err) {
      console.warn('API status update failed. Storing locally.', err.message);
      setIsApiOnline(false);
    }

    // Fallback: update in local state immediately
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, status } : e));
  };

  const approveClaim = (id) => updateClaimStatus(id, 'APPROVED');
  const rejectClaim = (id) => updateClaimStatus(id, 'REJECTED');

  const approveAllClaims = () => {
    expenses.forEach(claim => {
      if (claim.status === 'PENDING') {
        approveClaim(claim._id);
      }
    });
  };

  // Derived arrays
  const pendingReviews = expenses.filter(e => e.status === 'PENDING');

  // Counters
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length
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
        approveClaim,
        rejectClaim,
        approveAllClaims
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
