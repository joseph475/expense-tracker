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
  const account_id = (formData.get("account_id") as string) || null;

  if (isNaN(amount) || amount <= 0)
    return { error: "Amount must be a positive number.", success: false };
  if (!category_id)
    return { error: "Please select a category.", success: false };
  if (type === "expense" && !account_id)
    return { error: "Please select an account for expenses.", success: false };

  // Insert the transaction
  const { error: transactionError } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id,
    account_id,
    type,
    amount,
    description,
    date,
  });

  if (transactionError) return { error: transactionError.message, success: false };

  // Update asset value if account is specified and it's an expense
  if (account_id && type === "expense") {
    const { data: asset, error: assetFetchError } = await supabase
      .from("assets")
      .select("current_value")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .single();

    if (assetFetchError) {
      return { error: "Failed to fetch asset information.", success: false };
    }

    const newValue = Number(asset.current_value) - amount;
    const { error: assetUpdateError } = await supabase
      .from("assets")
      .update({ current_value: newValue })
      .eq("id", account_id)
      .eq("user_id", user.id);

    if (assetUpdateError) {
      return { error: "Failed to update asset value.", success: false };
    }
  }

  // Add to asset value if account is specified and it's income
  if (account_id && type === "income") {
    const { data: asset, error: assetFetchError } = await supabase
      .from("assets")
      .select("current_value")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .single();

    if (assetFetchError) {
      return { error: "Failed to fetch asset information.", success: false };
    }

    const newValue = Number(asset.current_value) + amount;
    const { error: assetUpdateError } = await supabase
      .from("assets")
      .update({ current_value: newValue })
      .eq("id", account_id)
      .eq("user_id", user.id);

    if (assetUpdateError) {
      return { error: "Failed to update asset value.", success: false };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/balance");
  return { error: null, success: true };
}
