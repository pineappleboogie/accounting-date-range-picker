"use client";

import { useEffect, useCallback, RefObject } from "react";

interface UseGridKeyboardNavOptions {
  /** Reference to the container element */
  containerRef: RefObject<HTMLElement | null>;
  /** Number of columns in the grid */
  columns: number;
  /** Selector for focusable items */
  itemSelector?: string;
  /** Called when Enter/Space is pressed on focused item */
  onSelect?: (element: HTMLElement, index: number) => void;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
  /** Automatically focus the last item on mount */
  autoFocus?: boolean;
}

export function useGridKeyboardNav({
  containerRef,
  columns,
  itemSelector = "button:not([disabled])",
  onSelect,
  enabled = true,
  autoFocus = false,
}: UseGridKeyboardNavOptions) {
  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(itemSelector));
  }, [containerRef, itemSelector]);

  const getCurrentIndex = useCallback((): number => {
    const items = getFocusableItems();
    const activeElement = document.activeElement as HTMLElement;
    return items.indexOf(activeElement);
  }, [getFocusableItems]);

  const focusItem = useCallback((index: number) => {
    const items = getFocusableItems();
    if (index >= 0 && index < items.length) {
      items[index].focus();
    }
  }, [getFocusableItems]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const items = getFocusableItems();
      const currentIndex = getCurrentIndex();

      // If no item is focused, don't handle navigation
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      let handled = false;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          handled = true;
          break;
        case "ArrowLeft":
          nextIndex = Math.max(currentIndex - 1, 0);
          handled = true;
          break;
        case "ArrowDown":
          nextIndex = Math.min(currentIndex + columns, items.length - 1);
          handled = true;
          break;
        case "ArrowUp":
          nextIndex = Math.max(currentIndex - columns, 0);
          handled = true;
          break;
        case "Home":
          nextIndex = 0;
          handled = true;
          break;
        case "End":
          nextIndex = items.length - 1;
          handled = true;
          break;
        case "Enter":
        case " ":
          if (onSelect && items[currentIndex]) {
            event.preventDefault();
            onSelect(items[currentIndex], currentIndex);
          }
          return;
      }

      if (handled) {
        event.preventDefault();
        focusItem(nextIndex);
      }
    },
    [enabled, getFocusableItems, getCurrentIndex, columns, focusItem, onSelect]
  );

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, containerRef, handleKeyDown]);

  // Return helper to focus first item
  const focusFirst = useCallback(() => {
    const items = getFocusableItems();
    if (items.length > 0) {
      items[items.length - 1].focus(); // Focus last (most recent) by default
    }
  }, [getFocusableItems]);

  // Auto-focus on mount
  useEffect(() => {
    if (!autoFocus || !enabled) return;
    // Small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      focusFirst();
    }, 50);
    return () => clearTimeout(timer);
  }, [autoFocus, enabled, focusFirst]);

  return { focusFirst, focusItem };
}
