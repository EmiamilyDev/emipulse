import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualStatsForm } from "@/components/admin/manual-stats-form";
import { NavigationMenuForm } from "@/components/admin/navigation-menu-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatNumber } from "@/lib/utils";
import { getDashboardStats } from "@/lib/services/dashboard";
import type { DashboardManualStats, NavigationMenuItem } from "@/types";

function isMissingManualStatsTable(errorMessage: string | undefined) {
  if (!errorMessage) return false;
  const message = errorMessage.toLowerCase();
  return message.includes("dashboard_manual_stats") || message.includes("schema cache") || message.includes("could not find the table");
}

function isMissingNavigationMenuTable(errorMessage: string | undefined) {
  if (!errorMessage) return false;
  const message = errorMessage.toLowerCase();
  return message.includes("navigation_menu") || message.includes("schema cache") || message.includes("could not find the table");
}

export default async function AdminDashboardPage() {
  const [stats, supabase] = await Promise.all([getDashboardStats(), createSupabaseServerClient()]);

  const { data: manualStatsRow, error: manualStatsError } = await supabase
    .from("dashboard_manual_stats")
    .select("id, use_manual, instagram_followers, youtube_views, google_trends_score, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const manualStats = (manualStatsRow as DashboardManualStats | null) ?? null;
  const manualStatsTableReady = !isMissingManualStatsTable(manualStatsError?.message);

  const { data: navigationRows, error: navigationError } = await supabase
    .from("navigation_menu")
    .select("id, label, href, icon_key, sort_order, is_active, show_on_public, show_on_admin, created_at")
    .order("sort_order", { ascending: true });

  const navigationItems = (navigationRows as NavigationMenuItem[] | null) ?? [];
  const navigationTableReady = !isMissingNavigationMenuTable(navigationError?.message);

  const cards = [
    {
      title: "Instagram Followers",
      value: formatNumber(stats.instagramFollowers),
      hint: "Placeholder API service",
    },
    {
      title: "YouTube Views",
      value: formatNumber(stats.youtubeViews),
      hint: "Placeholder API service",
    },
    {
      title: "Google Trends",
      value: `${stats.googleTrendsScore}/100`,
      hint: "Placeholder API service",
    },
    {
      title: "Latest Event",
      value: stats.latestEvent,
      hint: "From Supabase events table",
    },
    {
      title: "Latest News",
      value: stats.latestNews,
      hint: "From Supabase news table",
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      hint: "From Supabase activity_logs table",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h2>
        <p className="text-sm text-zinc-600">Real-time admin summary with Supabase-driven content.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-zinc-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <ManualStatsForm initialStats={manualStats} tableReady={manualStatsTableReady} />
      <NavigationMenuForm initialItems={navigationItems} tableReady={navigationTableReady} />
    </div>
  );
}
