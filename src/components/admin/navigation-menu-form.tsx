"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { menuIconOptions } from "@/components/navigation/menu-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { NavigationMenuItem } from "@/types";

type NavigationMenuFormProps = {
  initialItems: NavigationMenuItem[];
  tableReady: boolean;
};

function isMissingMenuTable(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("navigation_menu") || normalized.includes("schema cache") || normalized.includes("could not find the table");
}

export function NavigationMenuForm({ initialItems, tableReady }: NavigationMenuFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<NavigationMenuItem[]>(initialItems);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [iconKey, setIconKey] = useState("house");
  const [sortOrder, setSortOrder] = useState("60");
  const [showOnPublic, setShowOnPublic] = useState(true);
  const [showOnAdmin, setShowOnAdmin] = useState(true);

  async function refreshItems() {
    const { data, error } = await supabase
      .from("navigation_menu")
      .select("id, label, href, icon_key, sort_order, is_active, show_on_public, show_on_admin, created_at")
      .order("sort_order", { ascending: true });

    if (error) {
      if (isMissingMenuTable(error.message)) {
        return;
      }
      toast.error(error.message);
      return;
    }

    setItems((data as NavigationMenuItem[]) ?? []);
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!label.trim() || !href.trim()) {
      toast.error("Label and href are required.");
      return;
    }

    const sortNumber = Number(sortOrder);
    if (!Number.isFinite(sortNumber)) {
      toast.error("Sort order must be a valid number.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("navigation_menu").insert({
      label: label.trim(),
      href: href.trim(),
      icon_key: iconKey,
      sort_order: Math.trunc(sortNumber),
      is_active: true,
      show_on_public: showOnPublic,
      show_on_admin: showOnAdmin,
    });

    setSaving(false);

    if (error) {
      if (isMissingMenuTable(error.message)) {
        toast.error("Navigation menu table is missing. Please run latest Supabase schema SQL first.");
        return;
      }
      toast.error(error.message);
      return;
    }

    toast.success("Menu item added.");
    setLabel("");
    setHref("");
    setIconKey("house");
    setSortOrder("60");
    setShowOnPublic(true);
    setShowOnAdmin(true);
    await refreshItems();
  }

  async function toggleActive(item: NavigationMenuItem) {
    const { error } = await supabase
      .from("navigation_menu")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(item.is_active ? "Menu item hidden." : "Menu item activated.");
    await refreshItems();
  }

  async function handleDelete(item: NavigationMenuItem) {
    const shouldDelete = window.confirm(`Delete menu item \"${item.label}\"?`);
    if (!shouldDelete) return;

    const { error } = await supabase.from("navigation_menu").delete().eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Menu item deleted.");
    await refreshItems();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Menu Settings</CardTitle>
        <CardDescription>
          Add and manage menu items without editing code. Changes apply to both public page and admin sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!tableReady ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Menu settings are unavailable because table public.navigation_menu has not been created yet.
            Please run the SQL from supabase/schema.sql and supabase/seed.sql then refresh.
          </div>
        ) : null}

        <form className="grid gap-3 md:grid-cols-6" onSubmit={handleAdd}>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="menu-label">Label</Label>
            <Input id="menu-label" value={label} onChange={(e) => setLabel(e.target.value)} disabled={!tableReady || saving} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="menu-href">Href</Label>
            <Input id="menu-href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/admin/events" disabled={!tableReady || saving} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="menu-icon-key">Icon</Label>
            <Select id="menu-icon-key" value={iconKey} onChange={(e) => setIconKey(e.target.value)} disabled={!tableReady || saving}>
              {menuIconOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="menu-sort-order">Sort</Label>
            <Input
              id="menu-sort-order"
              value={sortOrder}
              inputMode="numeric"
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={!tableReady || saving}
            />
          </div>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={showOnPublic} onChange={(e) => setShowOnPublic(e.target.checked)} disabled={!tableReady || saving} />
            Show on Public
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={showOnAdmin} onChange={(e) => setShowOnAdmin(e.target.checked)} disabled={!tableReady || saving} />
            Show on Admin
          </label>

          <div className="md:col-span-2">
            <Button type="submit" disabled={!tableReady || saving}>
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Menu Item
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">No menu items found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 p-3">
                <div className="text-sm">
                  <p className="font-medium text-zinc-900">{item.label}</p>
                  <p className="text-zinc-500">{item.href} • icon: {item.icon_key} • sort: {item.sort_order}</p>
                  <p className="text-xs text-zinc-500">
                    public: {item.show_on_public ? "yes" : "no"} • admin: {item.show_on_admin ? "yes" : "no"} • active: {item.is_active ? "yes" : "no"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleActive(item)} disabled={!tableReady || saving}>
                    <Save className="mr-1 h-3.5 w-3.5" />
                    {item.is_active ? "Hide" : "Activate"}
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(item)} disabled={!tableReady || saving}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
