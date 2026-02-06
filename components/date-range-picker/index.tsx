"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange, formatDateRange } from "./utils";
import { SidebarPresetsVariant } from "./variants/sidebar-presets";
import { Kbd } from "./kbd";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Keyboard shortcut to open the picker (e.g., "P" for Cmd/Ctrl+P) */
  shortcut?: string;
  /** Hide the entire sidebar (presets section) */
  hideSidebar?: boolean;
  /** Hide quick preset buttons (Last Month, Last Quarter, etc.) */
  hideQuickPresets?: boolean;
  /** Hide custom presets section and "Create preset" button */
  hideCustomPresets?: boolean;
  /** Single date selection mode instead of date range */
  singleDateMode?: boolean;
}

const isMac =
  typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  shortcut = "P",
  hideSidebar = false,
  hideQuickPresets = false,
  hideCustomPresets = false,
  singleDateMode = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      onChange?.(range);
      if (range) {
        setOpen(false);
        setShowTooltip(false);
        requestAnimationFrame(() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        });
      }
    },
    [onChange]
  );

  // Global keyboard shortcut to open picker
  React.useEffect(() => {
    if (disabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
      if (modifierPressed && event.key.toUpperCase() === shortcut.toUpperCase()) {
        event.preventDefault();
        setShowTooltip(false);
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, shortcut]);

  // Clean up timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (open) return;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  const modifierKey = isMac ? "⌘" : "Ctrl";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative inline-block">
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? formatDateRange(value) : placeholder}
          </Button>
        </PopoverTrigger>
        {showTooltip && !open && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs flex items-center gap-2 whitespace-nowrap animate-in fade-in-0 zoom-in-95"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span>Open date picker</span>
            <Kbd shortcut={`${modifierKey}${shortcut}`} />
          </div>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <SidebarPresetsVariant
          value={value}
          onSelect={handleSelect}
          hideSidebar={hideSidebar}
          hideQuickPresets={hideQuickPresets}
          hideCustomPresets={hideCustomPresets}
          singleDateMode={singleDateMode}
        />
      </PopoverContent>
    </Popover>
  );
}
