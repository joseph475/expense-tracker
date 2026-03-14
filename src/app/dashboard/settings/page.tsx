import { createClient } from "@/lib/supabase/server";
import MorePageClient from "./components/MorePageClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session!.user;

  const [{ data: settings }, { data: categories }, { data: assetCategories }] = await Promise.all([
    supabase.from("user_settings").select("currency_code").eq("user_id", user.id).single(),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name"),
    supabase
      .from("asset_categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name"),
  ]);

  return (
    <MorePageClient
      email={user.email!}
      categories={categories ?? []}
      assetCategories={assetCategories ?? []}
      currencyCode={settings?.currency_code ?? "USD"}
      userId={user.id}
    />
  );
}
