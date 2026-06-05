import React from 'react';

const Header = ({ searchTerm, setSearchTerm, setIsMobileOpen }) => {
  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 lg:px-margin-desktop sticky top-0 z-40 shrink-0 shadow-sm">
      {/* Brand & Burger Menu */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 text-secondary hover:bg-surface-container-high rounded-full transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <h1 className="flex items-center">
          <img
            src="/big-logo.png"
            alt="WÜRTH PROFESSIONAL SOLUTIONS"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </h1>

        {/* Global search */}
        <div className="relative max-w-xs md:max-w-md w-full ml-1 sm:ml-xl hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-60">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Search claims..."
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
