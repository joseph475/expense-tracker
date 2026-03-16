"use client";

import { useMemo } from "react";
import { useAppData } from "@/lib/AppDataContext";
import BudgetsClient from "./components/BudgetsClient";

export default function BudgetsPage() {
  const { budgets, categories, transactions, settings } = useAppData();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  // Compute this month's spending per category
  const thisMonth = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.date.startsWith(prefix) && tx.category_id) {
        map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + Number(tx.amount));
      }
    }
    return map;
  }, [transactions]);

  return (
    <BudgetsClient
      budgets={budgets}
      expenseCategories={expenseCategories}
      thisMonthSpending={thisMonth}
      symbol={settings.currency_symbol}
    />
  );
}
