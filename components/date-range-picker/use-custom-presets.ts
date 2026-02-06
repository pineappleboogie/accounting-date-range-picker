"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomPreset, PresetMode, PresetUnit, generatePresetLabel } from "./utils";

const STORAGE_KEY = "date-picker-custom-presets";

export function useCustomPresets() {
  const [presets, setPresets] = useState<CustomPreset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load custom presets:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever presets change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      } catch (error) {
        console.error("Failed to save custom presets:", error);
      }
    }
  }, [presets, isLoaded]);

  const addPreset = useCallback(
    (data: { mode: PresetMode; count: number; unit: PresetUnit }) => {
      const newPreset: CustomPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mode: data.mode,
        count: data.count,
        unit: data.unit,
        label: generatePresetLabel(data.mode, data.count, data.unit),
        createdAt: Date.now(),
      };
      setPresets((prev) => [...prev, newPreset]);
      return newPreset;
    },
    []
  );

  const updatePreset = useCallback(
    (id: string, data: { mode: PresetMode; count: number; unit: PresetUnit }) => {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                mode: data.mode,
                count: data.count,
                unit: data.unit,
                label: generatePresetLabel(data.mode, data.count, data.unit),
              }
            : p
        )
      );
    },
    []
  );

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    presets,
    isLoaded,
    addPreset,
    updatePreset,
    deletePreset,
  };
}
