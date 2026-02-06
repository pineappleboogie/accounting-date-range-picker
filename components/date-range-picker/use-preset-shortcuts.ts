"use client";

import { useEffect } from "react";
import { DateRange } from "./utils";

interface PresetWithShortcut {
  label: string;
  shortcut: string;
  getValue: () => DateRange;
}

export function usePresetShortcuts(
  presets: readonly PresetWithShortcut[],
  onSelect: (range: DateRange | undefined) => void
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if modifier keys are pressed (let browser handle those)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Ignore if focus is on an input element
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toUpperCase();
      const preset = presets.find((p) => p.shortcut.toUpperCase() === key);

      if (preset) {
        event.preventDefault();
        onSelect(preset.getValue());
        // Blur active element to remove focus ring after selection
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [presets, onSelect]);
}
