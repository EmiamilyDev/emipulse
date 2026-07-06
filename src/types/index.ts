export type PublishStatus = "draft" | "published";

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  status: PublishStatus;
  image_path: string | null;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  image_path: string;
  caption: string | null;
  event_id: string | null;
  created_at: string;
};

export type HeroBanner = {
  id: string;
  headline: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  instagramFollowers: number;
  youtubeViews: number;
  googleTrendsScore: number;
  latestEvent: string;
  latestNews: string;
  recentActivity: string;
};

export type DashboardManualStats = {
  id: number;
  use_manual: boolean;
  instagram_followers: number | null;
  youtube_views: number | null;
  google_trends_score: number | null;
  updated_at: string;
};

export type NavigationMenuItem = {
  id: string;
  label: string;
  href: string;
  icon_key: string;
  sort_order: number;
  is_active: boolean;
  show_on_public: boolean;
  show_on_admin: boolean;
  created_at: string;
};
