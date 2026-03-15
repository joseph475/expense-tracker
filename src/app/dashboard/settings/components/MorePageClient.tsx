"use client";

import { useState, useEffect } from "react";
import { ChevronRight, X, CloudUpload, CloudDownload, Loader2 } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { saveBackup, loadBackup, getLastBackupTime } from "../actions";
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
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div className={`fixed z-60 inset-0 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 px-5 py-5 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default function MorePageClient() {
  const { userEmail, settings, userId, updateSettings } = useAppData();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [lastBackedUpAt, setLastBackedUpAt] = useState<string | null>(null);

  const isDark = settings.theme === "dark";

  useEffect(() => {
    getLastBackupTime().then(t => setLastBackedUpAt(t));
  }, []);

  function toggleTheme() {
    updateSettings({ ...settings, theme: isDark ? "light" : "dark" });
  }

  async function handleBackup() {
    setBackupLoading(true);
    setStatusMsg(null);
    try {
      const data = {
        transactions: JSON.parse(localStorage.getItem(`mt_${userId}_transactions`) || "[]"),
        assets: JSON.parse(localStorage.getItem(`mt_${userId}_assets`) || "[]"),
        categories: JSON.parse(localStorage.getItem(`mt_${userId}_categories`) || "[]"),
        asset_categories: JSON.parse(localStorage.getItem(`mt_${userId}_asset_categories`) || "[]"),
        settings: JSON.parse(localStorage.getItem(`mt_${userId}_settings`) || "null"),
      };
      const result = await saveBackup(data);
      if (result.error) {
        setStatusMsg({ text: result.error, ok: false });
      } else {
        setLastBackedUpAt(result.backed_up_at!);
        setStatusMsg({ text: "Backup saved successfully.", ok: true });
      }
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleRestore() {
    if (!window.confirm("This will overwrite all your local data with the backup. Continue?")) return;
    setRestoreLoading(true);
    setStatusMsg(null);
    try {
      const result = await loadBackup();
      if (result.error) {
        setStatusMsg({ text: result.error, ok: false });
        return;
      }
      const d = result.data!;
      if (d.transactions) localStorage.setItem(`mt_${userId}_transactions`, JSON.stringify(d.transactions));
      if (d.assets) localStorage.setItem(`mt_${userId}_assets`, JSON.stringify(d.assets));
      if (d.categories) localStorage.setItem(`mt_${userId}_categories`, JSON.stringify(d.categories));
      if (d.asset_categories) localStorage.setItem(`mt_${userId}_asset_categories`, JSON.stringify(d.asset_categories));
      if (d.settings) localStorage.setItem(`mt_${userId}_settings`, JSON.stringify(d.settings));
      window.location.reload();
    } finally {
      setRestoreLoading(false);
    }
  }

  function formatBackupTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* User info */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="mt-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="text-lg shrink-0">{isDark ? "🌙" : "☀️"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isDark ? "Dark theme enabled" : "Light theme enabled"}</p>
          </div>
          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              isDark ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
            role="switch"
            aria-checked={isDark}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isDark ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Settings menu */}
      <div className="mt-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        {menuItems.map((item, i) => (
          <button
            key={item.key}
            onClick={() => setSheet(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition text-left ${
              i < menuItems.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
            }`}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
          </button>
        ))}
      </div>

      {/* Cloud Backup */}
      <div className="mt-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={handleBackup}
          disabled={backupLoading || restoreLoading}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition text-left border-b border-gray-100 dark:border-gray-700"
        >
          {backupLoading ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin shrink-0" /> : <CloudUpload className="h-5 w-5 text-indigo-500 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Backup to Cloud</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lastBackedUpAt ? `Last backup: ${formatBackupTime(lastBackedUpAt)}` : "No backup yet"}
            </p>
          </div>
        </button>
        <button
          onClick={handleRestore}
          disabled={backupLoading || restoreLoading}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition text-left"
        >
          {restoreLoading ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin shrink-0" /> : <CloudDownload className="h-5 w-5 text-indigo-500 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Restore from Cloud</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overwrites local data with backup</p>
          </div>
        </button>
        {statusMsg && (
          <p className={`px-4 py-2 text-xs ${statusMsg.ok ? "text-green-600" : "text-red-500"}`}>
            {statusMsg.text}
          </p>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-4 text-left text-red-500 active:bg-red-50 dark:active:bg-red-950 transition"
          >
            <span className="text-lg shrink-0">🚪</span>
            <span className="text-sm font-medium">Sign Out</span>
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
