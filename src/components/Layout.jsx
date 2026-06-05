import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ currentTab, setCurrentTab, searchTerm, setSearchTerm, currentUser, onSignOut, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />

      {/* Main Content Viewport */}
      <div className="flex-grow lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Navigation Header */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic page content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
