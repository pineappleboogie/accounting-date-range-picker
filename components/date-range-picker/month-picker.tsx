"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DateRange,
  getMonthRange,
  getMonthSpanRange,
  getCurrentYear,
  MONTH_NAMES,
} from "./utils";
import { useGridKeyboardNav } from "./use-grid-keyboard-nav";

interface MonthPickerProps {
  onSelect: (range: DateRange) => void;
  selectedRange?: DateRange;
  className?: string;
}

const YEARS_TO_SHOW = 5;

type MonthPosition = { year: number; month: number };

export function MonthPicker({ onSelect, selectedRange, className }: MonthPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentYear = getCurrentYear();

  // Drag-to-select state
  const [rangeStart, setRangeStart] = React.useState<MonthPosition | null>(null);
  const [hoveredMonth, setHoveredMonth] = React.useState<MonthPosition | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Oldest first, newest last
  const years = Array.from(
    { length: YEARS_TO_SHOW },
    (_, i) => currentYear - YEARS_TO_SHOW + 1 + i
  );

  // Scroll to bottom on mount to show current year
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Convert year/month to a comparable number
  const monthToNumber = (year: number, month: number) => year * 12 + month;

  const isMonthInRange = (
    year: number,
    month: number,
    start: MonthPosition,
    end: MonthPosition
  ): boolean => {
    const current = monthToNumber(year, month);
    const startNum = monthToNumber(start.year, start.month);
    const endNum = monthToNumber(end.year, end.month);
    const [min, max] = startNum <= endNum ? [startNum, endNum] : [endNum, startNum];
    return current >= min && current <= max;
  };

  const isInPreviewRange = (year: number, month: number): boolean => {
    if (!rangeStart || !hoveredMonth) return false;
    return isMonthInRange(year, month, rangeStart, hoveredMonth);
  };

  const isPreviewStart = (year: number, month: number): boolean => {
    if (!rangeStart) return false;
    return rangeStart.year === year && rangeStart.month === month;
  };

  const isPreviewEnd = (year: number, month: number): boolean => {
    if (!hoveredMonth || !rangeStart) return false;
    return hoveredMonth.year === year && hoveredMonth.month === month;
  };

  const handleMouseDown = (year: number, month: number) => {
    setRangeStart({ year, month });
    setHoveredMonth({ year, month });
    setIsDragging(true);
  };

  const handleMouseEnter = (year: number, month: number) => {
    setHoveredMonth({ year, month });
  };

  const handleMouseUp = (year: number, month: number) => {
    if (isDragging && rangeStart) {
      const range = getMonthSpanRange(rangeStart.year, rangeStart.month, year, month);
      onSelect(range);
      setRangeStart(null);
      setHoveredMonth(null);
    }
    setIsDragging(false);
  };

  const handleContainerMouseUp = () => {
    if (isDragging && rangeStart && hoveredMonth) {
      const range = getMonthSpanRange(
        rangeStart.year,
        rangeStart.month,
        hoveredMonth.year,
        hoveredMonth.month
      );
      onSelect(range);
    }
    setRangeStart(null);
    setHoveredMonth(null);
    setIsDragging(false);
  };

  const handleContainerMouseLeave = () => {
    if (!isDragging) {
      setHoveredMonth(null);
    }
  };

  const handleMonthSelect = (year: number, monthIndex: number) => {
    const range = getMonthRange(year, monthIndex);
    onSelect(range);
  };

  const isMonthSelected = (year: number, monthIndex: number) => {
    if (!selectedRange) return false;
    const range = getMonthRange(year, monthIndex);
    return (
      range.from.getTime() === selectedRange.from.getTime() &&
      range.to.getTime() === selectedRange.to.getTime()
    );
  };

  // Keyboard navigation (arrow keys within the grid)
  useGridKeyboardNav({
    containerRef,
    columns: 3,
    onSelect: (element) => {
      element.click();
    },
  });

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col select-none", className)}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseLeave}
    >
      <div ref={scrollRef} className="h-[280px] overflow-y-auto overflow-x-visible pr-2 pl-1 -ml-1 scrollbar-hidden">
        <div className="flex flex-col gap-4 py-1">
          {years.map((year) => (
            <div key={year} className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {year}
              </div>
              <div className="grid grid-cols-3 gap-1.5 overflow-visible">
                {MONTH_NAMES.map((month, index) => {
                  const now = new Date();
                  const isFutureMonth =
                    year > now.getFullYear() ||
                    (year === now.getFullYear() && index > now.getMonth());
                  const isSelected = isMonthSelected(year, index);
                  const inPreview = isInPreviewRange(year, index);
                  const isStart = isPreviewStart(year, index);
                  const isEnd = isPreviewEnd(year, index);

                  return (
                    <Button
                      key={`${year}-${month}`}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 text-sm font-normal cursor-grab active:cursor-grabbing transition-all",
                        // Preview range styling (in-between items) - override hover/focus states
                        inPreview && !isStart && !isEnd && "bg-accent! border-accent! hover:bg-accent!",
                        // Preview start (anchor point) - solid black with ring
                        isStart && "bg-primary! text-primary-foreground! ring-2 ring-primary ring-offset-1 hover:bg-primary!",
                        // Preview end (current hover) - also solid black with ring
                        isEnd && !isStart && "bg-primary! text-primary-foreground! ring-2 ring-primary ring-offset-1 hover:bg-primary!"
                      )}
                      disabled={isFutureMonth}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!isFutureMonth) handleMouseDown(year, index);
                      }}
                      onMouseEnter={() => {
                        if (!isFutureMonth) handleMouseEnter(year, index);
                      }}
                      onMouseUp={() => {
                        if (!isFutureMonth) handleMouseUp(year, index);
                      }}
                      onClick={() => {
                        if (!isDragging && !isFutureMonth) {
                          handleMonthSelect(year, index);
                        }
                      }}
                    >
                      {month}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
