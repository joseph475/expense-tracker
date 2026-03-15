"use client";

import { useMemo } from "react";
import { useAppData } from "@/lib/AppDataContext";
import AccountsClient, { type AccountGroup } from "./components/AccountsClient";
import type { AssetWithCategory } from "@/types/database";

const LEGACY_LABELS: Record<string, string> = {
  cash: "Cash / Bank", investment: "Investment", property: "Property",
  vehicle: "Vehicle", liability: "Liability", other: "Other",
};
const LEGACY_ICONS: Record<string, string> = {
  cash: "🏦", investment: "📈", property: "🏠", vehicle: "🚗", liability: "💳", other: "📦",
};

export default function AccountsPage() {
  const { assets, assetCategories, settings } = useAppData();
  const symbol = settings.currency_symbol;

  const { groups, totalAssets, totalLiabilities } = useMemo(() => {
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

    const sortedGroups = [...groupMap.values()].sort((a, b) => {
      if (a.isLiability !== b.isLiability) return a.isLiability ? 1 : -1;
      return a.label.localeCompare(b.label);
    });

    const totalAssets = sortedGroups.filter(g => !g.isLiability).reduce((s, g) => s + g.total, 0);
    const totalLiabilities = sortedGroups.filter(g => g.isLiability).reduce((s, g) => s + g.total, 0);

    return { groups: sortedGroups, totalAssets, totalLiabilities };
  }, [assets]);

  return (
    <AccountsClient
      groups={groups}
      symbol={symbol}
      assetCategories={assetCategories}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
    />
  );
}
