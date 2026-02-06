"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DateRange,
  getQuarterRange,
  getQuarterSpanRange,
  getCurrentYear,
  getCurrentQuarter,
} from "./utils";
import { useGridKeyboardNav } from "./use-grid-keyboard-nav";

interface QuarterPickerProps {
  onSelect: (range: DateRange) => void;
  selectedRange?: DateRange;
  className?: string;
}

type QuarterPosition = { year: number; quarter: number };

const QUARTERS = [1, 2, 3, 4] as const;
const YEARS_TO_SHOW = 5;

export function QuarterPicker({ onSelect, selectedRange, className }: QuarterPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentYear = getCurrentYear();
  const currentQuarter = getCurrentQuarter();

  // Drag-to-select state
  const [rangeStart, setRangeStart] = React.useState<QuarterPosition | null>(null);
  const [hoveredQuarter, setHoveredQuarter] = React.useState<QuarterPosition | null>(null);
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

  // Convert year/quarter to a comparable number
  const quarterToNumber = (year: number, quarter: number) => year * 4 + quarter;

  const isQuarterInRange = (
    year: number,
    quarter: number,
    start: QuarterPosition,
    end: QuarterPosition
  ): boolean => {
    const current = quarterToNumber(year, quarter);
    const startNum = quarterToNumber(start.year, start.quarter);
    const endNum = quarterToNumber(end.year, end.quarter);
    const [min, max] = startNum <= endNum ? [startNum, endNum] : [endNum, startNum];
    return current >= min && current <= max;
  };

  const isInPreviewRange = (year: number, quarter: number): boolean => {
    if (!rangeStart || !hoveredQuarter) return false;
    return isQuarterInRange(year, quarter, rangeStart, hoveredQuarter);
  };

  const isPreviewStart = (year: number, quarter: number): boolean => {
    if (!rangeStart) return false;
    return rangeStart.year === year && rangeStart.quarter === quarter;
  };

  const isPreviewEnd = (year: number, quarter: number): boolean => {
    if (!hoveredQuarter || !rangeStart) return false;
    return hoveredQuarter.year === year && hoveredQuarter.quarter === quarter;
  };

  const handleMouseDown = (year: number, quarter: number) => {
    setRangeStart({ year, quarter });
    setHoveredQuarter({ year, quarter });
    setIsDragging(true);
  };

  const handleMouseEnter = (year: number, quarter: number) => {
    setHoveredQuarter({ year, quarter });
  };

  const handleMouseUp = (year: number, quarter: number) => {
    if (isDragging && rangeStart) {
      const range = getQuarterSpanRange(rangeStart.year, rangeStart.quarter, year, quarter);
      onSelect(range);
      setRangeStart(null);
      setHoveredQuarter(null);
    }
    setIsDragging(false);
  };

  const handleContainerMouseUp = () => {
    if (isDragging && rangeStart && hoveredQuarter) {
      const range = getQuarterSpanRange(
        rangeStart.year,
        rangeStart.quarter,
        hoveredQuarter.year,
        hoveredQuarter.quarter
      );
      onSelect(range);
    }
    setRangeStart(null);
    setHoveredQuarter(null);
    setIsDragging(false);
  };

  const handleContainerMouseLeave = () => {
    if (!isDragging) {
      setHoveredQuarter(null);
    }
  };

  const handleQuarterSelect = (year: number, quarter: number) => {
    const range = getQuarterRange(year, quarter);
    onSelect(range);
  };

  const isQuarterSelected = (year: number, quarter: number) => {
    if (!selectedRange) return false;
    const range = getQuarterRange(year, quarter);
    return (
      range.from.getTime() === selectedRange.from.getTime() &&
      range.to.getTime() === selectedRange.to.getTime()
    );
  };

  // Keyboard navigation (arrow keys within the grid)
  useGridKeyboardNav({
    containerRef,
    columns: 4,
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
              <div className="grid grid-cols-4 gap-1.5 overflow-visible">
                {QUARTERS.map((quarter) => {
                  const isFutureQuarter =
                    year > currentYear ||
                    (year === currentYear && quarter > currentQuarter);
                  const isSelected = isQuarterSelected(year, quarter);
                  const inPreview = isInPreviewRange(year, quarter);
                  const isStart = isPreviewStart(year, quarter);
                  const isEnd = isPreviewEnd(year, quarter);

                  return (
                    <Button
                      key={`${year}-Q${quarter}`}
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
                      disabled={isFutureQuarter}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!isFutureQuarter) handleMouseDown(year, quarter);
                      }}
                      onMouseEnter={() => {
                        if (!isFutureQuarter) handleMouseEnter(year, quarter);
                      }}
                      onMouseUp={() => {
                        if (!isFutureQuarter) handleMouseUp(year, quarter);
                      }}
                      onClick={() => {
                        if (!isDragging && !isFutureQuarter) {
                          handleQuarterSelect(year, quarter);
                        }
                      }}
                    >
                      Q{quarter}
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
