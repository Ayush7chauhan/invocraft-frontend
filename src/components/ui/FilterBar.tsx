import React from "react";
import Input from "./Input";
import { Search } from "lucide-react";

interface FilterBarProps {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode; // for additional selects/date pickers
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearchChange,
  searchValue,
  searchPlaceholder = "Search...",
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}>
      {onSearchChange !== undefined && (
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
      )}
      {children && (
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
