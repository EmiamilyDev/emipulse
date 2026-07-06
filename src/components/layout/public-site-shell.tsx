import { cn } from "@/lib/utils";

type PublicSiteShellProps = {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PublicSiteShell({ sidebar, children, className }: PublicSiteShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="mx-auto grid min-h-screen w-full max-w-[1450px] grid-cols-1 lg:grid-cols-[220px_1fr]">
        {sidebar ? sidebar : null}
        <div className="px-4 py-4 sm:px-6 lg:px-7 lg:py-6">{children}</div>
      </div>
    </div>
  );
}
