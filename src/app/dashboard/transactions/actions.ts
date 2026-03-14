"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TransactionFormState = {
  error: string | null;
  success: boolean;
};

export async function addTransaction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const category_id = formData.get("category_id") as string;
  const description = (formData.get("description") as string).trim() || null;
  const date = formData.get("date") as string;

  if (isNaN(amount) || amount <= 0)
    return { error: "Amount must be a positive number.", success: false };
  if (!category_id)
    return { error: "Please select a category.", success: false };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id,
    type,
    amount,
    description,
    date,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}
