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
  const to_account_id = (formData.get("to_account_id") as string) || null;

  if (isNaN(amount) || amount <= 0)
    return { error: "Amount must be a positive number.", success: false };
  if ((type === "expense" || type === "income") && !category_id)
    return { error: "Please select a category.", success: false };
  if ((type === "expense" || type === "income") && !account_id)
    return { error: "Please select an account.", success: false };
  if (type === "transfer" && (!account_id || !to_account_id))
    return { error: "Please select both accounts for transfers.", success: false };
  if (type === "transfer" && account_id === to_account_id)
    return { error: "Cannot transfer to the same account.", success: false };

  // Insert the transaction
  const transactionData: any = {
    user_id: user.id,
    account_id,
    type,
    amount,
    description,
    date,
  };

  // Only add category_id for non-transfer transactions
  if (type !== "transfer") {
    transactionData.category_id = category_id;
  }

  // Add to_account_id for transfer transactions
  if (type === "transfer") {
    transactionData.to_account_id = to_account_id;
  }

  const { error: transactionError } = await supabase.from("transactions").insert(transactionData);

  if (transactionError) return { error: transactionError.message, success: false };

  // Update asset value if account is specified
  if (account_id && (type === "expense" || type === "income")) {
    const { data: asset, error: assetFetchError } = await supabase
      .from("assets")
      .select("current_value, asset_categories!inner(is_liability)")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .single();

    if (assetFetchError) {
      return { error: "Failed to fetch asset information.", success: false };
    }

    const isLiability = (asset.asset_categories as any)?.is_liability || false;
    let newValue: number;

    if (type === "expense") {
      if (isLiability) {
        // For liability accounts, expenses increase the debt (add to current_value)
        // Since debt is stored as positive numbers, adding increases the debt
        newValue = Number(asset.current_value) + amount;
      } else {
        // For asset accounts, expenses decrease the balance
        newValue = Number(asset.current_value) - amount;
      }
    } else { // income
      if (isLiability) {
        // For liability accounts, income decreases the debt (subtract from current_value)
        // Since debt is stored as positive numbers, subtracting decreases the debt
        newValue = Number(asset.current_value) - amount;
      } else {
        // For asset accounts, income increases the balance
        newValue = Number(asset.current_value) + amount;
      }
    }

    const { error: assetUpdateError } = await supabase
      .from("assets")
      .update({ current_value: newValue })
      .eq("id", account_id)
      .eq("user_id", user.id);

    if (assetUpdateError) {
      return { error: "Failed to update asset value.", success: false };
    }
  }

  // Handle transfers - update both accounts
  if (type === "transfer" && account_id && to_account_id) {
    // Get both accounts with their categories
    const { data: accounts, error: accountsFetchError } = await supabase
      .from("assets")
      .select("id, current_value, asset_categories!inner(is_liability)")
      .in("id", [account_id, to_account_id])
      .eq("user_id", user.id);

    if (accountsFetchError || !accounts || accounts.length !== 2) {
      return { error: "Failed to fetch account information for transfer.", success: false };
    }

    const fromAccount = accounts.find(a => a.id === account_id);
    const toAccount = accounts.find(a => a.id === to_account_id);

    if (!fromAccount || !toAccount) {
      return { error: "Invalid account selection for transfer.", success: false };
    }

    const fromIsLiability = (fromAccount.asset_categories as any)?.is_liability || false;
    const toIsLiability = (toAccount.asset_categories as any)?.is_liability || false;

    // Calculate new values for both accounts
    let newFromValue: number;
    let newToValue: number;

    // From account: money is leaving
    if (fromIsLiability) {
      // For liability accounts, money leaving increases the debt (add to current_value)
      // Since debt is stored as positive numbers, adding increases the debt
      newFromValue = Number(fromAccount.current_value) + amount;
    } else {
      // For asset accounts, money leaving decreases the balance
      newFromValue = Number(fromAccount.current_value) - amount;
    }

    // To account: money is arriving
    if (toIsLiability) {
      // For liability accounts, money arriving PAYS DOWN the debt (subtract from current_value)
      // Since debt is stored as positive numbers, subtracting decreases the debt
      newToValue = Number(toAccount.current_value) - amount;
    } else {
      // For asset accounts, money arriving increases the balance
      newToValue = Number(toAccount.current_value) + amount;
    }

    // Update both accounts
    const { error: fromUpdateError } = await supabase
      .from("assets")
      .update({ current_value: newFromValue })
      .eq("id", account_id)
      .eq("user_id", user.id);

    if (fromUpdateError) {
      return { error: "Failed to update source account.", success: false };
    }

    const { error: toUpdateError } = await supabase
      .from("assets")
      .update({ current_value: newToValue })
      .eq("id", to_account_id)
      .eq("user_id", user.id);

    if (toUpdateError) {
      return { error: "Failed to update destination account.", success: false };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/balance");
  return { error: null, success: true };
}
