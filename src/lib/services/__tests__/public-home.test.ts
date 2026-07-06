import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicHomeData } from "@/lib/services/public-home";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock("@/lib/services/external-apis", () => ({
  fetchInstagramFollowers: vi.fn(async () => 5000),
  fetchYouTubeViews: vi.fn(async () => 1500000),
  fetchGoogleTrendsScore: vi.fn(async () => 88),
}));

describe("getPublicHomeData", () => {
  beforeEach(() => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "hero_banners") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: {
                      headline: "Hello",
                      subtitle: "Sub",
                      cta_text: "Go",
                      cta_link: "/go",
                      image_path: "hero.png",
                    },
                  }),
                }),
              }),
            }),
          }),
        };
      }

      if (table === "events") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({ data: [{ id: "1", title: "Event" }] }),
              }),
            }),
          }),
        };
      }

      if (table === "news") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({ data: [{ id: "n1", title: "News" }] }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          order: () => ({
            limit: async () => ({ data: [{ id: "a1", action: "Update" }] }),
          }),
        }),
      };
    });
  });

  it("builds public home payload", async () => {
    const result = await getPublicHomeData();

    expect(result.hero?.headline).toBe("Hello");
    expect(result.events).toHaveLength(1);
    expect(result.news).toHaveLength(1);
    expect(result.updates).toHaveLength(1);
    expect(result.stats.followers).toBe(5000);
    expect(result.stats.views).toBe(1500000);
    expect(result.stats.trendsScore).toBe(88);
    expect(result.trendingTopics.length).toBeGreaterThan(0);
  });
});
