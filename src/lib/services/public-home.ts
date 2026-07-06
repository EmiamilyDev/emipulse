import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchGoogleTrendsScore,
  fetchInstagramFollowers,
  fetchYouTubeViews,
} from "@/lib/services/external-apis";
import type { DashboardManualStats } from "@/types";

export async function getPublicHomeData() {
  const supabase = await createSupabaseServerClient();

  const [
    heroResult,
    eventsResult,
    newsResult,
    updatesResult,
    manualResult,
    trendsScore,
    followers,
    views,
  ] = await Promise.all([
    supabase
      .from("hero_banners")
      .select("headline, subtitle, cta_text, cta_link, image_path")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("events")
      .select("id, title, event_date, location, status")
      .eq("status", "published")
      .order("event_date", { ascending: true })
      .limit(4),
    supabase
      .from("news")
      .select("id, title, summary, published_at")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("activity_logs")
      .select("id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("dashboard_manual_stats")
      .select("id, use_manual, instagram_followers, youtube_views, google_trends_score, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1),
    fetchGoogleTrendsScore(),
    fetchInstagramFollowers(),
    fetchYouTubeViews(),
  ]);

  const manualStats = (manualResult.data?.[0] as DashboardManualStats | undefined) ?? null;
  const useManual = Boolean(manualStats?.use_manual);
  const resolvedFollowers =
    useManual && manualStats?.instagram_followers != null
      ? Number(manualStats.instagram_followers)
      : followers;
  const resolvedViews =
    useManual && manualStats?.youtube_views != null
      ? Number(manualStats.youtube_views)
      : views;
  const resolvedTrendsScore =
    useManual && manualStats?.google_trends_score != null
      ? Number(manualStats.google_trends_score)
      : trendsScore;

  return {
    hero: heroResult.data,
    events: eventsResult.data ?? [],
    news: newsResult.data ?? [],
    updates: updatesResult.data ?? [],
    stats: {
      followers: resolvedFollowers,
      views: resolvedViews,
      trendsScore: resolvedTrendsScore,
      fanIndex: Math.round((resolvedFollowers / 100000 + resolvedTrendsScore + resolvedViews / 1000000) / 3),
    },
    trendingTopics: [
      "#EMIWorldTour",
      "#EMIStudioSession",
      "#EMINewDrop",
      "#PulseWithEMI",
      "#FanHighlights",
    ],
  };
}
