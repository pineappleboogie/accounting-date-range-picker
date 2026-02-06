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
import { PresetMode, PresetUnit, generatePresetLabel } from "./utils";

interface PresetFormProps {
  mode: PresetMode;
  count: number;
  unit: PresetUnit;
  onChange: (data: { mode: PresetMode; count: number; unit: PresetUnit }) => void;
  isEditing?: boolean;
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

  const previewLabel = generatePresetLabel(mode, count, unit);

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="text-sm font-medium">
        {isEditing ? "Edit Preset" : "Create Preset"}
      </div>

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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
            <SelectItem value="years">Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">
        Preview: <span className="font-medium">{previewLabel}</span>
      </div>
    </div>
  );
}
