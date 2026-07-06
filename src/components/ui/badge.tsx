import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "muted" | "warning" | "error" | "info";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "bg-foreground text-background",
        tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        tone === "error" && "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
        tone === "info" && "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
        className
      )}
      {...props}
    />
  );
}
