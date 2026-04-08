import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import Button from "./Button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackClick,
  rightAction,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "sticky top-0 z-30 flex flex-col gap-2 bg-background/80 backdrop-blur-md border-b px-4 py-8 sm:px-6 sm:py-10 transition-colors duration-300",
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onBackClick || (() => navigate(-1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase tracking-[0.2em] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="flex items-center shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
