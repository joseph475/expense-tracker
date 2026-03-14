"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ExpenseFormState = {
  error: string | null;
  success: boolean;
};

export async function addExpense(
  _prev: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated.", success: false };

  const amount = parseFloat(formData.get("amount") as string);
  const description = (formData.get("description") as string).trim() || null;
  const date = formData.get("date") as string;
  const category_id = formData.get("category_id") as string;

  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number.", success: false };
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    category_id,
    amount,
    description,
    date,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
}
