"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { useAppData } from "@/lib/AppDataContext";
import CategoryManager from "../../categories/components/CategoryManager";
import AssetCategoryManager from "../../categories/components/AssetCategoryManager";
import SettingsForm from "./SettingsForm";

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

export default function MorePageClient() {
  const { userEmail, settings } = useAppData();
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
      description: settings.currency_code,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
      </div>

      {/* User info */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-indigo-600">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
        </div>
      </div>

      {/* Settings menu */}
      <div className="bg-white border-b border-gray-100">
        {menuItems.map((item, i) => (
          <button
            key={item.key}
            onClick={() => setSheet(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition text-left ${
              i < menuItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div className="px-4 py-6">
        <form action={logout}>
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-50 active:bg-red-100 transition"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Sheets */}
      <BottomSheet title="Transaction Categories" open={sheet === "tx_categories"} onClose={() => setSheet(null)}>
        <CategoryManager />
      </BottomSheet>

      <BottomSheet title="Account Categories" open={sheet === "asset_categories"} onClose={() => setSheet(null)}>
        <AssetCategoryManager />
      </BottomSheet>

      <BottomSheet title="Currency" open={sheet === "currency"} onClose={() => setSheet(null)}>
        <SettingsForm currentCode={settings.currency_code} />
      </BottomSheet>
    </div>
  );
}
