import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchGoogleTrendsScore,
  fetchInstagramFollowers,
  fetchYouTubeViews,
} from "@/lib/services/external-apis";

describe("external API services", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete process.env.INSTAGRAM_IG_USER_ID;
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    delete process.env.YOUTUBE_API_KEY;
    delete process.env.YOUTUBE_CHANNEL_ID;
    delete process.env.SERPAPI_API_KEY;
    delete process.env.GOOGLE_TRENDS_KEYWORD;
  });

  it("fetches Instagram followers from Graph API", async () => {
    process.env.INSTAGRAM_IG_USER_ID = "123";
    process.env.INSTAGRAM_ACCESS_TOKEN = "token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ followers_count: 7777777 }),
      })
    );

    const value = await fetchInstagramFollowers();
    expect(value).toBe(7777777);
  });

  it("fetches YouTube views from Data API", async () => {
    process.env.YOUTUBE_API_KEY = "key";
    process.env.YOUTUBE_CHANNEL_ID = "channel";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [{ statistics: { viewCount: "1288" } }],
        }),
      })
    );

    const value = await fetchYouTubeViews();
    expect(value).toBe(1288);
  });

  it("fetches Google Trends score from SerpApi", async () => {
    process.env.SERPAPI_API_KEY = "serp-key";
    process.env.GOOGLE_TRENDS_KEYWORD = "EMI";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          interest_over_time: {
            timeline_data: [
              { values: [{ extracted_value: 61 }] },
              { values: [{ extracted_value: 78 }] },
            ],
          },
        }),
      })
    );

    const value = await fetchGoogleTrendsScore();
    expect(value).toBe(78);
  });

  it("falls back to defaults when request fails", async () => {
    process.env.INSTAGRAM_IG_USER_ID = "123";
    process.env.INSTAGRAM_ACCESS_TOKEN = "token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      })
    );

    const value = await fetchInstagramFollowers();
    expect(value).toBe(3214567);
  });
});
