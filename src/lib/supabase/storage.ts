import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function getStoragePublicUrl(bucket: string, path: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function createStoragePath(fileName: string) {
  const normalized = fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
  return `${Date.now()}-${normalized}`;
}
