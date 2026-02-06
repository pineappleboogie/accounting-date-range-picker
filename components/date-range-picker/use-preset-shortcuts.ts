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
      // Ignore if meta/ctrl/alt are pressed (let browser handle those)
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
      const hasShift = event.shiftKey;

      // Find matching preset
      const preset = presets.find((p) => {
        const shortcut = p.shortcut.toLowerCase();
        if (shortcut.startsWith("shift+")) {
          // Shift modifier required
          const shortcutKey = shortcut.replace("shift+", "").toUpperCase();
          return hasShift && key === shortcutKey;
        } else {
          // No shift modifier
          return !hasShift && key === p.shortcut.toUpperCase();
        }
      });

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
