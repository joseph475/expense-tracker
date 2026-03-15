"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Transaction, Asset, AssetWithCategory, Category, AssetCategoryRow, TransactionWithCategory } from "@/types/database";
import { DEFAULT_CATEGORIES, DEFAULT_ASSET_CATEGORIES } from "./defaults";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function lsKey(userId: string, type: string) {
  return `mt_${userId}_${type}`;
}

function lsLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function lsSave(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function now() { return new Date().toISOString(); }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionFull extends Transaction {
  category: Category | null;
  account: (Pick<Asset, "id" | "name"> & { assetCategory: Pick<AssetCategoryRow, "name" | "icon" | "is_liability"> | null }) | null;
  to_account: (Pick<Asset, "id" | "name"> & { assetCategory: Pick<AssetCategoryRow, "name" | "icon" | "is_liability"> | null }) | null;
}

export interface Settings {
  currency_code: string;
  currency_symbol: string;
  theme?: "light" | "dark";
}

interface AppContextValue {
  userId: string;
  userEmail: string;
  transactions: TransactionFull[];
  assets: AssetWithCategory[];
  categories: Category[];
  assetCategories: AssetCategoryRow[];
  settings: Settings;
  // Transactions
  addTransaction: (data: {
    type: "expense" | "income" | "transfer";
    amount: number;
    category_id: string | null;
    account_id: string;
    to_account_id?: string | null;
    description: string | null;
    date: string;
  }) => string | null; // returns error string or null on success
  // Assets
  addAsset: (data: { name: string; asset_category_id: string | null; current_value: number; interest_rate: number | null }) => void;
  updateAssetValue: (id: string, value: number) => void;
  deleteAsset: (id: string) => void;
  // Categories
  addCategory: (data: { name: string; icon: string; type: "expense" | "income" }) => void;
  deleteCategory: (id: string) => void;
  // Asset categories
  addAssetCategory: (data: { name: string; icon: string; is_liability: boolean }) => void;
  updateAssetCategory: (id: string, data: { name: string; icon: string; is_liability: boolean }) => void;
  deleteAssetCategory: (id: string) => void;
  // Settings
  updateSettings: (data: Settings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({
  userId,
  userEmail,
  children,
}: {
  userId: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategoryRow[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency_code: "USD", currency_symbol: "$" });
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTx = lsLoad<Transaction[]>(lsKey(userId, "transactions"), []);
    const savedAssets = lsLoad<Asset[]>(lsKey(userId, "assets"), []);
    const savedSettings = lsLoad<Settings>(lsKey(userId, "settings"), { currency_code: "USD", currency_symbol: "$" });

    // For categories: load saved, but always include defaults (merge: keep defaults + user-custom)
    const savedCats = lsLoad<Category[]>(lsKey(userId, "categories"), []);
    // Check if defaults are already included
    const hasDefaults = savedCats.some(c => c.id.startsWith("def-cat-"));
    const mergedCats = hasDefaults ? savedCats : [...DEFAULT_CATEGORIES, ...savedCats.filter(c => c.user_id !== null)];

    const savedAC = lsLoad<AssetCategoryRow[]>(lsKey(userId, "asset_categories"), []);
    const hasACDefaults = savedAC.some(c => c.id.startsWith("def-ac-"));
    let mergedAC = hasACDefaults ? savedAC : [...DEFAULT_ASSET_CATEGORIES, ...savedAC.filter(c => c.user_id !== null)];

    // Migration: rename "Cash / Bank" → "Cash" and inject "Bank" if missing
    const hasCashBank = mergedAC.some(c => c.id === "def-ac-cash" && c.name === "Cash / Bank");
    const hasBank = mergedAC.some(c => c.id === "def-ac-bank");
    if (hasCashBank || !hasBank) {
      mergedAC = mergedAC.map(c =>
        c.id === "def-ac-cash" ? { ...c, name: "Cash", icon: "💵" } : c
      );
      if (!hasBank) {
        const cashIdx = mergedAC.findIndex(c => c.id === "def-ac-cash");
        const bankEntry: AssetCategoryRow = { id: "def-ac-bank", name: "Bank", icon: "🏦", is_liability: false, user_id: null, created_at: "" };
        mergedAC = [...mergedAC.slice(0, cashIdx + 1), bankEntry, ...mergedAC.slice(cashIdx + 1)];
      }
      lsSave(lsKey(userId, "asset_categories"), mergedAC);
    }

    setTransactions(savedTx);
    setAssets(savedAssets);
    setCategories(mergedCats);
    setAssetCategories(mergedAC);
    setSettings(savedSettings);

    // Apply theme class
    const isDark = savedSettings.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("mt_theme", isDark ? "dark" : "light"); } catch {}

    // Persist merged categories if they were freshly seeded
    if (!hasDefaults) lsSave(lsKey(userId, "categories"), mergedCats);
    if (!hasACDefaults) lsSave(lsKey(userId, "asset_categories"), mergedAC);

    setLoaded(true);
  }, [userId]);

  // ─── Derived data (joined) ─────────────────────────────────────────────────

  const assetsWithCategory = useMemo<AssetWithCategory[]>(() =>
    assets.map(a => ({
      ...a,
      assetCategory: assetCategories.find(ac => ac.id === a.asset_category_id) ?? null,
    })),
    [assets, assetCategories]
  );

  const transactionsFull = useMemo<TransactionFull[]>(() => {
    const assetMap = new Map(assets.map(a => [a.id, a]));
    const acMap = new Map(assetCategories.map(ac => [ac.id, ac]));

    return [...transactions]
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.created_at.localeCompare(a.created_at);
      })
      .map(t => {
        const rawAsset = t.account_id ? assetMap.get(t.account_id) ?? null : null;
        const rawToAsset = t.to_account_id ? assetMap.get(t.to_account_id) ?? null : null;
        return {
          ...t,
          category: t.category_id ? categories.find(c => c.id === t.category_id) ?? null : null,
          account: rawAsset ? {
            id: rawAsset.id,
            name: rawAsset.name,
            assetCategory: rawAsset.asset_category_id ? acMap.get(rawAsset.asset_category_id) ?? null : null,
          } : null,
          to_account: rawToAsset ? {
            id: rawToAsset.id,
            name: rawToAsset.name,
            assetCategory: rawToAsset.asset_category_id ? acMap.get(rawToAsset.asset_category_id) ?? null : null,
          } : null,
        };
      });
  }, [transactions, assets, assetCategories, categories]);

  // ─── CRUD helpers ──────────────────────────────────────────────────────────

  function saveTransactions(updated: Transaction[]) {
    setTransactions(updated);
    lsSave(lsKey(userId, "transactions"), updated);
  }

  function saveAssets(updated: Asset[]) {
    setAssets(updated);
    lsSave(lsKey(userId, "assets"), updated);
  }

  function saveCategories(updated: Category[]) {
    setCategories(updated);
    lsSave(lsKey(userId, "categories"), updated);
  }

  function saveAssetCategories(updated: AssetCategoryRow[]) {
    setAssetCategories(updated);
    lsSave(lsKey(userId, "asset_categories"), updated);
  }

  // ─── Transaction operations ────────────────────────────────────────────────

  function addTransaction(data: Parameters<AppContextValue["addTransaction"]>[0]): string | null {
    const { type, amount, category_id, account_id, to_account_id, description, date } = data;

    if (!amount || amount <= 0) return "Amount must be positive.";
    if (type !== "transfer" && !category_id) return "Please select a category.";
    if (!account_id) return "Please select an account.";
    if (type === "transfer" && !to_account_id) return "Please select a destination account.";
    if (type === "transfer" && account_id === to_account_id) return "Cannot transfer to the same account.";

    // Insert transaction
    const tx: Transaction = {
      id: uid(),
      user_id: userId,
      type,
      amount,
      category_id: type === "transfer" ? null : (category_id ?? null),
      account_id,
      to_account_id: type === "transfer" ? (to_account_id ?? null) : null,
      description,
      date,
      created_at: now(),
      updated_at: now(),
    };

    const newTxList = [...transactions, tx];

    // Update asset balances
    let updatedAssets = [...assets];

    function applyDelta(assetId: string, delta: number) {
      updatedAssets = updatedAssets.map(a => {
        if (a.id !== assetId) return a;
        return { ...a, current_value: Number(a.current_value) + delta, updated_at: now() };
      });
    }

    const fromAsset = assets.find(a => a.id === account_id);
    const fromAC = fromAsset?.asset_category_id ? assetCategories.find(ac => ac.id === fromAsset.asset_category_id) : null;
    const fromIsLiability = fromAC?.is_liability ?? fromAsset?.category === "liability";

    if (type === "expense") {
      applyDelta(account_id, fromIsLiability ? +amount : -amount);
    } else if (type === "income") {
      applyDelta(account_id, fromIsLiability ? -amount : +amount);
    } else if (type === "transfer" && to_account_id) {
      const toAsset = assets.find(a => a.id === to_account_id);
      const toAC = toAsset?.asset_category_id ? assetCategories.find(ac => ac.id === toAsset.asset_category_id) : null;
      const toIsLiability = toAC?.is_liability ?? toAsset?.category === "liability";
      applyDelta(account_id, fromIsLiability ? +amount : -amount);
      applyDelta(to_account_id, toIsLiability ? -amount : +amount);
    }

    saveTransactions(newTxList);
    saveAssets(updatedAssets);
    return null;
  }

  // ─── Asset operations ──────────────────────────────────────────────────────

  function addAsset(data: Parameters<AppContextValue["addAsset"]>[0]) {
    const ac = data.asset_category_id ? assetCategories.find(c => c.id === data.asset_category_id) : null;
    // Derive legacy category
    let category: Asset["category"] = "other";
    if (ac) {
      if (ac.is_liability) category = "liability";
      else {
        const map: Record<string, Asset["category"]> = {
          "Cash / Bank": "cash", "Investment": "investment",
          "Property": "property", "Vehicle": "vehicle", "Other": "other",
        };
        category = map[ac.name] ?? "other";
      }
    }
    const asset: Asset = {
      id: uid(), user_id: userId, name: data.name,
      category, asset_category_id: data.asset_category_id,
      current_value: data.current_value, interest_rate: data.interest_rate,
      created_at: now(), updated_at: now(),
    };
    saveAssets([...assets, asset]);
  }

  function updateAssetValue(id: string, value: number) {
    saveAssets(assets.map(a => a.id === id ? { ...a, current_value: value, updated_at: now() } : a));
  }

  function deleteAsset(id: string) {
    saveAssets(assets.filter(a => a.id !== id));
  }

  // ─── Category operations ───────────────────────────────────────────────────

  function addCategory(data: Parameters<AppContextValue["addCategory"]>[0]) {
    const cat: Category = { id: uid(), user_id: userId, ...data };
    saveCategories([...categories, cat]);
  }

  function deleteCategory(id: string) {
    saveCategories(categories.filter(c => c.id !== id));
  }

  // ─── Asset category operations ─────────────────────────────────────────────

  function addAssetCategory(data: Parameters<AppContextValue["addAssetCategory"]>[0]) {
    const ac: AssetCategoryRow = { id: uid(), user_id: userId, created_at: now(), ...data };
    saveAssetCategories([...assetCategories, ac]);
  }

  function updateAssetCategory(id: string, data: Parameters<AppContextValue["updateAssetCategory"]>[1]) {
    saveAssetCategories(assetCategories.map(ac => ac.id === id ? { ...ac, ...data } : ac));
  }

  function deleteAssetCategory(id: string) {
    saveAssetCategories(assetCategories.filter(ac => ac.id !== id));
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  function updateSettings(data: Settings) {
    setSettings(data);
    lsSave(lsKey(userId, "settings"), data);
    // Apply theme immediately
    const isDark = data.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("mt_theme", isDark ? "dark" : "light"); } catch {}
  }

  // Don't render children until data is loaded from localStorage
  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      userId, userEmail,
      transactions: transactionsFull,
      assets: assetsWithCategory,
      categories,
      assetCategories,
      settings,
      addTransaction,
      addAsset, updateAssetValue, deleteAsset,
      addCategory, deleteCategory,
      addAssetCategory, updateAssetCategory, deleteAssetCategory,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}
