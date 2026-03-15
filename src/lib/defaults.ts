import type { Category, AssetCategoryRow } from "@/types/database";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "def-cat-food", name: "Food & Drinks", icon: "🍔", type: "expense", user_id: null },
  { id: "def-cat-transport", name: "Transport", icon: "🚌", type: "expense", user_id: null },
  { id: "def-cat-shopping", name: "Shopping", icon: "🛍️", type: "expense", user_id: null },
  { id: "def-cat-entertainment", name: "Entertainment", icon: "🎬", type: "expense", user_id: null },
  { id: "def-cat-health", name: "Health", icon: "💊", type: "expense", user_id: null },
  { id: "def-cat-bills", name: "Bills", icon: "⚡", type: "expense", user_id: null },
  { id: "def-cat-education", name: "Education", icon: "🎓", type: "expense", user_id: null },
  { id: "def-cat-other-exp", name: "Others", icon: "📦", type: "expense", user_id: null },
  { id: "def-cat-salary", name: "Salary", icon: "💼", type: "income", user_id: null },
  { id: "def-cat-freelance", name: "Freelance", icon: "💻", type: "income", user_id: null },
  { id: "def-cat-business", name: "Business", icon: "🏢", type: "income", user_id: null },
  { id: "def-cat-invest-inc", name: "Investment Returns", icon: "📈", type: "income", user_id: null },
  { id: "def-cat-other-inc", name: "Others", icon: "💰", type: "income", user_id: null },
];

export const DEFAULT_ASSET_CATEGORIES: AssetCategoryRow[] = [
  { id: "def-ac-cash",       name: "Cash",         icon: "💵", is_liability: false, user_id: null, created_at: "" },
  { id: "def-ac-bank",       name: "Bank",         icon: "🏦", is_liability: false, user_id: null, created_at: "" },
  { id: "def-ac-investment", name: "Investment",   icon: "📈", is_liability: false, user_id: null, created_at: "" },
  { id: "def-ac-property",   name: "Property",     icon: "🏠", is_liability: false, user_id: null, created_at: "" },
  { id: "def-ac-vehicle",    name: "Vehicle",      icon: "🚗", is_liability: false, user_id: null, created_at: "" },
  { id: "def-ac-liability",  name: "Liability",    icon: "💳", is_liability: true,  user_id: null, created_at: "" },
  { id: "def-ac-other",      name: "Other",        icon: "📦", is_liability: false, user_id: null, created_at: "" },
];
