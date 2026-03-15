"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useAppData } from "@/lib/AppDataContext";
import DashboardFilterTabs from "./components/DashboardFilterTabs";
import AddTransactionButton from "./components/AddTransactionButton";
import DashboardStats from "./components/DashboardStats";
import RecentTransactions from "./components/RecentTransactions";
import CalendarView from "./components/CalendarView";

function DashboardInner() {
  const { transactions, assets, settings } = useAppData();
  const params = useSearchParams();
  const view = params.get("view") ?? "today";
  const date = params.get("date") ?? "";
  const month = params.get("month") ?? "";
  const search = params.get("search") ?? "";
  const accountsFilter = params.get("accounts") ?? "";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  let dateFrom: string;
  let dateTo: string;

  if (view === "today") {
    dateFrom = todayStr;
    dateTo = todayStr;
  } else if (view === "calendar" && date) {
    dateFrom = date;
    dateTo = date;
  } else if (view === "calendar") {
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [y, m] = ym.split("-").map(Number);
    dateFrom = new Date(y, m - 1, 1).toISOString().split("T")[0];
    const end = new Date(y, m, 0).toISOString().split("T")[0];
    dateTo = end < todayStr ? end : todayStr;
  } else {
    const ym = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [y, m] = ym.split("-").map(Number);
    dateFrom = new Date(y, m - 1, 1).toISOString().split("T")[0];
    const end = new Date(y, m, 0).toISOString().split("T")[0];
    dateTo = end < todayStr ? end : todayStr;
  }

  const filteredTx = useMemo(() => {
    let tx = transactions.filter(t => t.date >= dateFrom && t.date <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      tx = tx.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.name?.toLowerCase().includes(q) ||
        t.account?.name?.toLowerCase().includes(q)
      );
    }
    if (accountsFilter) {
      const ids = accountsFilter.split(",").filter(Boolean);
      if (ids.length > 0) {
        tx = tx.filter(t =>
          (t.account_id && ids.includes(t.account_id)) ||
          (t.to_account_id && ids.includes(t.to_account_id))
        );
      }
    }
    return tx;
  }, [transactions, dateFrom, dateTo, search, accountsFilter]);


  const symbol = settings.currency_symbol;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <DashboardFilterTabs assets={assets} />
      </div>
      {view !== "calendar" && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
          <DashboardStats transactions={filteredTx} symbol={symbol} />
        </div>
      )}
      {view === "calendar" ? (
        <CalendarView transactions={filteredTx} symbol={symbol} currentDate={date || todayStr} />
      ) : (
        <RecentTransactions transactions={filteredTx} currencySymbol={symbol} />
      )}
      <AddTransactionButton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
