// ============================================================
// Database Types — Expense Tracker
// ============================================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  /** NULL = default/global category; set = user-owned custom category */
  user_id: string | null;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  date: string; // ISO date string, e.g. "2026-03-14"
  created_at: string;
  updated_at: string;
}

// Joined variant returned when you select expenses with category data
export interface ExpenseWithCategory extends Expense {
  category: Category;
}

// Payload types for inserts / updates (omit server-generated fields)
export type NewExpense = Omit<Expense, "id" | "created_at" | "updated_at">;
export type UpdateExpense = Partial<Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">>;

export type NewCategory = Omit<Category, "id">;
export type UpdateCategory = Partial<Omit<Category, "id" | "user_id">>;
