import {
  fetchGoogleTrendsScore,
  fetchInstagramFollowers,
  fetchYouTubeViews,
} from "@/lib/services/external-apis";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardManualStats, DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  const [
    { data: eventRow },
    { data: newsRow },
    { data: activityRow },
    { data: manualRow },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("title")
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("news")
      .select("title")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("activity_logs")
      .select("action")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("dashboard_manual_stats")
      .select("id, use_manual, instagram_followers, youtube_views, google_trends_score, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const [instagramFollowers, youtubeViews, googleTrendsScore] = await Promise.all([
    fetchInstagramFollowers(),
    fetchYouTubeViews(),
    fetchGoogleTrendsScore(),
  ]);

  const manualStats = manualRow as DashboardManualStats | null;
  const useManual = Boolean(manualStats?.use_manual);

  return {
    instagramFollowers:
      useManual && manualStats?.instagram_followers != null
        ? Number(manualStats.instagram_followers)
        : instagramFollowers,
    youtubeViews:
      useManual && manualStats?.youtube_views != null
        ? Number(manualStats.youtube_views)
        : youtubeViews,
    googleTrendsScore:
      useManual && manualStats?.google_trends_score != null
        ? Number(manualStats.google_trends_score)
        : googleTrendsScore,
    latestEvent: eventRow?.title ?? "No events yet",
    latestNews: newsRow?.title ?? "No news yet",
    recentActivity: activityRow?.action ?? "No activity logged",
  };
}
