"use client";

import { useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DashboardManualStats } from "@/types";

function asNonNegativeInt(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0) return null;
  return Math.trunc(parsed);
}

type ManualStatsFormProps = {
  initialStats: DashboardManualStats | null;
  tableReady: boolean;
};

function isMissingManualStatsTable(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("dashboard_manual_stats") || normalized.includes("schema cache") || normalized.includes("could not find the table");
}

export function ManualStatsForm({ initialStats, tableReady }: ManualStatsFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [saving, setSaving] = useState(false);

  const [useManual, setUseManual] = useState(Boolean(initialStats?.use_manual));
  const [instagramFollowers, setInstagramFollowers] = useState(
    initialStats?.instagram_followers != null ? String(initialStats.instagram_followers) : ""
  );
  const [youtubeViews, setYoutubeViews] = useState(
    initialStats?.youtube_views != null ? String(initialStats.youtube_views) : ""
  );
  const [googleTrendsScore, setGoogleTrendsScore] = useState(
    initialStats?.google_trends_score != null ? String(initialStats.google_trends_score) : ""
  );

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const followersValue = asNonNegativeInt(instagramFollowers);
    const viewsValue = asNonNegativeInt(youtubeViews);
    const trendsValue = asNonNegativeInt(googleTrendsScore);

    if (instagramFollowers && followersValue == null) {
      toast.error("Instagram followers must be a non-negative number.");
      return;
    }

    if (youtubeViews && viewsValue == null) {
      toast.error("YouTube views must be a non-negative number.");
      return;
    }

    if (googleTrendsScore && trendsValue == null) {
      toast.error("Google trends score must be a non-negative number.");
      return;
    }

    if (trendsValue != null && (trendsValue < 0 || trendsValue > 100)) {
      toast.error("Google trends score must be between 0 and 100.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("dashboard_manual_stats").upsert(
      {
        id: 1,
        use_manual: useManual,
        instagram_followers: followersValue,
        youtube_views: viewsValue,
        google_trends_score: trendsValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    setSaving(false);

    if (error) {
      if (isMissingManualStatsTable(error.message)) {
        toast.error("Manual stats table is missing. Please run the latest Supabase schema SQL and refresh this page.");
        return;
      }
      toast.error(error.message);
      return;
    }

    toast.success("Manual dashboard stats saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Dashboard Override</CardTitle>
        <CardDescription>
          Use this when external APIs are unavailable. Toggle on to force dashboard and public homepage to use manual values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tableReady ? (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Manual override is unavailable because table public.dashboard_manual_stats has not been created yet.
            Please run the SQL from supabase/schema.sql and supabase/seed.sql in Supabase SQL Editor, then refresh this page.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSave}>
          <label className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Enable Manual Mode</p>
              <p className="text-xs text-zinc-500">When enabled, manual values override live API values.</p>
            </div>
            <input
              type="checkbox"
              checked={useManual}
              onChange={(event) => setUseManual(event.target.checked)}
              disabled={!tableReady || saving}
              className="h-4 w-4"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="manual-instagram-followers">Instagram Followers</Label>
              <Input
                id="manual-instagram-followers"
                inputMode="numeric"
                value={instagramFollowers}
                onChange={(event) => setInstagramFollowers(event.target.value)}
                  disabled={!tableReady || saving}
                placeholder="1302154"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-youtube-views">YouTube Views</Label>
              <Input
                id="manual-youtube-views"
                inputMode="numeric"
                value={youtubeViews}
                onChange={(event) => setYoutubeViews(event.target.value)}
                  disabled={!tableReady || saving}
                placeholder="28700000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-google-trends">Google Trends (0-100)</Label>
              <Input
                id="manual-google-trends"
                inputMode="numeric"
                value={googleTrendsScore}
                onChange={(event) => setGoogleTrendsScore(event.target.value)}
                  disabled={!tableReady || saving}
                placeholder="84"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving || !tableReady}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Manual Values
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
