import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "danger" | "warning" | "info" | "neutral" | "primary";
}

const Badge = ({
  children,
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) => {
  const baseStyles = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all";
  
  const variants = {
    primary: "bg-green-100 dark:bg-green-600/20 text-[#16A34A] dark:text-green-500 border border-green-200 dark:border-green-800/50",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20",
    neutral: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Badge;
