import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-gray-900 flex transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 min-h-screen relative flex flex-col transition-colors duration-300 shadow-xl overflow-hidden">
          <Outlet context={{ setSidebarOpen }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

