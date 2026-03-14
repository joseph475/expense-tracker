"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = {
  error: string | null;
  success: boolean;
};

export async function addCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const name = (formData.get("name") as string).trim();
  const icon = (formData.get("icon") as string).trim();
  const type = formData.get("type") as string;

  if (!name) return { error: "Category name is required.", success: false };
  if (!icon) return { error: "Please enter an emoji icon.", success: false };

  const { error } = await supabase.from("categories").insert({
    name,
    icon,
    type,
    user_id: user.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/settings");
  return { error: null, success: true };
}

export type AssetCategoryFormState = {
  error: string | null;
  success: boolean;
};

export async function addAssetCategory(
  _prev: AssetCategoryFormState,
  formData: FormData
): Promise<AssetCategoryFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const name = (formData.get("name") as string).trim();
  const icon = (formData.get("icon") as string).trim();
  const is_liability = formData.get("is_liability") === "true";

  if (!name) return { error: "Category name is required.", success: false };
  if (!icon) return { error: "Please enter an emoji icon.", success: false };

  const { error } = await supabase.from("asset_categories").insert({
    name, icon, is_liability, user_id: user.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/assets");
  return { error: null, success: true };
}

export async function deleteAssetCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("asset_categories").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/assets");
}

export type UpdateAssetCategoryState = { error: string | null; success: boolean };

export async function updateAssetCategory(
  _prev: UpdateAssetCategoryState,
  formData: FormData
): Promise<UpdateAssetCategoryState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const icon = (formData.get("icon") as string).trim();
  const is_liability = formData.get("is_liability") === "true";

  if (!name) return { error: "Name is required.", success: false };
  if (!icon) return { error: "Please enter an emoji icon.", success: false };

  const { data, error } = await supabase
    .from("asset_categories")
    .update({ name, icon, is_liability })
    .eq("id", id)
    .select();

  if (error) return { error: error.message, success: false };
  if (!data || data.length === 0) return { error: "Permission denied — run the RLS policy SQL in your Supabase dashboard.", success: false };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/assets");
  return { error: null, success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Only allow deleting own categories (user_id must match)
  await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
}
