import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { TransactionWithCategory } from "@/types/database";

// Cache the supabase client creation
export const getCachedSupabaseClient = cache(async () => {
  return await createClient();
});

// Cache user session
export const getCachedUserSession = cache(async () => {
  const supabase = await getCachedSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
});

// Cache user settings
export const getCachedUserSettings = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  const { data } = await supabase
    .from("user_settings")
    .select("currency_symbol")
    .eq("user_id", userId)
    .single();
  return data;
});

// Cache categories
export const getCachedCategories = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("name");
  return data ?? [];
});

// Cache assets
export const getCachedAssets = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  return data ?? [];
});

// Cache asset values for networth calculation
export const getCachedAssetValues = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  const { data } = await supabase
    .from("assets")
    .select("current_value, category")
    .eq("user_id", userId);
  return data ?? [];
});

// Optimized transaction fetching with better indexing
export const getTransactions = async (
  userId: string,
  dateFrom: string,
  dateTo: string,
  limit?: number
) => {
  const supabase = await getCachedSupabaseClient();
  
  let query = supabase
    .from("transactions")
    .select(`
      *,
      category:categories(*),
      account:assets!account_id(id, name, asset_categories(name, icon, is_liability)),
      to_account:assets!to_account_id(id, name, asset_categories(name, icon, is_liability))
    `)
    .eq("user_id", userId)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data ?? []) as TransactionWithCategory[];
};

// Memoized calculations
export const calculateNetWorth = (assets: Array<{ current_value: number; category: string }>) => {
  const totalAssets = assets
    .filter((a) => a.category !== "liability")
    .reduce((s, a) => s + Number(a.current_value), 0);
  const totalLiabilities = assets
    .filter((a) => a.category === "liability")
    .reduce((s, a) => s + Number(a.current_value), 0);
  return totalAssets - totalLiabilities;
};

export const calculatePeriodTotals = (transactions: TransactionWithCategory[]) => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses };
};