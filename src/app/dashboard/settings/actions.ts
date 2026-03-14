"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES } from "@/lib/currency";

export type SettingsState = {
  error: string | null;
  success: boolean;
};

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const currency_code = formData.get("currency_code") as string;
  const currency = CURRENCIES.find((c) => c.code === currency_code) ?? CURRENCIES[0];

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    currency_code: currency.code,
    currency_symbol: currency.symbol,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard", "layout");
  return { error: null, success: true };
}
