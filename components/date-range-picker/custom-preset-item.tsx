"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { CustomPreset, calculatePresetRange, DateRange } from "./utils";
import { cn } from "@/lib/utils";

interface CustomPresetItemProps {
  preset: CustomPreset;
  onSelect: (range: DateRange) => void;
  onEdit: (preset: CustomPreset) => void;
  onDelete: (id: string) => void;
  onHover?: (range: DateRange | null) => void;
  disabled?: boolean;
}

export function CustomPresetItem({
  preset,
  onSelect,
  onEdit,
  onDelete,
  onHover,
  disabled,
}: CustomPresetItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    const range = calculatePresetRange(preset);
    onSelect(range);
  };

  const handleMouseEnter = () => {
    setShowActions(true);
    if (onHover) {
      const range = calculatePresetRange(preset);
      onHover(range);
    }
  };

  const handleMouseLeave = () => {
    setShowActions(false);
    onHover?.(null);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
              }}
              disabled={disabled}
            >
              <Trash2 className="size-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete preset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{preset.label}&rdquo;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(preset.id)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
