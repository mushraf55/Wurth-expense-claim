import React from 'react';
import { useExpenses } from '../context/ExpenseContext';

const Sidebar = ({ currentTab, setCurrentTab, isMobileOpen, setIsMobileOpen, currentUser, onSignOut }) => {
  const { pendingReviews } = useExpenses();
  const pendingCount = pendingReviews.length;

  const role = currentUser ? currentUser.role : 'CLAIMANT';

  // Define tab navigation based on role authorization
  const navItems = [
    { id: 'claimant', label: 'Claimant Workspace', icon: 'person', allowedRoles: ['CLAIMANT'] },
    { id: 'approver', label: 'Approver View', icon: 'rule', badge: pendingCount, allowedRoles: ['MANAGER'] },
    { id: 'ledger', label: 'Finance Master Ledger', icon: 'dashboard', allowedRoles: ['FINANCE'] },
  ];

  // Filter items matching user role
  const authorizedNavItems = navItems.filter(item => item.allowedRoles.includes(role));

  const handleNavClick = (id) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  const renderNavLinks = () => (
    <ul className="space-y-1">
      {authorizedNavItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2 transition-all rounded text-left ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary scale-95 font-semibold'
                  : 'text-on-secondary opacity-80 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-primary-container text-on-primary-container'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 bg-sidebar-bg text-on-secondary fixed left-0 top-0 z-50 py-6 shrink-0">
        <div className="px-4 mb-8 flex items-center gap-2">
          <img
            src="/small-logo.png"
            alt="WPS"
            className="w-10 h-10 object-contain rounded-lg"
          />
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-primary leading-tight font-bold">Expense Portal</h1>
            <p className="font-label-sm text-label-sm text-on-secondary opacity-70">WPS Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 px-2">
          {renderNavLinks()}
        </nav>

        {/* User context footer */}
        <div className="mt-auto px-2 space-y-1 border-t border-on-secondary/10 pt-4">
          <div className="px-4 py-2 bg-secondary-fixed-dim/20 rounded mb-1">
            <p className="text-xs text-on-secondary font-bold truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-on-secondary/60 truncate">{currentUser?.email}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded text-[9px] font-bold">
              {role}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-4 px-4 py-2 text-on-secondary opacity-80 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all rounded text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary">logout</span>
            <span className="font-label-md text-label-md font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-sidebar-bg text-on-secondary z-50 py-6 flex flex-col transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="/small-logo.png"
              alt="WPS"
              className="w-10 h-10 object-contain rounded-lg"
            />
            <div>
              <h1 className="font-headline-sm text-headline-sm text-on-primary leading-tight font-bold">Expense Portal</h1>
              <p className="font-label-sm text-label-sm text-on-secondary opacity-70">WPS Enterprise</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-on-secondary hover:bg-secondary-fixed-dim rounded"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-2">
          {renderNavLinks()}
        </nav>

        <div className="mt-auto px-2 space-y-1 border-t border-on-secondary/10 pt-4">
          <div className="px-4 py-2 bg-secondary-fixed-dim/20 rounded mb-1 text-left">
            <p className="text-xs text-on-secondary font-bold truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-on-secondary/60 truncate">{currentUser?.email}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded text-[9px] font-bold">
              {role}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-4 px-4 py-2 text-on-secondary opacity-80 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all rounded text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary">logout</span>
            <span className="font-label-md text-label-md font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
