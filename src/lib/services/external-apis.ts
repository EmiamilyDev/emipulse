type JsonValue = Record<string, unknown>;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fetchJson(url: string, init?: RequestInit): Promise<JsonValue> {
  const response = await fetch(url, {
    ...init,
    next: { revalidate: 300 },
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`External API request failed: ${response.status}`);
  }

  const data = (await response.json()) as JsonValue;
  return data;
}

export async function fetchInstagramFollowers() {
  const igUserId = process.env.INSTAGRAM_IG_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    return 3214567;
  }

  try {
    const endpoint = new URL(`https://graph.facebook.com/v23.0/${igUserId}`);
    endpoint.searchParams.set("fields", "followers_count");
    endpoint.searchParams.set("access_token", accessToken);

    const data = await fetchJson(endpoint.toString());
    return toNumber(data.followers_count, 3214567);
  } catch {
    return 3214567;
  }
}

export async function fetchYouTubeViews() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return 128992331;
  }

  try {
    const endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
    endpoint.searchParams.set("part", "statistics");
    endpoint.searchParams.set("id", channelId);
    endpoint.searchParams.set("key", apiKey);

    const data = await fetchJson(endpoint.toString());
    const items = Array.isArray(data.items) ? data.items : [];
    const statistics = (items[0] as JsonValue | undefined)?.statistics as JsonValue | undefined;

    return toNumber(statistics?.viewCount, 128992331);
  } catch {
    return 128992331;
  }
}

export async function fetchGoogleTrendsScore() {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  const keyword = process.env.GOOGLE_TRENDS_KEYWORD || "EMI";

  if (!serpApiKey) {
    return 84;
  }

  try {
    const endpoint = new URL("https://serpapi.com/search.json");
    endpoint.searchParams.set("engine", "google_trends");
    endpoint.searchParams.set("q", keyword);
    endpoint.searchParams.set("data_type", "TIMESERIES");
    endpoint.searchParams.set("api_key", serpApiKey);

    const data = await fetchJson(endpoint.toString());
    const timeline = Array.isArray(data.interest_over_time?.timeline_data)
      ? (data.interest_over_time as JsonValue).timeline_data
      : [];

    const latest = timeline.at(-1) as JsonValue | undefined;
    const values = Array.isArray(latest?.values) ? (latest?.values as JsonValue[]) : [];
    const firstValue = values[0]?.extracted_value;

    return toNumber(firstValue, 84);
  } catch {
    return 84;
  }
}
