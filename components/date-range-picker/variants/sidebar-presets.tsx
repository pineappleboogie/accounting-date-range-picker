"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import {
  DateRange,
  formatDateRangeFull,
  getLastMonth,
  getLastQuarter,
  getLastYear,
  getYearToDate,
  detectRangeType,
  RangeType,
  PresetMode,
  PresetUnit,
  CustomPreset,
} from "../utils";
import { usePresetShortcuts } from "../use-preset-shortcuts";
import { useSectionKeyboardNav } from "../use-section-keyboard-nav";
import { useCustomPresets } from "../use-custom-presets";
import { Kbd } from "../kbd";
import { DaysPicker } from "../days-picker";
import { MonthPicker } from "../month-picker";
import { QuarterPicker } from "../quarter-picker";
import { HalfYearPicker } from "../half-year-picker";
import { YearPicker } from "../year-picker";
import { PresetForm } from "../preset-form";
import { CustomPresetItem } from "../custom-preset-item";

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

  // Custom presets state
  const { presets: customPresets, addPreset, updatePreset, deletePreset } = useCustomPresets();

  // Edit mode state
  const [editMode, setEditMode] = React.useState<{
    active: boolean;
    presetId: string | null;
  }>({ active: false, presetId: null });

  // Form data for creating/editing presets
  const [formData, setFormData] = React.useState<{
    mode: PresetMode;
    count: number;
    unit: PresetUnit;
  }>({
    mode: "last",
    count: 7,
    unit: "days",
  });

  // Section refs for keyboard navigation
  const presetsRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  usePresetShortcuts(QUICK_PRESETS, onSelect);

  // Section-based Tab navigation
  // Sections: presets (0) | segmented toggle (1) | period selector (2) | footer (3)
  // Tab/Shift+Tab moves between sections
  // Arrow keys navigate within sections
  useSectionKeyboardNav({
    sections: [
      { ref: presetsRef, verticalArrowNav: true }, // Up/Down for presets list
      { ref: tabsRef }, // Radix Tabs handles Left/Right internally
      { ref: contentRef, focusLast: true }, // Grid navigation handled by useGridKeyboardNav
      { ref: footerRef }, // Footer buttons (Clear, or Cancel/Save in edit mode)
    ],
    autoFocus: true,
    autoFocusSection: 1, // Focus segmented toggle first (view selector)
  });

  // Handlers for custom presets
  const handleCreateNew = () => {
    setEditMode({ active: true, presetId: null });
    setFormData({ mode: "last", count: 7, unit: "days" });
  };

  const handleEdit = (preset: CustomPreset) => {
    setEditMode({ active: true, presetId: preset.id });
    setFormData({ mode: preset.mode, count: preset.count, unit: preset.unit });
  };

  const handleSave = () => {
    if (editMode.presetId) {
      updatePreset(editMode.presetId, formData);
    } else {
      addPreset(formData);
    }
    setEditMode({ active: false, presetId: null });
  };

  const handleCancel = () => {
    setEditMode({ active: false, presetId: null });
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        {/* Left sidebar with presets */}
        <div ref={presetsRef} className="w-[170px] border-r p-2 flex flex-col">
          {/* Built-in presets */}
          <div className="flex flex-col gap-0.5">
            {QUICK_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-between h-8 text-sm font-normal"
                onClick={() => onSelect(preset.getValue())}
                disabled={editMode.active}
              >
                <span>{preset.label}</span>
                <Kbd shortcut={preset.shortcut} />
              </Button>
            ))}
          </div>

          {/* Custom presets */}
          {customPresets.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="flex flex-col gap-0.5">
                {customPresets.map((preset) => (
                  <CustomPresetItem
                    key={preset.id}
                    preset={preset}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    disabled={editMode.active}
                  />
                ))}
              </div>
            </>
          )}

          {/* Create new preset button */}
          <div className="mt-auto pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm font-normal text-muted-foreground"
              onClick={handleCreateNew}
              disabled={editMode.active}
            >
              <Plus className="size-4 mr-2" />
              Create preset
            </Button>
          </div>
        </div>

        {/* Right side - show form or tabs based on edit mode */}
        <div className="w-[360px]">
          {editMode.active ? (
            <PresetForm
              mode={formData.mode}
              count={formData.count}
              unit={formData.unit}
              onChange={setFormData}
              isEditing={editMode.presetId !== null}
            />
          ) : (
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
          )}
        </div>
      </div>

      {/* Footer - changes based on edit mode */}
      {editMode.active ? (
        <>
          <Separator />
          <div ref={footerRef} className="flex items-center justify-end gap-2 p-3">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </>
      ) : (
        value && (
          <>
            <Separator />
            <div ref={footerRef} className="flex items-center justify-between p-3">
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
        )
      )}
    </div>
  );
}
