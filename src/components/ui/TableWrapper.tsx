import React from "react";

interface TableWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  containerClassName?: string;
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  title,
  className = "",
  containerClassName = "",
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 transition-all ${containerClassName}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
        </div>
      )}
      <div className={`overflow-x-auto custom-scrollbar ${className}`}>
        <table className="w-full text-sm text-left">
          {children}
        </table>
      </div>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
    <tr>{children}</tr>
  </thead>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <th className={`px-5 py-3 font-bold ${className}`}>{children}</th>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = "",
  onClick,
}) => (
  <tr
    onClick={onClick}
    className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20 ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <td className={`px-5 py-4 text-gray-600 dark:text-gray-300 font-medium ${className}`}>
    {children}
  </td>
);

export default TableWrapper;
