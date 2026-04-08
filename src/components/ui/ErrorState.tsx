import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Button from "./Button";
import { cn } from "../../lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description = "Electronic synchronization with business records was interrupted.",
  onRetry,
  className = "",
}) => {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-destructive/70 max-w-xs mx-auto">
        {description}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button onClick={onRetry} variant="destructive" size="sm" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
