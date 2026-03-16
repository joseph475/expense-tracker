"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, CloudUpload, CloudDownload, Loader2,
  PieChart, Tag, Layers, CircleDollarSign, Moon, Sun, LogOut, Trash2,
} from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { saveBackup, loadBackup, getLastBackupTime } from "../actions";
import { useAppData } from "@/lib/AppDataContext";
import { createClient } from "@/lib/supabase/client";
import CategoryManager from "../../categories/components/CategoryManager";
import AssetCategoryManager from "../../categories/components/AssetCategoryManager";
import SettingsForm from "./SettingsForm";
import SharedSheet from "@/app/dashboard/components/Sheet";

type SheetType = "tx_categories" | "asset_categories" | "currency" | "reset" | null;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-6 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {children}
    </p>
  );
}

function Row({
  icon,
  iconColor = "text-indigo-500",
  iconBg = "bg-indigo-50 dark:bg-indigo-950",
  label,
  description,
  right,
  onClick,
  border = true,
}: {
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  border?: boolean;
}) {
  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${border ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      {right}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition"
      >
        {inner}
      </button>
    );
  }

  return <div>{inner}</div>;
}

export default function MorePageClient() {
  const { userEmail, settings, userId, updateSettings } = useAppData();
  const [sheet, setSheet] = useState<SheetType>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [lastBackedUpAt, setLastBackedUpAt] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

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

  async function handleResetConfirm() {
    if (!resetPassword) { setResetError("Please enter your password."); return; }
    setResetLoading(true);
    setResetError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password: resetPassword });
      if (error) { setResetError("Incorrect password. Please try again."); return; }
      localStorage.removeItem(`mt_${userId}_transactions`);
      localStorage.removeItem(`mt_${userId}_assets`);
      localStorage.removeItem(`mt_${userId}_categories`);
      localStorage.removeItem(`mt_${userId}_asset_categories`);
      localStorage.removeItem(`mt_${userId}_settings`);
      window.location.reload();
    } finally {
      setResetLoading(false);
    }
  }

  function formatBackupTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }

  const initials = userEmail.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3.5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">More</h1>
      </div>

      {/* User card */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3.5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-white">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userEmail}</p>
          <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Signed in
          </span>
        </div>
      </div>

      {/* Insights */}
      <SectionLabel>Insights</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/dashboard/stats"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 transition"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-950">
            <PieChart className="h-4 w-4 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Statistics</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Charts & category breakdown</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
        </Link>
      </div>

      {/* Preferences */}
      <SectionLabel>Preferences</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <Row
          icon={isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          iconColor={isDark ? "text-indigo-400" : "text-amber-500"}
          iconBg={isDark ? "bg-indigo-950" : "bg-amber-50 dark:bg-amber-950"}
          label="Appearance"
          description={isDark ? "Dark mode" : "Light mode"}
          onClick={toggleTheme}
          right={
            <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isDark ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`}
              role="switch" aria-checked={isDark}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
            </div>
          }
        />
        <Row
          icon={<CircleDollarSign className="h-4 w-4" />}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          label="Currency"
          description={`${settings.currency_code} · ${settings.currency_symbol}`}
          onClick={() => setSheet("currency")}
          right={<ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
          border={false}
        />
      </div>

      {/* Manage */}
      <SectionLabel>Manage</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <Row
          icon={<Tag className="h-4 w-4" />}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50 dark:bg-indigo-950"
          label="Transaction Categories"
          description="Income & expense labels"
          onClick={() => setSheet("tx_categories")}
          right={<ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
        />
        <Row
          icon={<Layers className="h-4 w-4" />}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50 dark:bg-indigo-950"
          label="Account Categories"
          description="Asset & liability types"
          onClick={() => setSheet("asset_categories")}
          right={<ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
          border={false}
        />
      </div>

      {/* Data */}
      <SectionLabel>Data</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <Row
          icon={backupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
          iconColor="text-sky-500"
          iconBg="bg-sky-50 dark:bg-sky-950"
          label="Backup to Cloud"
          description={lastBackedUpAt ? `Last: ${formatBackupTime(lastBackedUpAt)}` : "No backup yet"}
          onClick={backupLoading || restoreLoading ? undefined : handleBackup}
        />
        <Row
          icon={restoreLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
          iconColor="text-sky-500"
          iconBg="bg-sky-50 dark:bg-sky-950"
          label="Restore from Cloud"
          description="Overwrites local data"
          onClick={backupLoading || restoreLoading ? undefined : handleRestore}
          border={false}
        />
      </div>
      {statusMsg && (
        <p className={`mx-4 mt-2 px-3 py-2 rounded-xl text-xs ${statusMsg.ok ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"}`}>
          {statusMsg.text}
        </p>
      )}

      {/* Danger Zone */}
      <SectionLabel>Danger Zone</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <Row
          icon={<Trash2 className="h-4 w-4" />}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-950"
          label="Reset All Data"
          description="Delete all transactions, accounts & categories"
          onClick={() => { setResetPassword(""); setResetError(null); setSheet("reset"); }}
          border={false}
        />
      </div>

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <div className="bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-950 active:bg-red-100 transition text-left"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950">
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500">Sign Out</span>
          </button>
        </form>
      </div>

      {/* Sheets */}
      <SharedSheet title="Transaction Categories" open={sheet === "tx_categories"} onClose={() => setSheet(null)}>
        <div className="flex-1 px-4 py-3.5 overflow-y-auto">
          <CategoryManager />
        </div>
      </SharedSheet>

      <SharedSheet title="Account Categories" open={sheet === "asset_categories"} onClose={() => setSheet(null)}>
        <div className="flex-1 px-4 py-3.5 overflow-y-auto">
          <AssetCategoryManager />
        </div>
      </SharedSheet>

      <SharedSheet title="Reset All Data" open={sheet === "reset"} onClose={() => setSheet(null)} footer={
        <div className="flex gap-3">
          <button
            onClick={handleResetConfirm}
            disabled={resetLoading || !resetPassword}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {resetLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</> : "Reset All Data"}
          </button>
          <button onClick={() => setSheet(null)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition">
            Cancel
          </button>
        </div>
      }>
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This will permanently delete all transactions, accounts, and categories. This action cannot be undone.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            <div className="flex items-center px-4 h-14">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Password</span>
              <input
                type="password"
                placeholder="Enter password"
                value={resetPassword}
                onChange={(e) => { setResetPassword(e.target.value); setResetError(null); }}
                className="flex-1 text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                autoComplete="current-password"
              />
            </div>
          </div>
          {resetError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-xl px-3 py-2">{resetError}</p>
          )}
        </div>
      </SharedSheet>

      <SharedSheet title="Currency" open={sheet === "currency"} onClose={() => setSheet(null)}>
        <div className="flex-1 px-4 py-3.5 overflow-y-auto">
          <SettingsForm currentCode={settings.currency_code} />
        </div>
      </SharedSheet>

    </div>
  );
}
