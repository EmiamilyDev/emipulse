"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createStoragePath, getStoragePublicUrl } from "@/lib/supabase/storage";
import { formatDate } from "@/lib/utils";
import type { GalleryItem } from "@/types";

type LocalPreview = {
  name: string;
  url: string;
};

type EventOption = {
  id: string;
  title: string;
};

export default function GalleryAdminPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<LocalPreview[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  async function loadData() {
    setLoading(true);
    const [galleryResult, eventsResult] = await Promise.all([
      supabase.from("gallery_items").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id, title").order("event_date", { ascending: false }),
    ]);

    if (galleryResult.error) {
      toast.error(galleryResult.error.message);
    }

    if (eventsResult.error) {
      toast.error(eventsResult.error.message);
    }

    setItems((galleryResult.data as GalleryItem[]) ?? []);
    setEvents((eventsResult.data as EventOption[]) ?? []);
    setLoading(false);
  }

  async function optimizeImage(file: File) {
    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const maxWidth = 1800;
      const ratio = Math.min(1, maxWidth / imageBitmap.width);

      canvas.width = Math.round(imageBitmap.width * ratio);
      canvas.height = Math.round(imageBitmap.height * ratio);

      const context = canvas.getContext("2d");

      if (!context) {
        return file;
      }

      context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.82);
      });

      if (!blob) {
        return file;
      }

      return new File([blob], `${file.name.split(".")[0]}.webp`, { type: "image/webp" });
    } catch {
      // Some browsers/files fail decode; upload the original file instead.
      return file;
    }
  }

  function collectFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPreviews(nextPreviews);
    void uploadFiles(files);
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const optimized = await optimizeImage(file);
        const path = createStoragePath(optimized.name);

        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(path, optimized, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { error: insertError } = await supabase
          .from("gallery_items")
          .insert({ image_path: path, caption: null, event_id: null });

        if (insertError) {
          throw insertError;
        }
      }

      toast.success("Upload complete.");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      setPreviews([]);
    }
  }

  async function handleDelete(item: GalleryItem) {
    const shouldDelete = window.confirm("Delete this image?");

    if (!shouldDelete) {
      return;
    }

    await supabase.storage.from("gallery").remove([item.image_path]);
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Image deleted.");
    await loadData();
  }

  async function updateItem(item: GalleryItem, payload: Partial<GalleryItem>) {
    const { error } = await supabase.from("gallery_items").update(payload).eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Gallery item updated.");
    await loadData();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gallery Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="rounded-xl border-2 border-dashed border-zinc-300 bg-white p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              collectFiles(event.dataTransfer.files);
            }}
          >
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-zinc-500" />
            <p className="text-sm text-zinc-600">Drag and drop images here, or upload from your device.</p>
            <Label htmlFor="gallery-upload" className="mt-4 inline-flex cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
              <ImagePlus className="mr-2 h-4 w-4" />
              Select images
            </Label>
            <Input
              id="gallery-upload"
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => collectFiles(event.target.files)}
            />
            {uploading ? (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing and uploading...
              </p>
            ) : null}
          </div>

          {previews.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {previews.map((preview) => (
                <div key={preview.url} className="relative h-32 overflow-hidden rounded-md border border-zinc-200">
                  <Image
                    src={preview.url}
                    alt={preview.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 240px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {loading ? (
        <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">Loading gallery...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-3 p-4">
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  <Image
                    src={getStoragePublicUrl("gallery", item.image_path)}
                    alt={item.caption ?? "Gallery image"}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-zinc-500">Uploaded {formatDate(item.created_at)}</p>
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Input
                    defaultValue={item.caption ?? ""}
                    onBlur={(event) => {
                      const nextCaption = event.target.value.trim();
                      if (nextCaption !== (item.caption ?? "")) {
                        void updateItem(item, { caption: nextCaption || null });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Event</Label>
                  <Select
                    defaultValue={item.event_id ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      void updateItem(item, { event_id: value || null });
                    }}
                  >
                    <option value="">No event</option>
                    {events.map((eventItem) => (
                      <option key={eventItem.id} value={eventItem.id}>
                        {eventItem.title}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button variant="destructive" className="w-full" onClick={() => handleDelete(item)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
