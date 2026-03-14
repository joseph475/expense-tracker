// ============================================================
// Database Types — Money Tracker
// ============================================================

export type TransactionType = "expense" | "income" | "transfer";
export type AssetCategory = "cash" | "investment" | "property" | "vehicle" | "liability" | "other";
export type CategoryType = "expense" | "income";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  user_id: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  to_account_id?: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

export interface AssetCategoryRow {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  is_liability: boolean;
  created_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory; // legacy field — kept for backwards compat
  asset_category_id: string | null;
  current_value: number;
  interest_rate: number | null; // annual %, e.g. 3.5 means 3.5%
  created_at: string;
  updated_at: string;
}

export interface AssetWithCategory extends Asset {
  assetCategory: Pick<AssetCategoryRow, "id" | "name" | "icon" | "is_liability"> | null;
}

export interface AssetSnapshot {
  id: string;
  asset_id: string;
  user_id: string;
  value: number;
  year: number;
  month: number;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  currency_code: string;
  currency_symbol: string;
  updated_at: string;
}

// Insert / update payloads
export type NewTransaction = Omit<Transaction, "id" | "created_at" | "updated_at">;
export type NewAsset = Omit<Asset, "id" | "created_at" | "updated_at">;
export type NewAssetSnapshot = Omit<AssetSnapshot, "id" | "created_at">;
