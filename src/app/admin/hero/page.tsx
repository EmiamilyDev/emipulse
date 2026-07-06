"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createStoragePath, getStoragePublicUrl } from "@/lib/supabase/storage";
import type { HeroBanner } from "@/types";

type FormState = {
  headline: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
};

const defaultState: FormState = {
  headline: "EMIPulse: Live fan pulse, every day.",
  subtitle: "Track stats, trends, and moments from one clean dashboard.",
  cta_text: "View Updates",
  cta_link: "/#live-updates",
};

export default function HeroBannerPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [activeHero, setActiveHero] = useState<HeroBanner | null>(null);
  const [state, setState] = useState<FormState>(defaultState);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const filePreviewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    void loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  async function loadHero() {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const hero = (data as HeroBanner | null) ?? null;
    setActiveHero(hero);

    if (hero) {
      setState({
        headline: hero.headline,
        subtitle: hero.subtitle,
        cta_text: hero.cta_text,
        cta_link: hero.cta_link,
      });
      setPreviewUrl(getStoragePublicUrl("hero", hero.image_path));
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!file && !activeHero?.image_path) {
      toast.error("Please upload a hero image.");
      return;
    }

    setSaving(true);

    try {
      let imagePath = activeHero?.image_path ?? "";

      if (file) {
        imagePath = createStoragePath(file.name);

        const { error: uploadError } = await supabase.storage
          .from("hero")
          .upload(imagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }
      }

      const { error: deactivateError } = await supabase
        .from("hero_banners")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateError) {
        throw deactivateError;
      }

      const payload = {
        ...state,
        image_path: imagePath,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (activeHero) {
        const { error } = await supabase.from("hero_banners").update(payload).eq("id", activeHero.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("hero_banners").insert({
          ...payload,
          created_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }
      }

      toast.success("Hero banner updated.");
      await loadHero();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save hero banner.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const heroImage =
    filePreviewUrl ??
    previewUrl ??
    "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1900&auto=format&fit=crop";

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading hero data...</p>
          ) : null}
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={state.headline}
              onChange={(event) => setState((current) => ({ ...current, headline: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={state.subtitle}
              onChange={(event) => setState((current) => ({ ...current, subtitle: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input
                value={state.cta_text}
                onChange={(event) => setState((current) => ({ ...current, cta_text: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input
                value={state.cta_link}
                onChange={(event) => setState((current) => ({ ...current, cta_link: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hero Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Active Hero
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 text-white">
            <div className="relative h-[440px] w-full">
              <Image
                src={heroImage}
                alt="Hero preview"
                fill
                sizes="(max-width: 1280px) 100vw, 900px"
                unoptimized={heroImage.startsWith("blob:")}
                className="object-cover opacity-70"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 space-y-4 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-lime-200">EMIPulse</p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">{state.headline}</h2>
              <p className="max-w-xl text-zinc-200">{state.subtitle}</p>
              <a
                href={state.cta_link || "#"}
                className="inline-flex rounded-md bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950"
              >
                {state.cta_text}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
