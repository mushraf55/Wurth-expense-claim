import React, { useState, useEffect } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ClaimantWorkspace from './pages/claimant/ClaimantWorkspace';
import ApproverDashboard from './pages/approver/ApproverDashboard';
import FinanceLedger from './pages/finance/FinanceLedger';

const AppContent = ({ currentUser, setCurrentUser, currentTab, setCurrentTab, searchTerm, setSearchTerm }) => {
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('wps_current_user', JSON.stringify(user));
    // Dynamic landing page selection based on role
    if (user.role === 'CLAIMANT') {
      setCurrentTab('claimant');
      localStorage.setItem('wps_current_tab', 'claimant');
    } else if (user.role === 'MANAGER') {
      setCurrentTab('approver');
      localStorage.setItem('wps_current_tab', 'approver');
    } else if (user.role === 'FINANCE') {
      setCurrentTab('ledger');
      localStorage.setItem('wps_current_tab', 'ledger');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setSearchTerm('');
    localStorage.removeItem('wps_current_user');
    localStorage.removeItem('wps_current_tab');
  };

  // If no user session, show login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActivePage = () => {
    switch (currentTab) {
      case 'claimant':
        return <ClaimantWorkspace currentUser={currentUser} />;
      case 'approver':
        return <ApproverDashboard searchTerm={searchTerm} />;
      case 'ledger':
        return <FinanceLedger searchTerm={searchTerm} />;
      default:
        return <ClaimantWorkspace currentUser={currentUser} />;
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      currentUser={currentUser}
      onSignOut={handleSignOut}
    >
      {renderActivePage()}
    </Layout>
  );
};

function App() {
  // Restore session from localStorage on initial load
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wps_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const saved = localStorage.getItem('wps_current_tab');
      return saved || 'claimant';
    } catch {
      return 'claimant';
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Sync currentTab to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wps_current_tab', currentTab);
    }
  }, [currentTab, currentUser]);

  return (
    <ExpenseProvider currentUser={currentUser}>
      <AppContent
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </ExpenseProvider>
  );
}

export default App;
