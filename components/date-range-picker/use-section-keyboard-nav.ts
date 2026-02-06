"use client";

import { useEffect, useCallback, RefObject } from "react";

interface Section {
  ref: RefObject<HTMLElement | null>;
  /** Selector for focusable items within this section */
  itemSelector?: string;
  /** Focus the last item instead of first when entering section */
  focusLast?: boolean;
}

interface UseSectionKeyboardNavOptions {
  /** Array of section refs in tab order */
  sections: Section[];
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Auto-focus the first section on mount */
  autoFocus?: boolean;
  /** Index of section to auto-focus (default: 0) */
  autoFocusSection?: number;
}

export function useSectionKeyboardNav({
  sections,
  enabled = true,
  autoFocus = false,
  autoFocusSection = 0,
}: UseSectionKeyboardNavOptions) {
  const getFocusableItems = useCallback(
    (section: Section): HTMLElement[] => {
      if (!section.ref.current) return [];
      const selector = section.itemSelector || "button:not([disabled]), [tabindex]:not([tabindex='-1'])";
      return Array.from(section.ref.current.querySelectorAll(selector));
    },
    []
  );

  const getCurrentSectionIndex = useCallback((): number => {
    const activeElement = document.activeElement;
    if (!activeElement) return -1;

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].ref.current?.contains(activeElement)) {
        return i;
      }
    }
    return -1;
  }, [sections]);

  const focusSection = useCallback(
    (sectionIndex: number, focusLast = false) => {
      const section = sections[sectionIndex];
      if (!section) return;

      const items = getFocusableItems(section);
      if (items.length === 0) return;

      const shouldFocusLast = focusLast || section.focusLast;
      const targetIndex = shouldFocusLast ? items.length - 1 : 0;
      items[targetIndex]?.focus();
    },
    [sections, getFocusableItems]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.key !== "Tab") return;

      const currentSectionIndex = getCurrentSectionIndex();
      if (currentSectionIndex === -1) return;

      const nextIndex = event.shiftKey
        ? currentSectionIndex - 1
        : currentSectionIndex + 1;

      // If moving outside the sections, let default Tab behavior happen
      if (nextIndex < 0 || nextIndex >= sections.length) {
        return;
      }

      // Prevent default and move to next/previous section
      event.preventDefault();
      // When going backwards (Shift+Tab), focus the last item in that section
      focusSection(nextIndex, event.shiftKey);
    },
    [enabled, getCurrentSectionIndex, sections.length, focusSection]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Auto-focus on mount
  useEffect(() => {
    if (!autoFocus || !enabled) return;

    const timer = setTimeout(() => {
      focusSection(autoFocusSection);
    }, 50);

    return () => clearTimeout(timer);
  }, [autoFocus, enabled, autoFocusSection, focusSection]);

  return { focusSection, getCurrentSectionIndex };
}
