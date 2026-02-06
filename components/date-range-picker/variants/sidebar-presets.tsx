"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DateRange,
  formatDateRangeFull,
  getLastMonth,
  getLastQuarter,
  getLastYear,
  getYearToDate,
  detectRangeType,
  RangeType,
} from "../utils";
import { usePresetShortcuts } from "../use-preset-shortcuts";
import { useSectionKeyboardNav } from "../use-section-keyboard-nav";
import { Kbd } from "../kbd";
import { DaysPicker } from "../days-picker";
import { MonthPicker } from "../month-picker";
import { QuarterPicker } from "../quarter-picker";
import { HalfYearPicker } from "../half-year-picker";
import { YearPicker } from "../year-picker";

interface SidebarPresetsVariantProps {
  value?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
}

const QUICK_PRESETS = [
  { label: "Last Month", shortcut: "M", getValue: getLastMonth },
  { label: "Last Quarter", shortcut: "Q", getValue: getLastQuarter },
  { label: "Last Year", shortcut: "Y", getValue: getLastYear },
  { label: "Year to Date", shortcut: "T", getValue: getYearToDate },
] as const;

export function SidebarPresetsVariant({
  value,
  onSelect,
}: SidebarPresetsVariantProps) {
  const [activeTab, setActiveTab] = React.useState(() => detectRangeType(value));

  // Section refs for keyboard navigation
  const presetsRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  usePresetShortcuts(QUICK_PRESETS, onSelect);

  // Section-based Tab navigation
  useSectionKeyboardNav({
    sections: [
      { ref: presetsRef },
      { ref: tabsRef },
      { ref: contentRef, focusLast: true },
    ],
    autoFocus: true,
    autoFocusSection: 0, // Focus presets first
  });

  return (
    <div className="flex flex-col">
      <div className="flex">
        {/* Left sidebar with presets */}
        <div ref={presetsRef} className="w-[170px] border-r p-2">
          <div className="flex flex-col gap-0.5">
            {QUICK_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-between h-8 text-sm font-normal"
                onClick={() => onSelect(preset.getValue())}
              >
                <span>{preset.label}</span>
                <Kbd shortcut={preset.shortcut} />
              </Button>
            ))}
          </div>
        </div>

        {/* Right side with tabs and content */}
        <div className="w-[360px]">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RangeType)} className="w-full">
            {/* Segmented control */}
            <div ref={tabsRef} className="px-3 pt-3">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="days" className="text-xs">
                  Day
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs">
                  Month
                </TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs">
                  Quarter
                </TabsTrigger>
                <TabsTrigger value="half" className="text-xs">
                  Half-Year
                </TabsTrigger>
                <TabsTrigger value="year" className="text-xs">
                  Year
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content area */}
            <div ref={contentRef} className="p-3">
              <TabsContent value="days" className="mt-0">
                <DaysPicker value={value} onSelect={onSelect} />
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                <MonthPicker onSelect={onSelect} selectedRange={value} />
              </TabsContent>

              <TabsContent value="quarter" className="mt-0">
                <QuarterPicker onSelect={onSelect} selectedRange={value} />
              </TabsContent>

              <TabsContent value="half" className="mt-0">
                <HalfYearPicker onSelect={onSelect} selectedRange={value} />
              </TabsContent>

              <TabsContent value="year" className="mt-0">
                <YearPicker onSelect={onSelect} selectedRange={value} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Footer with selected range and clear */}
      {value && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-muted-foreground">
              {formatDateRangeFull(value)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(undefined)}
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
