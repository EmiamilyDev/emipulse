import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Camera,
  ChartNoAxesCombined,
  MessageCircle,
  Music2,
  Play,
  Search,
  TrendingUp,
} from "lucide-react";
import { PublicSiteShell } from "@/components/layout/public-site-shell";
import { resolveMenuIcon } from "@/components/navigation/menu-icon";
import { getPublicHomeData } from "@/lib/services/public-home";
import { getNavigationMenu } from "@/lib/services/navigation";
import { formatDate, formatNumber } from "@/lib/utils";

function heroImageUrl(path: string | null | undefined) {
  if (!path) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2200&auto=format&fit=crop";
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2200&auto=format&fit=crop";
  }

  return `${baseUrl}/storage/v1/object/public/hero/${path}`;
}

export default async function PublicHomePage() {
  const [data, menuLinks] = await Promise.all([
    getPublicHomeData(),
    getNavigationMenu("public"),
  ]);
  const heroUrl = heroImageUrl(data.hero?.image_path);

  const statCards = [
    {
      title: "Instagram",
      subtitle: "Followers",
      value: "+2,154",
      total: `Total ${formatNumber(data.stats.followers)}`,
      icon: Camera,
    },
    {
      title: "YouTube",
      subtitle: "Views",
      value: "+120K",
      total: `Total ${formatNumber(data.stats.views)}`,
      icon: Play,
    },
    {
      title: "TikTok",
      subtitle: "Views",
      value: "+85K",
      total: "Total 9.6M",
      icon: Music2,
    },
    {
      title: "X (Twitter)",
      subtitle: "Trending",
      value: "#3",
      total: "Total Mentions 16.2K",
      icon: MessageCircle,
    },
    {
      title: "Google Trends",
      subtitle: "Interest Score",
      value: String(data.stats.trendsScore),
      total: `${data.stats.fanIndex}% vs yesterday`,
      icon: TrendingUp,
    },
  ];

  const topContent = [
    { id: "news-1", title: data.news[0]?.title ?? "New Instagram Post", score: "156K", time: "13:02" },
    { id: "news-2", title: data.news[1]?.title ?? "Story Update", score: "89K", time: "11:45" },
    { id: "news-3", title: data.news[2]?.title ?? "TikTok Update", score: "74K", time: "10:20" },
    { id: "event-1", title: data.events[0]?.title ?? "YouTube: Behind the Scene", score: "210K", time: "09:00" },
  ];

  const insights = [
    { label: "Followers", value: "+2,154" },
    { label: "Engagement Rate", value: "+8.7%" },
    { label: "Profile Visits", value: "+6.2%" },
    { label: "Total Mentions", value: "+18.4%" },
  ];

  return (
    <PublicSiteShell
      className="bg-[#f4f0ea] text-zinc-900"
      sidebar={
        <aside className="hidden bg-black px-4 py-6 text-zinc-300 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-5 text-center">
              <p className="font-mono text-4xl leading-none tracking-wider text-white">EMI</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-zinc-400">Pulse</p>
            </div>

            <nav className="mt-7 space-y-2">
              {menuLinks.map(({ id, href, label, icon_key: iconKey }) => {
                const Icon = resolveMenuIcon(iconKey);
                const active = href === "/";

                return (
                <Link
                  key={id}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base transition ${
                    active ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-300"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </button>
          </div>
        </aside>
      }
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm text-zinc-500">Good afternoon, Any! 👋</p>
          <h1 className="font-mono text-lg sm:text-xl">Here&apos;s everything happening with Emi today.</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Last update: {new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
          <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-zinc-700">Live</span>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <main className="space-y-4">
              <section className="relative overflow-hidden rounded-3xl bg-black text-white">
                <div className="relative h-72 w-full">
                  <Image
                    src={heroUrl}
                    alt="Hero"
                    fill
                    priority
                    loading="eager"
                    sizes="(min-width:1280px) 820px, 100vw"
                    className="object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
                  <div className="absolute inset-0 p-6 md:p-8">
                    <p className="text-sm uppercase tracking-[0.24em] text-zinc-300">EMI is</p>
                    <h2 className="mt-3 max-w-sm font-mono text-5xl leading-tight">making moments</h2>
                    <p className="mt-4 text-sm text-zinc-300">Stay close. Stay updated.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-zinc-700">Today at a glance</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {statCards.map(({ title, subtitle, value, total, icon: Icon }) => (
                    <article key={title} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-zinc-700">{title}</p>
                      <p className="text-xs text-zinc-500">{subtitle}</p>
                      <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
                      <p className="mt-1 text-xs text-zinc-500">{total}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Follower Growth</h3>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">Instagram</span>
                  </div>
                  <p className="mt-4 text-4xl font-semibold">{formatNumber(data.stats.followers)}</p>
                  <p className="mt-1 text-sm text-emerald-600">+2,154 (0.17%) vs yesterday</p>
                  <div className="mt-6 flex h-28 items-end gap-2">
                    {[32, 50, 40, 62, 48, 75, 70, 82, 64, 88, 92, 84].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-full bg-gradient-to-t from-rose-300 to-rose-100"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">Top Content Today</h3>
                  <div className="mt-4 space-y-3">
                    {topContent.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                          <p className="text-xs text-zinc-500">{item.time}</p>
                        </div>
                        <span className="text-xs font-semibold text-zinc-600">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Trending Now</h3>
                    <span className="text-xs text-zinc-500">Thailand Trends</span>
                  </div>
                  <ol className="space-y-2 text-sm text-zinc-700">
                    {data.trendingTopics.map((topic, index) => (
                      <li key={topic} className="rounded-lg bg-zinc-50 px-3 py-2">
                        {index + 1}. {topic}
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Latest News</h3>
                    <span className="text-xs text-zinc-500">View all</span>
                  </div>
                  <div className="space-y-3">
                    {(data.news.length
                      ? data.news
                      : [{ id: "empty", title: "No news yet", summary: "Updates will appear here.", published_at: new Date().toISOString() }]
                    ).map((item) => (
                      <article key={item.id} className="rounded-xl bg-zinc-50 px-3 py-2">
                        <h4 className="text-sm font-semibold text-zinc-800">{item.title}</h4>
                        <p className="mt-1 text-xs text-zinc-600">{item.summary ?? "Summary will appear here."}</p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDate(item.published_at)}</p>
                      </article>
                    ))}
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={heroUrl}
                      alt="profile"
                      fill
                      className="object-cover"
                      sizes="48px"
                      loading="lazy"
                      fetchPriority="low"
                    />
                  </div>
                  <p className="text-sm text-zinc-700">Every moment is a story, and every story becomes part of our journey.</p>
                </div>
              </section>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Live Updates</h3>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">All</span>
                </div>
                <div className="space-y-3">
                  {(data.updates.length ? data.updates : [{ id: "none", action: "No updates yet.", created_at: new Date().toISOString() }]).map((item) => (
                    <div key={item.id} className="flex gap-3 border-l border-zinc-200 pl-3">
                      <p className="mt-0.5 text-xs text-zinc-400">{formatDate(item.created_at)}</p>
                      <p className="text-sm text-zinc-700">{item.action}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Upcoming Events</h3>
                  <span className="text-xs text-zinc-500">View all</span>
                </div>
                <div className="space-y-3">
                  {(data.events.length
                    ? data.events
                    : [{ id: "event-empty", title: "No upcoming events", location: "TBD", event_date: new Date().toISOString(), status: "draft" }]
                  ).map((event) => (
                    <article key={event.id} className="rounded-xl bg-zinc-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">{formatDate(event.event_date)}</p>
                      <h4 className="mt-1 text-sm font-semibold text-zinc-800">{event.title}</h4>
                      <p className="text-xs text-zinc-500">{event.location}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Insight</h3>
                  <ChartNoAxesCombined className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="space-y-3">
                  {insights.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">{item.label}</span>
                      <span className="text-xs text-emerald-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
      </div>
    </PublicSiteShell>
  );
}
