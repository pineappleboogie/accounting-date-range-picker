"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CustomPreset, calculatePresetRange, DateRange } from "./utils";
import { cn } from "@/lib/utils";

interface CustomPresetItemProps {
  preset: CustomPreset;
  onSelect: (range: DateRange) => void;
  onEdit: (preset: CustomPreset) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function CustomPresetItem({
  preset,
  onSelect,
  onEdit,
  onDelete,
  disabled,
}: CustomPresetItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    const range = calculatePresetRange(preset);
    onSelect(range);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Button
        variant="ghost"
        size="sm"
        className="justify-start w-full h-8 text-sm font-normal pr-16"
        onClick={handleClick}
        disabled={disabled}
      >
        {preset.label}
      </Button>

      <div
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity",
          showActions && !disabled ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(preset);
          }}
          disabled={disabled}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(preset.id);
          }}
          disabled={disabled}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
