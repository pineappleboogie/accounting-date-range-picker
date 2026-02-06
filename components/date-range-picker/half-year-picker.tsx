"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange, getHalfYearRange, getHalfYearSpanRange, getCurrentYear } from "./utils";
import { useGridKeyboardNav } from "./use-grid-keyboard-nav";

interface HalfYearPickerProps {
  onSelect: (range: DateRange) => void;
  onHover?: (range: DateRange | null) => void;
  selectedRange?: DateRange;
  className?: string;
}

type HalfPosition = { year: number; half: 1 | 2 };

const HALVES = [1, 2] as const;
const YEARS_TO_SHOW = 5;

export function HalfYearPicker({ onSelect, onHover, selectedRange, className }: HalfYearPickerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentYear = getCurrentYear();
  const currentMonth = new Date().getMonth();
  const currentHalf = currentMonth < 6 ? 1 : 2;

  // Drag-to-select state
  const [rangeStart, setRangeStart] = React.useState<HalfPosition | null>(null);
  const [hoveredHalf, setHoveredHalf] = React.useState<HalfPosition | null>(null);
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

  // Convert year/half to a comparable number
  const halfToNumber = (year: number, half: number) => year * 2 + half;

  const isHalfInRange = (
    year: number,
    half: 1 | 2,
    start: HalfPosition,
    end: HalfPosition
  ): boolean => {
    const current = halfToNumber(year, half);
    const startNum = halfToNumber(start.year, start.half);
    const endNum = halfToNumber(end.year, end.half);
    const [min, max] = startNum <= endNum ? [startNum, endNum] : [endNum, startNum];
    return current >= min && current <= max;
  };

  const isInPreviewRange = (year: number, half: 1 | 2): boolean => {
    if (!rangeStart || !hoveredHalf) return false;
    return isHalfInRange(year, half, rangeStart, hoveredHalf);
  };

  const isPreviewStart = (year: number, half: 1 | 2): boolean => {
    if (!rangeStart) return false;
    return rangeStart.year === year && rangeStart.half === half;
  };

  const isPreviewEnd = (year: number, half: 1 | 2): boolean => {
    if (!hoveredHalf || !rangeStart) return false;
    return hoveredHalf.year === year && hoveredHalf.half === half;
  };

  const handleMouseDown = (year: number, half: 1 | 2) => {
    setRangeStart({ year, half });
    setHoveredHalf({ year, half });
    setIsDragging(true);
  };

  const handleMouseEnter = (year: number, half: 1 | 2) => {
    setHoveredHalf({ year, half });
    if (!onHover) return;

    // When dragging, show the span range; otherwise show single half-year preview
    if (rangeStart) {
      const range = getHalfYearSpanRange(rangeStart.year, rangeStart.half, year, half);
      onHover(range);
    } else {
      const range = getHalfYearRange(year, half);
      onHover(range);
    }
  };

  const handleMouseUp = (year: number, half: 1 | 2) => {
    if (isDragging && rangeStart) {
      const range = getHalfYearSpanRange(rangeStart.year, rangeStart.half, year, half);
      onSelect(range);
      setRangeStart(null);
      setHoveredHalf(null);
    }
    setIsDragging(false);
  };

  const handleContainerMouseUp = () => {
    if (isDragging && rangeStart && hoveredHalf) {
      const range = getHalfYearSpanRange(
        rangeStart.year,
        rangeStart.half,
        hoveredHalf.year,
        hoveredHalf.half
      );
      onSelect(range);
    }
    setRangeStart(null);
    setHoveredHalf(null);
    setIsDragging(false);
  };

  const handleContainerMouseLeave = () => {
    if (!isDragging) {
      setHoveredHalf(null);
      onHover?.(null);
    }
  };

  const handleHalfYearSelect = (year: number, half: 1 | 2) => {
    const range = getHalfYearRange(year, half);
    onSelect(range);
  };

  const isHalfSelected = (year: number, half: 1 | 2) => {
    if (!selectedRange) return false;
    const range = getHalfYearRange(year, half);
    return (
      range.from.getTime() === selectedRange.from.getTime() &&
      range.to.getTime() === selectedRange.to.getTime()
    );
  };

  // Keyboard navigation (arrow keys within the grid)
  useGridKeyboardNav({
    containerRef,
    columns: 2,
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
              <div className="grid grid-cols-2 gap-1.5 overflow-visible">
                {HALVES.map((half) => {
                  const isFutureHalf =
                    year > currentYear ||
                    (year === currentYear && half > currentHalf);
                  const isSelected = isHalfSelected(year, half);
                  const inPreview = isInPreviewRange(year, half);
                  const isStart = isPreviewStart(year, half);
                  const isEnd = isPreviewEnd(year, half);

                  return (
                    <Button
                      key={`${year}-H${half}`}
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
                      disabled={isFutureHalf}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!isFutureHalf) handleMouseDown(year, half);
                      }}
                      onMouseEnter={() => handleMouseEnter(year, half)}
                      onMouseUp={() => {
                        if (!isFutureHalf) handleMouseUp(year, half);
                      }}
                      onClick={() => {
                        if (!isDragging && !isFutureHalf) {
                          handleHalfYearSelect(year, half);
                        }
                      }}
                    >
                      H{half}
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
