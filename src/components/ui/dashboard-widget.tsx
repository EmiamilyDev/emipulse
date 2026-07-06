import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trendVariants = cva("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", {
  variants: {
    trend: {
      neutral: "bg-muted text-muted-foreground",
      positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      negative: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

type DashboardWidgetProps = VariantProps<typeof trendVariants> & {
  title: string;
  value: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  footer?: React.ReactNode;
  className?: string;
};

export function DashboardWidget({
  title,
  value,
  description,
  icon: Icon,
  trend,
  footer,
  className,
}: DashboardWidgetProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? (
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-0">
        <p className="text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
        {description ? (
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
            <span className={trendVariants({ trend })}>{description}</span>
          </p>
        ) : null}
        {footer ? <div className="pt-1 text-xs text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
