"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ControlPanelConfig {
  hideSidebar: boolean;
  hideCustomPresets: boolean;
  singleDateMode: boolean;
}

interface DemoControlPanelProps {
  config: ControlPanelConfig;
  onChange: (config: ControlPanelConfig) => void;
  className?: string;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between py-2", disabled && "opacity-50")}>
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export const defaultConfig: ControlPanelConfig = {
  hideSidebar: false,
  hideCustomPresets: false,
  singleDateMode: false,
};

export function DemoControlPanel({
  config,
  onChange,
  className,
}: DemoControlPanelProps) {
  const updateConfig = (
    key: keyof ControlPanelConfig,
    value: boolean
  ) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className={cn("w-[280px] border-l bg-muted/30 p-4", className)}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Date Range Picker</h2>
        </div>

        <Separator />

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Sidebar
          </h3>
          <ToggleSwitch
            label="Hide sidebar"
            description="Remove the entire presets sidebar"
            checked={config.hideSidebar}
            onChange={(v) => updateConfig("hideSidebar", v)}
            disabled={config.singleDateMode}
          />
          <ToggleSwitch
            label="Hide custom presets"
            description="Remove user-created presets and create button"
            checked={config.hideCustomPresets}
            onChange={(v) => updateConfig("hideCustomPresets", v)}
            disabled={config.singleDateMode}
          />
        </div>

        <Separator />

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Selection Mode
          </h3>
          <ToggleSwitch
            label="Single date mode"
            description="Select a single date instead of a range"
            checked={config.singleDateMode}
            onChange={(v) => updateConfig("singleDateMode", v)}
          />
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onChange(defaultConfig)}
        >
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
