"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AssetFormState = {
  error: string | null;
  success: boolean;
};

export async function addAsset(
  _prev: AssetFormState,
  formData: FormData
): Promise<AssetFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const name = (formData.get("name") as string).trim();
  const category = formData.get("category") as string;
  const current_value = parseFloat(formData.get("current_value") as string);
  const rateRaw = formData.get("interest_rate") as string;
  const interest_rate = rateRaw && rateRaw !== "" ? parseFloat(rateRaw) : null;

  if (!name) return { error: "Asset name is required.", success: false };
  if (isNaN(current_value) || current_value < 0)
    return { error: "Value must be 0 or more.", success: false };

  const { data: asset, error } = await supabase
    .from("assets")
    .insert({ user_id: user.id, name, category, current_value, interest_rate })
    .select()
    .single();

  if (error) return { error: error.message, success: false };

  // Record initial snapshot for current month
  const now = new Date();
  await supabase.from("asset_snapshots").upsert({
    asset_id: asset.id,
    user_id: user.id,
    value: current_value,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateAssetValue(assetId: string, newValue: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("assets")
    .update({ current_value: newValue })
    .eq("id", assetId)
    .eq("user_id", user.id);

  // Upsert snapshot for current month
  const now = new Date();
  await supabase.from("asset_snapshots").upsert(
    {
      asset_id: assetId,
      user_id: user.id,
      value: newValue,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
    { onConflict: "asset_id,year,month" }
  );

  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard");
}

export async function deleteAsset(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("assets").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard");
}
