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
