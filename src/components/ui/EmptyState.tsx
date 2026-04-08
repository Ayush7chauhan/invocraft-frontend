import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "./Button";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FolderOpen className="h-10 w-10 text-muted-foreground/40" />,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="outline" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
