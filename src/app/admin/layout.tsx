import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionUser, isAdminUser } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isAdminUser(user.id);

  if (!isAdmin) {
    redirect("/login?error=forbidden");
  }

  return <AdminShell>{children}</AdminShell>;
}
