import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex-1 flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 ${className}`}>
      <div className="w-full h-full flex flex-col relative">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
