"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DateRange, getCurrentYear, MONTH_NAMES } from "./utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isWithinInterval,
  format,
} from "date-fns";
import { useGridKeyboardNav } from "./use-grid-keyboard-nav";

interface DaysPickerProps {
  value?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
  onHover?: (range: DateRange | null) => void;
  className?: string;
  /** Single date selection mode - clicking selects immediately with from === to */
  singleDateMode?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_TO_SHOW = 12;

export function DaysPicker({ value, onSelect, onHover, className, singleDateMode = false }: DaysPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rangeStart, setRangeStart] = React.useState<Date | null>(
    value?.from || null
  );
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(
    value?.to || null
  );
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  const currentYear = getCurrentYear();
  const currentMonth = new Date().getMonth();
  const today = new Date();

  // Generate months to display (oldest first, newest last)
  const months = React.useMemo(() => {
    const result: Date[] = [];
    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      result.push(date);
    }
    return result;
  }, [currentYear, currentMonth]);

  // Scroll to bottom on mount to show current month
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Sync with external value changes
  React.useEffect(() => {
    if (value) {
      setRangeStart(value.from);
      setRangeEnd(value.to);
    } else {
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [value]);

  const handleDayClick = (day: Date) => {
    if (singleDateMode) {
      // In single date mode, immediately select with from === to
      setRangeStart(day);
      setRangeEnd(day);
      onSelect({ from: day, to: day });
      return;
    }

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Start new selection
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      // Complete the range
      if (isAfter(day, rangeStart)) {
        setRangeEnd(day);
        onSelect({ from: rangeStart, to: day });
      } else {
        // If clicked day is before start, make it the new start
        setRangeEnd(rangeStart);
        setRangeStart(day);
        onSelect({ from: day, to: rangeStart });
      }
    }
  };

  const getDaysForMonth = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate));
    const end = endOfWeek(endOfMonth(monthDate));
    return eachDayOfInterval({ start, end });
  };

  const isInRange = (day: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
  };

  const isRangeStart = (day: Date) => {
    return rangeStart ? isSameDay(day, rangeStart) : false;
  };

  const isRangeEnd = (day: Date) => {
    return rangeEnd ? isSameDay(day, rangeEnd) : false;
  };

  // Check if a day is in the preview range (between rangeStart and hoveredDate)
  const isInPreviewRange = (day: Date) => {
    if (!rangeStart || rangeEnd || !hoveredDate) return false;
    const start = rangeStart < hoveredDate ? rangeStart : hoveredDate;
    const end = rangeStart < hoveredDate ? hoveredDate : rangeStart;
    return isWithinInterval(day, { start, end });
  };

  const isPreviewEnd = (day: Date) => {
    if (!rangeStart || rangeEnd || !hoveredDate) return false;
    return isSameDay(day, hoveredDate);
  };

  // Determine if hovering before or after rangeStart
  const isHoveringBefore = rangeStart && hoveredDate && !rangeEnd && hoveredDate < rangeStart;

  // In preview mode, determine which end is visually the "start" (left-rounded) and "end" (right-rounded)
  const isPreviewVisualStart = (day: Date) => {
    if (!rangeStart || rangeEnd || !hoveredDate) return false;
    if (isHoveringBefore) {
      return isSameDay(day, hoveredDate);
    }
    return isSameDay(day, rangeStart);
  };

  const isPreviewVisualEnd = (day: Date) => {
    if (!rangeStart || rangeEnd || !hoveredDate) return false;
    if (isHoveringBefore) {
      return isSameDay(day, rangeStart);
    }
    return isSameDay(day, hoveredDate);
  };

  const handleMouseEnter = (day: Date) => {
    setHoveredDate(day);
    if (!onHover) return;

    // When in active selection mode (rangeStart set but rangeEnd not yet), show the range preview
    if (rangeStart && !rangeEnd) {
      const start = rangeStart < day ? rangeStart : day;
      const end = rangeStart < day ? day : rangeStart;
      onHover({ from: start, to: end });
    } else {
      // Otherwise show single day preview
      onHover({ from: day, to: day });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
    onHover?.(null);
  };

  // Keyboard navigation (arrow keys within the grid)
  useGridKeyboardNav({
    containerRef,
    columns: 7,
    onSelect: (element) => {
      element.click();
    },
  });

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)}>
      <div ref={scrollRef} className="h-[280px] overflow-y-auto pr-2 scrollbar-hidden">
        <div className="flex flex-col gap-4">
          {months.map((monthDate) => (
            <div key={format(monthDate, "yyyy-MM")} className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
              </div>
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0 mb-1">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-0">
                  {getDaysForMonth(monthDate).map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, monthDate);
                    const isToday = isSameDay(day, today);
                    const isFuture = isAfter(day, today);
                    const inRange = isInRange(day);
                    const isStart = isRangeStart(day);
                    const isEnd = isRangeEnd(day);
                    const isDisabled = !isCurrentMonth || isFuture;
                    const isOutsideMonth = !isCurrentMonth;

                    const inPreview = isInPreviewRange(day);
                    const isPreviewEndpoint = isPreviewEnd(day);
                    const previewVisualStart = isPreviewVisualStart(day);
                    const previewVisualEnd = isPreviewVisualEnd(day);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && handleDayClick(day)}
                        onMouseEnter={() => !isDisabled && handleMouseEnter(day)}
                        onMouseLeave={handleMouseLeave}
                        className={cn(
                          "h-8 text-sm flex items-center justify-center relative transition-colors",
                          isOutsideMonth && "invisible",
                          isFuture && isCurrentMonth && "text-muted-foreground/40 cursor-not-allowed",
                          // Default hover
                          !isDisabled && !inRange && !inPreview && "hover:bg-accent rounded-md",
                          isToday && !isStart && !isEnd && !previewVisualStart && !previewVisualEnd && "font-medium text-primary",
                          // Confirmed range
                          inRange && !isStart && !isEnd && "bg-accent",
                          (isStart || isEnd) && "bg-primary text-primary-foreground rounded-md relative z-10",
                          inRange && isStart && !isEnd && "rounded-l-md rounded-r-none",
                          inRange && isEnd && !isStart && "rounded-r-md rounded-l-none",
                          inRange && !isStart && !isEnd && "rounded-none",
                          // Preview range in-between (darker gray)
                          inPreview && !previewVisualStart && !previewVisualEnd && "bg-accent rounded-none",
                          // Preview endpoints with proper start/end styling
                          previewVisualStart && "bg-primary/70 text-primary-foreground rounded-l-md rounded-r-none relative z-10",
                          previewVisualEnd && "bg-primary/70 text-primary-foreground rounded-r-md rounded-l-none relative z-10",
                          // When start and end are the same day
                          previewVisualStart && previewVisualEnd && "rounded-md"
                        )}
                      >
                        {isCurrentMonth ? day.getDate() : ""}
                        {isToday && isCurrentMonth && (
                          <span
                            className={cn(
                              "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                              isStart || isEnd || previewVisualStart || previewVisualEnd
                                ? "bg-primary-foreground"
                                : "bg-primary"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
