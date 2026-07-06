import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NavigationMenuItem } from "@/types";

const fallbackMenu: NavigationMenuItem[] = [
  {
    id: "fallback-public-home",
    label: "Public Home",
    href: "/",
    icon_key: "house",
    sort_order: 10,
    is_active: true,
    show_on_public: true,
    show_on_admin: true,
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-dashboard",
    label: "Dashboard",
    href: "/admin",
    icon_key: "activity",
    sort_order: 20,
    is_active: true,
    show_on_public: true,
    show_on_admin: true,
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-events",
    label: "Events",
    href: "/admin/events",
    icon_key: "calendar",
    sort_order: 30,
    is_active: true,
    show_on_public: true,
    show_on_admin: true,
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-gallery",
    label: "Gallery",
    href: "/admin/gallery",
    icon_key: "gallery",
    sort_order: 40,
    is_active: true,
    show_on_public: true,
    show_on_admin: true,
    created_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-hero",
    label: "Hero Banner",
    href: "/admin/hero",
    icon_key: "hero",
    sort_order: 50,
    is_active: true,
    show_on_public: true,
    show_on_admin: true,
    created_at: new Date(0).toISOString(),
  },
];

function isMissingTableMessage(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("navigation_menu") || normalized.includes("schema cache") || normalized.includes("could not find the table");
}

export async function getNavigationMenu(scope: "public" | "admin") {
  const supabase = await createSupabaseServerClient();
  const visibilityColumn = scope === "public" ? "show_on_public" : "show_on_admin";

  const { data, error } = await supabase
    .from("navigation_menu")
    .select("id, label, href, icon_key, sort_order, is_active, show_on_public, show_on_admin, created_at")
    .eq("is_active", true)
    .eq(visibilityColumn, true)
    .order("sort_order", { ascending: true });

  if (error && !isMissingTableMessage(error.message)) {
    return fallbackMenu.filter((item) => (scope === "public" ? item.show_on_public : item.show_on_admin));
  }

  if (!data || data.length === 0) {
    return fallbackMenu.filter((item) => (scope === "public" ? item.show_on_public : item.show_on_admin));
  }

  return data as NavigationMenuItem[];
}