"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "./utils";
import { DateRange as DayPickerDateRange } from "react-day-picker";

interface CustomRangeProps {
  value?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
}

export function CustomRange({ value, onSelect, className }: CustomRangeProps) {
  const handleSelect = (range: DayPickerDateRange | undefined) => {
    if (range?.from && range?.to) {
      onSelect({ from: range.from, to: range.to });
    } else if (range?.from) {
      // Partial selection, keep it for the UI but don't call onSelect yet
    }
  };

  return (
    <div className={cn("", className)}>
      <Calendar
        mode="range"
        selected={value ? { from: value.from, to: value.to } : undefined}
        onSelect={handleSelect}
        numberOfMonths={2}
        disabled={{ after: new Date() }}
        defaultMonth={value?.from || new Date()}
      />
    </div>
  );
}
