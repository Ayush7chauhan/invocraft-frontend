import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { cn } from "../lib/utils";

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex flex-col lg:flex-row transition-colors duration-300 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Sidebar - Desktop (Static) and Mobile (Drawer Logic is inner) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
             <Outlet />
          </div>
        </div>

        {/* Mobile Navigation */}
        <Footer />
      </main>
    </div>
  );
};

export default DashboardLayout;
