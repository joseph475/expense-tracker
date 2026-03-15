"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveBackup(data: object): Promise<{ error?: string; backed_up_at?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const backed_up_at = new Date().toISOString();
  const { error } = await supabase
    .from("backups")
    .upsert({ user_id: user.id, data, backed_up_at }, { onConflict: "user_id" });

  if (error) return { error: error.message };
  return { backed_up_at };
}

export async function loadBackup(): Promise<{ data?: Record<string, unknown>; backed_up_at?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("backups")
    .select("data, backed_up_at")
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.code === "PGRST116" ? "No backup found" : error.message };
  return { data: data.data, backed_up_at: data.backed_up_at };
}

export async function getLastBackupTime(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("backups")
    .select("backed_up_at")
    .eq("user_id", user.id)
    .single();

  return data?.backed_up_at ?? null;
}
