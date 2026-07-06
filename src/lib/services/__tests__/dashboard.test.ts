import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardStats } from "@/lib/services/dashboard";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock("@/lib/services/external-apis", () => ({
  fetchInstagramFollowers: vi.fn(async () => 1000),
  fetchYouTubeViews: vi.fn(async () => 2000),
  fetchGoogleTrendsScore: vi.fn(async () => 75),
}));

describe("getDashboardStats", () => {
  beforeEach(() => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "events") {
        return {
          select: () => ({
            order: () => ({
              limit: () => ({ maybeSingle: async () => ({ data: { title: "EMI Fan Meet" } }) }),
            }),
          }),
        };
      }

      if (table === "news") {
        return {
          select: () => ({
            order: () => ({
              limit: () => ({ maybeSingle: async () => ({ data: { title: "New single announced" } }) }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          order: () => ({
            limit: () => ({ maybeSingle: async () => ({ data: { action: "Gallery image uploaded" } }) }),
          }),
        }),
      };
    });
  });

  it("returns dashboard cards data", async () => {
    const result = await getDashboardStats();

    expect(result.instagramFollowers).toBe(1000);
    expect(result.youtubeViews).toBe(2000);
    expect(result.googleTrendsScore).toBe(75);
    expect(result.latestEvent).toBe("EMI Fan Meet");
    expect(result.latestNews).toBe("New single announced");
    expect(result.recentActivity).toBe("Gallery image uploaded");
  });
});
