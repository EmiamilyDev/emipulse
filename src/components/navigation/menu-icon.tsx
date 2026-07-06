import {
  Activity,
  CalendarDays,
  GalleryHorizontal,
  House,
  ImageUp,
  LucideIcon,
  Newspaper,
  Settings,
  TrendingUp,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  house: House,
  activity: Activity,
  calendar: CalendarDays,
  gallery: GalleryHorizontal,
  hero: ImageUp,
  news: Newspaper,
  trend: TrendingUp,
  settings: Settings,
};

export function resolveMenuIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return House;
  return iconMap[iconKey] ?? House;
}

export const menuIconOptions = Object.keys(iconMap);