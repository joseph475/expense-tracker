import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AssetWithCategory } from "@/types/database";
import AccountsClient, { type AccountGroup } from "./components/AccountsClient";

const LEGACY_LABELS: Record<string, string> = {
  cash: "Cash / Bank", investment: "Investment", property: "Property",
  vehicle: "Vehicle", liability: "Liability", other: "Other",
};
const LEGACY_ICONS: Record<string, string> = {
  cash: "🏦", investment: "📈", property: "🏠", vehicle: "🚗", liability: "💳", other: "📦",
};

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth");

  const [{ data: rawAssets }, { data: settings }, { data: assetCategories }] = await Promise.all([
    supabase
      .from("assets")
      .select("*, assetCategory:asset_categories(id, name, icon, is_liability)")
      .eq("user_id", user!.id)
      .order("name"),
    supabase.from("user_settings").select("currency_symbol").eq("user_id", user!.id).single(),
    supabase
      .from("asset_categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user!.id}`)
      .order("name"),
  ]);

  const symbol = settings?.currency_symbol ?? "$";
  const assets = (rawAssets ?? []) as AssetWithCategory[];

  function groupKey(a: AssetWithCategory) {
    return a.asset_category_id ?? a.category;
  }
  function groupLabel(a: AssetWithCategory) {
    return a.assetCategory?.name ?? LEGACY_LABELS[a.category] ?? a.category;
  }
  function groupIcon(a: AssetWithCategory) {
    return a.assetCategory?.icon ?? LEGACY_ICONS[a.category] ?? "📦";
  }
  function isLiability(a: AssetWithCategory) {
    return a.assetCategory?.is_liability ?? a.category === "liability";
  }

  // Build groups
  const groupMap = new Map<string, AccountGroup>();
  for (const a of assets) {
    const key = groupKey(a);
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label: groupLabel(a),
        icon: groupIcon(a),
        isLiability: isLiability(a),
        accounts: [],
        total: 0,
      });
    }
    const g = groupMap.get(key)!;
    g.accounts.push(a);
    g.total += Number(a.current_value);
  }

  // Sort: non-liabilities first, then by label
  const groups = [...groupMap.values()].sort((a, b) => {
    if (a.isLiability !== b.isLiability) return a.isLiability ? 1 : -1;
    return a.label.localeCompare(b.label);
  });

  const totalAssets = groups
    .filter((g) => !g.isLiability)
    .reduce((s, g) => s + g.total, 0);
  const totalLiabilities = groups
    .filter((g) => g.isLiability)
    .reduce((s, g) => s + g.total, 0);

  return (
    <AccountsClient
      groups={groups}
      symbol={symbol}
      assetCategories={assetCategories ?? []}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
    />
  );
}
