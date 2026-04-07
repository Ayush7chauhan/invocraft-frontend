import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
