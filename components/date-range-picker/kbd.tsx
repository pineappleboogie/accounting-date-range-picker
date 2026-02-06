import { cn } from "@/lib/utils";

interface KbdProps {
  shortcut: string;
  className?: string;
}

export function Kbd({ shortcut, className }: KbdProps) {
  // Check if shortcut has shift modifier
  const hasShift = /shift\+/i.test(shortcut);
  const key = shortcut.replace(/shift\+/i, "").toUpperCase();

  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {hasShift && <span className="font-sans mr-0.5">⇧</span>}
      <span className="font-mono">{key}</span>
    </kbd>
  );
}
