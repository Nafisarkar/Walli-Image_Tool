import React from 'react';

const MobileMenuButton = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] transition-colors"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={
            isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
          }
        />
      </svg>
    </button>
  );
};

export default MobileMenuButton;