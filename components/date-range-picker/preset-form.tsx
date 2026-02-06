"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PresetMode,
  PresetUnit,
  CustomPreset,
  calculatePresetRange,
  formatDateRangeFull,
} from "./utils";

interface PresetFormProps {
  mode: PresetMode;
  count: number;
  unit: PresetUnit;
  onChange: (data: { mode: PresetMode; count: number; unit: PresetUnit }) => void;
  isEditing?: boolean;
}

// Get singular form of unit
function getUnitLabel(unit: PresetUnit, plural: boolean): string {
  const labels: Record<PresetUnit, { singular: string; plural: string }> = {
    days: { singular: "Day", plural: "Days" },
    weeks: { singular: "Week", plural: "Weeks" },
    months: { singular: "Month", plural: "Months" },
    years: { singular: "Year", plural: "Years" },
  };
  return plural ? labels[unit].plural : labels[unit].singular;
}

export function PresetForm({
  mode,
  count,
  unit,
  onChange,
  isEditing,
}: PresetFormProps) {
  const handleModeChange = (newMode: PresetMode) => {
    onChange({ mode: newMode, count, unit });
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Math.max(1, parseInt(e.target.value) || 1);
    onChange({ mode, count: newCount, unit });
  };

  const handleUnitChange = (newUnit: PresetUnit) => {
    onChange({ mode, count, unit: newUnit });
  };

  // Calculate actual date range for preview
  const previewPreset: CustomPreset = {
    id: "preview",
    mode,
    count,
    unit,
    label: "",
    createdAt: 0,
  };
  const previewRange = calculatePresetRange(previewPreset);
  const previewDateRange = formatDateRangeFull(previewRange);

  // For "this" mode or count=1, use singular; otherwise plural
  const usePlural = mode === "last" && count > 1;

  // Match the Tabs structure exactly:
  // - Tabs component: flex flex-col gap-2 (8px gap between TabsList and TabsContent)
  // - TabsList wrapper: px-3 pt-3 with h-9 TabsList
  // - Content wrapper: p-3 with h-[280px] scroll area
  return (
    <div className="flex flex-col gap-2">
      {/* Header area - matches TabsList wrapper structure */}
      <div className="px-3 pt-3">
        <div className="h-9 flex items-center">
          <span className="text-sm font-medium">
            {isEditing ? "Edit Preset" : "Create Preset"}
          </span>
        </div>
      </div>

      {/* Content area - matches picker content structure */}
      <div className="p-3">
        <div className="h-[280px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last">Last</SelectItem>
                  <SelectItem value="this">This</SelectItem>
                </SelectContent>
              </Select>

              {mode === "last" && (
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={count}
                  onChange={handleCountChange}
                  className="w-[70px]"
                />
              )}

              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue>{getUnitLabel(unit, usePlural)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">{getUnitLabel("days", usePlural)}</SelectItem>
                  <SelectItem value="weeks">{getUnitLabel("weeks", usePlural)}</SelectItem>
                  <SelectItem value="months">{getUnitLabel("months", usePlural)}</SelectItem>
                  <SelectItem value="years">{getUnitLabel("years", usePlural)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground">
              Preview: <span className="font-medium">{previewDateRange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
