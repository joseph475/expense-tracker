import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsClient from "./components/StatsClient";

export default async function StatsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      category:categories(name, icon)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id);

  // Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("currency_code")
    .eq("user_id", user.id)
    .single();

  return (
    <StatsClient 
      transactions={transactions || []}
      categories={categories || []}
      currencyCode={settings?.currency_code || "USD"}
    />
  );
}