"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import CategoryManager from "../../categories/components/CategoryManager";
import AssetCategoryManager from "../../categories/components/AssetCategoryManager";
import SettingsForm from "./SettingsForm";
import type { AssetCategoryRow, Category } from "@/types/database";

type Sheet = "tx_categories" | "asset_categories" | "currency" | null;

function BottomSheet({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${open ? 'block' : 'hidden'}`}>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div className={`fixed z-[60] inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 px-5 py-5 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MorePageClient({
  email,
  categories,
  assetCategories,
  currencyCode,
  userId,
}: {
  email: string;
  categories: Category[];
  assetCategories: AssetCategoryRow[];
  currencyCode: string;
  userId: string;
}) {
  const [sheet, setSheet] = useState<Sheet>(null);

  const menuItems = [
    {
      key: "tx_categories" as Sheet,
      icon: "🏷️",
      label: "Transaction Categories",
      description: "Manage income & expense categories",
    },
    {
      key: "asset_categories" as Sheet,
      icon: "🏦",
      label: "Account Categories",
      description: "Manage account types",
    },
    {
      key: "currency" as Sheet,
      icon: "💱",
      label: "Currency",
      description: currencyCode,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">More</h1>
      </div>

      {/* User info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-indigo-600">
            {email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
          <p className="text-xs text-gray-400">Signed in</p>
        </div>
      </div>

      {/* Settings menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.key}
            onClick={() => setSheet(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition text-left ${
              i < menuItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-50 active:bg-red-100 transition"
        >
          Sign Out
        </button>
      </form>

      {/* Sheets */}
      <BottomSheet title="Transaction Categories" open={sheet === "tx_categories"} onClose={() => setSheet(null)}>
        <CategoryManager categories={categories} userId={userId} />
      </BottomSheet>

      <BottomSheet title="Account Categories" open={sheet === "asset_categories"} onClose={() => setSheet(null)}>
        <AssetCategoryManager categories={assetCategories} userId={userId} />
      </BottomSheet>

      <BottomSheet title="Currency" open={sheet === "currency"} onClose={() => setSheet(null)}>
        <SettingsForm currentCode={currencyCode} />
      </BottomSheet>
    </div>
  );
}
