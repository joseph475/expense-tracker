"use client";

import { useAppData } from "@/lib/AppDataContext";
import type { AssetWithCategory } from "@/types/database";

const LEGACY_LABELS: Record<string, string> = {
  cash: "Cash / Bank", investment: "Investment", property: "Property",
  vehicle: "Vehicle", liability: "Liability", other: "Other",
};
const LEGACY_ICONS: Record<string, string> = {
  cash: "🏦", investment: "📈", property: "🏠", vehicle: "🚗", liability: "💳", other: "📦",
};

export default function BalancePage() {
  const { transactions, assets, settings } = useAppData();
  const symbol = settings.currency_symbol;

  function assetGroupKey(a: AssetWithCategory) {
    return a.asset_category_id ?? a.category;
  }
  function assetGroupLabel(a: AssetWithCategory) {
    return a.assetCategory?.name ?? LEGACY_LABELS[a.category] ?? a.category;
  }
  function assetIcon(a: AssetWithCategory) {
    return a.assetCategory?.icon ?? LEGACY_ICONS[a.category] ?? "📦";
  }
  function assetIsLiability(a: AssetWithCategory) {
    return a.assetCategory?.is_liability ?? a.category === "liability";
  }

  // Build ordered unique group keys (non-liabilities first, then liabilities)
  const seenGroups = new Map<string, { label: string; assets: AssetWithCategory[] }>();
  for (const a of assets) {
    const key = assetGroupKey(a);
    if (!seenGroups.has(key)) seenGroups.set(key, { label: assetGroupLabel(a), assets: [] });
    seenGroups.get(key)!.assets.push(a);
  }
  const groupedAssets = [...seenGroups.entries()]
    .sort(([, a], [, b]) => {
      const aLiab = assetIsLiability(a.assets[0]);
      const bLiab = assetIsLiability(b.assets[0]);
      if (aLiab !== bLiab) return aLiab ? 1 : -1;
      return a.label.localeCompare(b.label);
    })
    .map(([key, g]) => ({ key, label: g.label, assets: g.assets }));

  const allCols = groupedAssets.flatMap((g) => g.assets);

  // Per-account balance from transactions
  const accountBalance = new Map<string, number>();
  for (const t of transactions) {
    if (!t.account_id) continue;
    const prev = accountBalance.get(t.account_id) ?? 0;
    accountBalance.set(t.account_id, prev + (t.type === "income" ? Number(t.amount) : -Number(t.amount)));
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  function fmt(n: number) {
    return symbol + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Balance</h1>
        <p className="mt-0.5 text-sm text-gray-500">Account ledger grouped by category</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`col-span-3 rounded-2xl p-5 text-white ${netBalance >= 0 ? "bg-indigo-600" : "bg-rose-500"}`}>
          <p className="text-sm opacity-80">Net Cash Flow</p>
          <p className="text-3xl font-bold mt-1">
            {netBalance >= 0 ? "+" : "-"}{fmt(netBalance)}
          </p>
          <p className="text-xs opacity-70 mt-1">All-time income minus expenses</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-1">
          <p className="text-xs text-gray-500 mb-1">Total In</p>
          <p className="text-base font-bold text-green-600">+{fmt(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-1">
          <p className="text-xs text-gray-500 mb-1">Total Out</p>
          <p className="text-base font-bold text-rose-500">-{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 col-span-1">
          <p className="text-xs text-gray-500 mb-1">Accounts</p>
          <p className="text-base font-bold text-gray-900">{allCols.length}</p>
        </div>
      </div>

      {/* Table */}
      {allCols.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-gray-500 font-medium">No accounts yet</p>
          <p className="text-xs text-gray-400 mt-1">Add assets first, then assign transactions to them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: `${320 + allCols.length * 130}px` }}>
              <thead>
                {/* Row 1: Category group headers */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Date</th>
                  <th className="sticky left-24 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide min-w-40">Description</th>
                  {groupedAssets.map((group) => {
                    const liab = assetIsLiability(group.assets[0]);
                    return (
                      <th
                        key={group.key}
                        colSpan={group.assets.length}
                        className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-wide border-l ${
                          liab
                            ? "text-rose-600 bg-rose-50 border-rose-100"
                            : "text-indigo-700 bg-indigo-50 border-indigo-100"
                        }`}
                      >
                        {assetIcon(group.assets[0])} {group.label}
                      </th>
                    );
                  })}
                </tr>

                {/* Row 2: Account names */}
                <tr className="bg-white border-b border-gray-200">
                  <th className="sticky left-0 z-10 bg-white px-4 py-2.5" />
                  <th className="sticky left-24 z-10 bg-white px-4 py-2.5" />
                  {allCols.map((asset) => {
                    const isFirst = groupedAssets.some((g) => g.assets[0].id === asset.id);
                    return (
                      <th key={asset.id} className={`px-3 py-2.5 text-center text-xs font-semibold text-gray-600 ${isFirst ? "border-l border-gray-200" : ""}`}>
                        {asset.name}
                      </th>
                    );
                  })}
                </tr>

                {/* Row 3: Balance per account */}
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <td className="sticky left-0 z-10 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Balance</td>
                  <td className="sticky left-24 z-10 bg-gray-50 px-4 py-2.5" />
                  {allCols.map((asset) => {
                    const bal = accountBalance.get(asset.id) ?? 0;
                    const isFirst = groupedAssets.some((g) => g.assets[0].id === asset.id);
                    return (
                      <td key={asset.id} className={`px-3 py-2.5 text-center text-xs font-bold tabular-nums ${bal >= 0 ? "text-indigo-700" : "text-rose-600"} ${isFirst ? "border-l border-gray-200" : ""}`}>
                        {bal >= 0 ? "" : "-"}{fmt(bal)}
                      </td>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={2 + allCols.length} className="px-4 py-12 text-center text-sm text-gray-400">No transactions yet</td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const amount = Number(t.amount);
                    const isIncome = t.type === "income";
                    const dateObj = new Date(t.date + "T00:00:00");

                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="sticky left-24 z-10 bg-white px-4 py-3 min-w-40">
                          <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{t.category?.icon || "🔄"}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-36">
                                {t.description ?? t.category?.name ?? "Transfer"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{t.category?.name ?? "Transfer"}</p>
                            </div>
                          </div>
                        </td>
                        {allCols.map((asset) => {
                          const isThisAccount = t.account_id === asset.id;
                          const isFirst = groupedAssets.some((g) => g.assets[0].id === asset.id);
                          return (
                            <td key={asset.id} className={`px-3 py-3 text-center tabular-nums ${isFirst ? "border-l border-gray-100" : ""}`}>
                              {isThisAccount ? (
                                <span className={`text-sm font-semibold ${isIncome ? "text-green-600" : "text-rose-500"}`}>
                                  {isIncome ? "+" : "-"}{fmt(amount)}
                                </span>
                              ) : (
                                <span className="text-gray-200 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
