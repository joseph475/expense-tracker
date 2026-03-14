import { createClient } from "@/lib/supabase/server";
import AddAssetButton from "./components/AddAssetButton";
import AssetCard from "./components/AssetCard";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: assets }, { data: settings }] = await Promise.all([
    supabase.from("assets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("user_settings").select("currency_symbol").eq("user_id", user!.id).single(),
  ]);

  const currencySymbol = settings?.currency_symbol ?? "$";
  const allAssets = assets ?? [];

  const ownedAssets = allAssets.filter((a) => a.category !== "liability");
  const liabilities = allAssets.filter((a) => a.category === "liability");

  const totalAssets = ownedAssets.reduce((s, a) => s + Number(a.current_value), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.current_value), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track what you own and owe.</p>
        </div>
        <AddAssetButton currencySymbol={currencySymbol} />
      </div>

      {/* Summary cards */}
      {allAssets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-xs text-gray-400">Assets</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{currencySymbol}{totalAssets.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-xs text-gray-400">Liabilities</p>
            <p className="text-sm font-bold text-red-500 mt-1">-{currencySymbol}{totalLiabilities.toFixed(2)}</p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-3 text-center ${netWorth >= 0 ? "bg-indigo-600 border-indigo-600" : "bg-rose-500 border-rose-500"}`}>
            <p className="text-xs text-white/70">Net Worth</p>
            <p className="text-sm font-bold text-white mt-1">
              {netWorth >= 0 ? "" : "-"}{currencySymbol}{Math.abs(netWorth).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Assets list */}
      {ownedAssets.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Assets</p>
          {ownedAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} currencySymbol={currencySymbol} />
          ))}
        </div>
      )}

      {/* Liabilities list */}
      {liabilities.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Liabilities</p>
          {liabilities.map((asset) => (
            <AssetCard key={asset.id} asset={asset} currencySymbol={currencySymbol} />
          ))}
        </div>
      )}

      {allAssets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-gray-400">No assets yet. Tap <strong>+</strong> to add one.</p>
        </div>
      )}
    </div>
  );
}
