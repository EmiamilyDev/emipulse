import { AdminSiteShell } from "@/components/layout/admin-site-shell";
import { LogoutButton } from "@/components/admin/logout-button";
import { resolveMenuIcon } from "@/components/navigation/menu-icon";
import { getNavigationMenu } from "@/lib/services/navigation";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const links = await getNavigationMenu("admin");
  const navItems = links.map(({ id, href, label, icon_key: iconKey }) => ({
    id,
    href,
    label,
    icon: resolveMenuIcon(iconKey),
  }));

  return (
    <AdminSiteShell
      title="Admin Console"
      subtitle="EMIPulse"
      actions={<LogoutButton />}
      navItems={navItems}
    >
      {children}
    </AdminSiteShell>
  );
}
