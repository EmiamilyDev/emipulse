import { CheckCircle2, Clock3, CircleDashed, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Status = "published" | "draft" | "scheduled" | "archived" | "failed";

type StatusBadgeProps = {
  status: Status;
};

const statusConfig: Record<Status, { label: string; tone: "success" | "muted" | "info" | "warning" | "error"; icon: React.ComponentType<{ className?: string }> }> = {
  published: { label: "Published", tone: "success", icon: CheckCircle2 },
  draft: { label: "Draft", tone: "muted", icon: CircleDashed },
  scheduled: { label: "Scheduled", tone: "info", icon: Clock3 },
  archived: { label: "Archived", tone: "warning", icon: AlertCircle },
  failed: { label: "Failed", tone: "error", icon: XCircle },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, tone, icon: Icon } = statusConfig[status];

  return (
    <Badge tone={tone} className="inline-flex items-center gap-1.5 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
