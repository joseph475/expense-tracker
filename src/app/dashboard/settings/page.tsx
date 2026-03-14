import { createClient } from "@/lib/supabase/server";
import SettingsTabs from "./components/SettingsTabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: settings }, { data: categories }] = await Promise.all([
    supabase.from("user_settings").select("currency_code").eq("user_id", user!.id).single(),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user!.id}`)
      .order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage your preferences.</p>
      </div>

      <SettingsTabs
        currentCode={settings?.currency_code ?? "USD"}
        categories={categories ?? []}
        userId={user!.id}
      />
    </div>
  );
}
