"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const forbidden = searchParams.get("error") === "forbidden";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorText(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorText(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const nextPath = searchParams.get("next") || "/admin";
      toast.success("Welcome back.");
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setErrorText(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#65a30d_0%,_transparent_35%),radial-gradient(circle_at_bottom_right,_#f59e0b_0%,_transparent_40%)] opacity-30" />
      <Card className="relative w-full max-w-md border-zinc-800 bg-zinc-900/85 text-zinc-100 backdrop-blur">
        <CardHeader>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-lime-300/20 text-lime-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl text-zinc-100">Admin Login</CardTitle>
          <CardDescription className="text-zinc-400">
            Secure sign-in for EMIPulse administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forbidden ? (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              This account is authenticated but is not registered as an admin.
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@emipulse.com"
                required
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            {errorText ? (
              <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {errorText}
              </p>
            ) : null}
            <Button type="submit" className="w-full bg-lime-400 text-zinc-900 hover:bg-lime-300" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
