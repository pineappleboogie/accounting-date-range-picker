"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
  /** Hide the entire sidebar (presets section) */
  hideSidebar?: boolean;
  /** Hide quick preset buttons (Last Month, Last Quarter, etc.) */
  hideQuickPresets?: boolean;
  /** Hide custom presets section and "Create preset" button */
  hideCustomPresets?: boolean;
  /** Single date selection mode instead of date range */
  singleDateMode?: boolean;
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
  hideSidebar = false,
  hideQuickPresets = false,
  hideCustomPresets = false,
  singleDateMode = false,
}: SidebarPresetsVariantProps) {
  const [activeTab, setActiveTab] = React.useState(() => detectRangeType(value));

  // Hover preview state - shows date range in footer when hovering over presets/picker items
  const [hoverPreview, setHoverPreview] = React.useState<DateRange | null>(null);

  // Custom presets state
  const { presets: customPresets, addPreset, updatePreset, deletePreset } = useCustomPresets();

  // Edit mode state
  const [editMode, setEditMode] = React.useState<{
    active: boolean;
    presetId: string | null;
  }>({ active: false, presetId: null });

  // Form data for creating/editing presets - default to "Last 1 month" (matches Last Month preset)
  const [formData, setFormData] = React.useState<{
    mode: PresetMode;
    count: number;
    unit: PresetUnit;
  }>({
    mode: "last",
    count: 1,
    unit: "months",
  });

  // Form validity state
  const [isFormValid, setIsFormValid] = React.useState(true);

  // Section refs for keyboard navigation
  const presetsRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  usePresetShortcuts(hideQuickPresets ? [] : QUICK_PRESETS, onSelect);

  // Determine if sidebar should be shown
  const showSidebar = !hideSidebar;
  const showQuickPresets = !hideQuickPresets;
  const showCustomPresets = !hideCustomPresets;

  // Build sections array based on what's visible
  const sections = React.useMemo(() => {
    const result: Array<{ ref: React.RefObject<HTMLDivElement | null>; verticalArrowNav?: boolean; focusLast?: boolean }> = [];
    if (showSidebar) {
      result.push({ ref: presetsRef, verticalArrowNav: true });
    }
    result.push({ ref: tabsRef });
    result.push({ ref: contentRef, focusLast: true });
    result.push({ ref: footerRef });
    return result;
  }, [showSidebar]);

  // Section-based Tab navigation
  // Sections vary based on visibility: [presets?] | segmented toggle | period selector | footer
  // Tab/Shift+Tab moves between sections
  // Arrow keys navigate within sections
  useSectionKeyboardNav({
    sections,
    autoFocus: true,
    autoFocusSection: showSidebar ? 1 : 0, // Focus segmented toggle first
  });

  // Handlers for custom presets
  const handleCreateNew = () => {
    setEditMode({ active: true, presetId: null });
    setFormData({ mode: "last", count: 1, unit: "months" });
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

  // Single date mode: just show a simple calendar picker
  if (singleDateMode) {
    return (
      <div className="w-[320px] p-3">
        <DaysPicker value={value} onSelect={onSelect} singleDateMode={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        {/* Left sidebar with presets - conditionally rendered */}
        {showSidebar && (
          <div ref={presetsRef} className="w-[170px] border-r p-2 flex flex-col">
            {/* Built-in presets */}
            {showQuickPresets && (
              <div className="flex flex-col gap-0.5">
                {QUICK_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-between h-8 text-sm font-normal"
                    onClick={() => onSelect(preset.getValue())}
                    onMouseEnter={() => setHoverPreview(preset.getValue())}
                    onMouseLeave={() => setHoverPreview(null)}
                    disabled={editMode.active}
                  >
                    <span>{preset.label}</span>
                    <Kbd shortcut={preset.shortcut} />
                  </Button>
                ))}
              </div>
            )}

            {/* Custom presets */}
            {showCustomPresets && customPresets.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {customPresets.map((preset) => (
                  <CustomPresetItem
                    key={preset.id}
                    preset={preset}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onHover={setHoverPreview}
                    disabled={editMode.active}
                  />
                ))}
              </div>
            )}

            {/* Create new preset button - hidden when in edit mode or when custom presets are hidden */}
            {showCustomPresets && !editMode.active && (
              <div className="mt-auto pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-sm font-normal text-muted-foreground"
                  onClick={handleCreateNew}
                >
                  <Plus className="size-4 mr-2" />
                  Create preset
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Right side - show form or tabs based on edit mode */}
        <div className={cn("w-[360px]", hideSidebar && "w-full")}>
          {editMode.active ? (
            <PresetForm
              mode={formData.mode}
              count={formData.count}
              unit={formData.unit}
              onChange={setFormData}
              onValidChange={setIsFormValid}
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
                  <DaysPicker value={value} onSelect={onSelect} onHover={setHoverPreview} singleDateMode={false} />
                </TabsContent>

                <TabsContent value="month" className="mt-0">
                  <MonthPicker onSelect={onSelect} onHover={setHoverPreview} selectedRange={value} />
                </TabsContent>

                <TabsContent value="quarter" className="mt-0">
                  <QuarterPicker onSelect={onSelect} onHover={setHoverPreview} selectedRange={value} />
                </TabsContent>

                <TabsContent value="half" className="mt-0">
                  <HalfYearPicker onSelect={onSelect} onHover={setHoverPreview} selectedRange={value} />
                </TabsContent>

                <TabsContent value="year" className="mt-0">
                  <YearPicker onSelect={onSelect} onHover={setHoverPreview} selectedRange={value} />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </div>

      {/* Footer - show in edit mode, when value is selected, or when hovering */}
      {(editMode.active || value || hoverPreview) && (
        <>
          <Separator />
          <div ref={footerRef} className="flex items-center justify-between p-3">
            {editMode.active ? (
              <>
                <div />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!isFormValid}>
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className={cn(
                  "text-sm",
                  hoverPreview ? "text-muted-foreground/70" : "text-muted-foreground"
                )}>
                  {formatDateRangeFull(hoverPreview || value)}
                </span>
                {value && !hoverPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(undefined)}
                  >
                    Clear
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
