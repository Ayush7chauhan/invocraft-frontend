import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import Sidebar from './Sidebar';
import Header from './Header';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar (drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
