import Link from "next/link";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AdminSiteShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  navItems: AdminNavItem[];
  children: React.ReactNode;
};

export function AdminSiteShell({ title, subtitle, actions, navItems, children }: AdminSiteShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            {subtitle ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{subtitle}</p> : null}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          {actions}
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:grid-cols-[220px_1fr] sm:px-6">
        <nav className="flex flex-row gap-2 overflow-auto rounded-lg border border-border bg-card p-2 sm:flex-col sm:p-3">
          {navItems.map(({ id, href, label, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              className={cn(
                "flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
