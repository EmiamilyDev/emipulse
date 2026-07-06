"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createStoragePath, getStoragePublicUrl } from "@/lib/supabase/storage";
import { eventSchema, type EventFormValues } from "@/lib/validation/event";
import { formatDate } from "@/lib/utils";
import type { EventRecord, PublishStatus } from "@/types";

const defaultValues: EventFormValues = {
  title: "",
  description: "",
  location: "",
  event_date: "",
  status: "draft",
};

const pageSize = 7;

export default function EventsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PublishStatus>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  async function loadEvents() {
    setLoading(true);
    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .order("event_date", { ascending: false });

    if (searchText.trim()) {
      query = query.or(`title.ilike.%${searchText}%,location.ilike.%${searchText}%`);
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setEvents((data as EventRecord[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadEvents();
  }

  async function handleSave(values: EventFormValues) {
    setSubmitting(true);
    try {
      let imagePath = editingEvent?.image_path ?? null;

      if (file) {
        const path = createStoragePath(file.name);
        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        imagePath = path;
      }

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update({ ...values, image_path: imagePath })
          .eq("id", editingEvent.id);

        if (error) {
          throw error;
        }

        toast.success("Event updated.");
      } else {
        const { error } = await supabase.from("events").insert({
          ...values,
          image_path: imagePath,
        });

        if (error) {
          throw error;
        }

        toast.success("Event created.");
      }

      setFile(null);
      setEditingEvent(null);
      form.reset(defaultValues);
      await loadEvents();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save event.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(eventItem: EventRecord) {
    const shouldDelete = window.confirm(`Delete event \"${eventItem.title}\"?`);

    if (!shouldDelete) {
      return;
    }

    const { error } = await supabase.from("events").delete().eq("id", eventItem.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Event deleted.");
    await loadEvents();
  }

  function editEvent(eventItem: EventRecord) {
    setEditingEvent(eventItem);
    setFile(null);
    form.reset({
      title: eventItem.title,
      description: eventItem.description,
      location: eventItem.location,
      event_date: eventItem.event_date.slice(0, 16),
      status: eventItem.status,
    });
    toast.success(`Editing: ${eventItem.title}`);
  }

  function resetForm() {
    setEditingEvent(null);
    setFile(null);
    form.reset(defaultValues);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_180px_auto]" onSubmit={handleSearch}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by title or location"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "all" | PublishStatus);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          {loading ? (
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
              No event records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((eventItem) => (
                  <TableRow key={eventItem.id}>
                    <TableCell className="font-medium">{eventItem.title}</TableCell>
                    <TableCell>{formatDate(eventItem.event_date)}</TableCell>
                    <TableCell>
                      <Badge tone={eventItem.status === "published" ? "success" : "muted"}>
                        {eventItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{eventItem.location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => editEvent(eventItem)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(eventItem)}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingEvent ? "Edit Event" : "Create Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              <p className="text-xs text-red-600">{form.formState.errors.title?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
              <p className="text-xs text-red-600">{form.formState.errors.description?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} />
              <p className="text-xs text-red-600">{form.formState.errors.location?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Date & Time</Label>
              <Input id="event_date" type="datetime-local" {...form.register("event_date")} />
              <p className="text-xs text-red-600">{form.formState.errors.event_date?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...form.register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Event Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {editingEvent?.image_path ? (
                <div className="relative h-24 w-full overflow-hidden rounded-md">
                  <Image
                    src={getStoragePublicUrl("events", editingEvent.image_path)}
                    alt="Event"
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {editingEvent ? "Update" : "Create"}
                  </span>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
