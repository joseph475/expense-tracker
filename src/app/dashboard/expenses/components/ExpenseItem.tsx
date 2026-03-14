"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { TransactionWithCategory } from "@/types/database";
import { deleteExpense } from "../actions";

export default function ExpenseItem({
  expense,
}: {
  expense: TransactionWithCategory;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel confirm after 3s
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    await deleteExpense(expense.id);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {/* Icon */}
      <span className="text-xl shrink-0">{expense.category?.icon || "💸"}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {expense.description ?? expense.category?.name ?? "Expense"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{expense.category?.name ?? "Expense"}</p>
      </div>

      {/* Amount */}
      <span className="text-sm font-semibold text-gray-900 shrink-0">
        ${Number(expense.amount).toFixed(2)}
      </span>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`shrink-0 p-1.5 rounded-lg text-xs transition ${
          confirming
            ? "bg-red-100 text-red-600 font-medium px-2"
            : "text-gray-300 hover:text-red-400 hover:bg-red-50"
        }`}
      >
        {confirming ? "Sure?" : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
