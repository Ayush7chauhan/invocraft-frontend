import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  min?: string;
  max?: string;
};

export function DatePicker({ value, onChange, placeholder = "Select date", error, min, max }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatInputValue = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(day);
    setSelectedDate(newDate);
    onChange(formatInputValue(newDate));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onChange(formatInputValue(today));
    setIsOpen(false);
  };

  const displayDate = selectedDate || new Date();
  const daysInMonth = getDaysInMonth(displayDate);
  const firstDay = getFirstDayOfMonth(displayDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const isToday = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === today.getDate() &&
      displayDate.getMonth() === today.getMonth() &&
      displayDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      displayDate.getMonth() === selectedDate.getMonth() &&
      displayDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border rounded-xl px-4 py-3 bg-white dark:bg-gray-800 cursor-pointer transition-colors ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-[#E5E7EB] dark:border-gray-700 hover:border-[#22C55E] dark:hover:border-green-500"
        } ${isOpen ? "border-[#22C55E] dark:border-green-500 ring-2 ring-[#22C55E]/20 dark:ring-green-500/20" : ""}`}
      >
        <Calendar className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 flex-shrink-0" />
        <span className={`flex-1 text-left ${value ? "text-[#111827] dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {value ? formatDate(selectedDate) : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-xl shadow-xl p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <div className="font-semibold text-[#111827] dark:text-white">
                {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isTodayDay = isToday(day);
              const isSelectedDay = isSelected(day);
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                    isSelectedDay
                      ? "bg-[#22C55E] text-white shadow-md"
                      : isTodayDay
                      ? "bg-green-50 dark:bg-green-900/20 text-[#22C55E] dark:text-green-400 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#111827] dark:text-white"
                  }`}
                  type="button"
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-gray-700">
            <button
              onClick={handleToday}
              className="w-full py-2 px-4 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium transition-colors"
              type="button"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

