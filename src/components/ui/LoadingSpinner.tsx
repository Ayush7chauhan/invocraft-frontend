import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", text = "Syncing records...", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500", className)}>
      <Loader2 className={cn(sizes[size], "animate-spin text-muted-foreground/60 transition-colors")} />
      {text && (
        <p className="mt-4 text-sm font-medium text-muted-foreground/80 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
