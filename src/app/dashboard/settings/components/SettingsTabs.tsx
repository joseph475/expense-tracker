"use client";

import { useState } from "react";
import SettingsForm from "./SettingsForm";
import CategoryManager from "../../categories/components/CategoryManager";
import AssetCategoryManager from "../../categories/components/AssetCategoryManager";
import type { AssetCategoryRow, Category } from "@/types/database";

const TABS = [
  { key: "categories",       label: "🏷️ Categories" },
  { key: "asset_categories", label: "🏦 Assets" },
  { key: "currency",         label: "💱 Currency" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function SettingsTabs({
  currentCode,
  categories,
  assetCategories,
  userId,
}: {
  currentCode: string;
  categories: Category[];
  assetCategories: AssetCategoryRow[];
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              tab === t.key
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {tab === "currency" && <SettingsForm currentCode={currentCode} />}
        {tab === "categories" && (
          <CategoryManager categories={categories} userId={userId} />
        )}
        {tab === "asset_categories" && (
          <AssetCategoryManager categories={assetCategories} userId={userId} />
        )}
      </div>
    </div>
  );
}
