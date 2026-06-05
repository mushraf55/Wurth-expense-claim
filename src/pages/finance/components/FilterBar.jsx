import React from 'react';

const FilterBar = ({ statusFilter, onStatusFilterChange, claimants, claimantFilter, onClaimantFilterChange, ledgerEntries, onPageReset }) => {
  const tabs = [
    { key: 'ALL', label: 'All', count: ledgerEntries.length, icon: 'database' },
    { key: 'PENDING', label: 'Pending', count: ledgerEntries.filter(e => e.status === 'PENDING').length, icon: 'pending' },
    { key: 'APPROVED', label: 'Approved', count: ledgerEntries.filter(e => e.status === 'APPROVED').length, icon: 'check_circle' },
    { key: 'REJECTED', label: 'Rejected', count: ledgerEntries.filter(e => e.status === 'REJECTED').length, icon: 'cancel' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="overflow-x-auto custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 w-full sm:w-auto">
        <div className="inline-flex sm:flex border-b border-outline-variant min-w-max sm:min-w-0 sm:w-full">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { onStatusFilterChange(tab.key); onPageReset(); }}
              className={`flex items-center gap-2 px-4 py-3 font-label-md text-label-md border-b-[3px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${statusFilter === tab.key ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-on-surface hover:border-outline-variant'}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: statusFilter === tab.key ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${statusFilter === tab.key ? 'bg-primary-container text-primary' : 'bg-surface-container-high text-secondary'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="material-symbols-outlined text-secondary text-lg">badge</span>
        <select value={claimantFilter} onChange={(e) => { onClaimantFilterChange(e.target.value); onPageReset(); }}
          className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer w-full sm:w-56">
          <option value="ALL">All Employees</option>
          {claimants.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
