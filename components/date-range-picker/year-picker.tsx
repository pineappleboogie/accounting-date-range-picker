"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange, getYearRange, getYearSpanRange, getCurrentYear } from "./utils";
import { useGridKeyboardNav } from "./use-grid-keyboard-nav";

interface YearPickerProps {
  onSelect: (range: DateRange) => void;
  onHover?: (range: DateRange | null) => void;
  selectedRange?: DateRange;
  className?: string;
}

const YEARS_TO_SHOW = 15;

export function YearPicker({ onSelect, onHover, selectedRange, className }: YearPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentYear = getCurrentYear();

  // Drag-to-select state
  const [rangeStart, setRangeStart] = React.useState<number | null>(null);
  const [hoveredYear, setHoveredYear] = React.useState<number | null>(null);
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

  const isYearInRange = (year: number, start: number, end: number): boolean => {
    const [min, max] = start <= end ? [start, end] : [end, start];
    return year >= min && year <= max;
  };

  const isInPreviewRange = (year: number): boolean => {
    if (rangeStart === null || hoveredYear === null) return false;
    return isYearInRange(year, rangeStart, hoveredYear);
  };

  const isPreviewStart = (year: number): boolean => {
    return rangeStart === year;
  };

  const isPreviewEnd = (year: number): boolean => {
    if (hoveredYear === null || rangeStart === null) return false;
    return hoveredYear === year;
  };

  const handleMouseDown = (year: number) => {
    setRangeStart(year);
    setHoveredYear(year);
    setIsDragging(true);
  };

  const handleMouseEnter = (year: number) => {
    setHoveredYear(year);
    if (!onHover) return;

    // When dragging, show the span range; otherwise show single year preview
    if (rangeStart !== null) {
      const range = getYearSpanRange(rangeStart, year);
      onHover(range);
    } else {
      const range = getYearRange(year);
      onHover(range);
    }
  };

  const handleMouseUp = (year: number) => {
    if (isDragging && rangeStart !== null) {
      const range = getYearSpanRange(rangeStart, year);
      onSelect(range);
      setRangeStart(null);
      setHoveredYear(null);
    }
    setIsDragging(false);
  };

  const handleContainerMouseUp = () => {
    if (isDragging && rangeStart !== null && hoveredYear !== null) {
      const range = getYearSpanRange(rangeStart, hoveredYear);
      onSelect(range);
    }
    setRangeStart(null);
    setHoveredYear(null);
    setIsDragging(false);
  };

  const handleContainerMouseLeave = () => {
    if (!isDragging) {
      setHoveredYear(null);
      onHover?.(null);
    }
  };

  const handleYearSelect = (year: number) => {
    const range = getYearRange(year);
    onSelect(range);
  };

  const isYearSelected = (year: number) => {
    if (!selectedRange) return false;
    const range = getYearRange(year);
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
        <div className="grid grid-cols-3 gap-1.5 overflow-visible py-1">
          {years.map((year) => {
            const isFutureYear = year > currentYear;
            const isSelected = isYearSelected(year);
            const inPreview = isInPreviewRange(year);
            const isStart = isPreviewStart(year);
            const isEnd = isPreviewEnd(year);

            return (
              <Button
                key={year}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-sm font-normal tabular-nums cursor-grab active:cursor-grabbing transition-all",
                  // Preview range styling (in-between items) - override hover/focus states
                  inPreview && !isStart && !isEnd && "bg-accent! border-accent! hover:bg-accent!",
                  // Preview start (anchor point) - solid black with ring
                  isStart && "bg-primary! text-primary-foreground! ring-2 ring-primary ring-offset-1 hover:bg-primary!",
                  // Preview end (current hover) - also solid black with ring
                  isEnd && !isStart && "bg-primary! text-primary-foreground! ring-2 ring-primary ring-offset-1 hover:bg-primary!"
                )}
                disabled={isFutureYear}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!isFutureYear) handleMouseDown(year);
                }}
                onMouseEnter={() => handleMouseEnter(year)}
                onMouseUp={() => {
                  if (!isFutureYear) handleMouseUp(year);
                }}
                onClick={() => {
                  if (!isDragging && !isFutureYear) {
                    handleYearSelect(year);
                  }
                }}
              >
                {year}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
