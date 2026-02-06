import { cn } from "@/lib/utils";

interface KbdProps {
  shortcut: string;
  className?: string;
}

export function Kbd({ shortcut, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {shortcut}
    </kbd>
  );
}
