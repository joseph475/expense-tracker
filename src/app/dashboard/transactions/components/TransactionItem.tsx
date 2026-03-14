"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { TransactionWithCategory } from "@/types/database";
import { deleteTransaction } from "../actions";

export default function TransactionItem({
  transaction,
  currencySymbol,
}: {
  transaction: TransactionWithCategory;
  currencySymbol: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const isIncome = transaction.type === "income";

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    await deleteTransaction(transaction.id);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-xl shrink-0">{transaction.category.icon}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.description ?? transaction.category.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{transaction.category.name}</p>
      </div>

      <span className={`text-sm font-semibold shrink-0 ${isIncome ? "text-green-600" : "text-gray-900"}`}>
        {isIncome ? "+" : "-"}{currencySymbol}{Number(transaction.amount).toFixed(2)}
      </span>

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
