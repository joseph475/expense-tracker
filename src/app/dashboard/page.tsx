import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { TransactionWithCategory } from "@/types/database";
import DashboardFilterTabs from "./components/DashboardFilterTabs";
import AddTransactionButton from "./components/AddTransactionButton";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string; month?: string }>;
}) {
  const { view = "today", date, month } = await searchParams;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  let dateFrom: string;
  let dateTo: string;

  if (view === "today") {
    dateFrom = todayStr;
    dateTo = todayStr;
  } else if (view === "date" && date) {
    dateFrom = date;
    dateTo = date;
  } else {
    // month view — use ?month=YYYY-MM param or current month
    const ym = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [ymYear, ymMonth] = ym.split("-").map(Number);
    const monthStart = new Date(ymYear, ymMonth - 1, 1);
    const monthEnd = new Date(ymYear, ymMonth, 0); // last day of month
    dateFrom = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];
    dateTo = monthEndStr < todayStr ? monthEndStr : todayStr;
  }

  const [
    { data: transactions },
    { data: assets },
    { data: settings },
    { data: categories },
    { data: accountAssets },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user!.id)
      .gte("date", dateFrom)
      .lte("date", dateTo)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("assets")
      .select("current_value, category")
      .eq("user_id", user!.id),
    supabase
      .from("user_settings")
      .select("currency_symbol")
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user!.id}`)
      .order("name"),
    supabase
      .from("assets")
      .select("*")
      .eq("user_id", user!.id)
      .order("name"),
  ]);

  const symbol = settings?.currency_symbol ?? "$";
  const allTx = (transactions ?? []) as TransactionWithCategory[];

  const totalIncome = allTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = allTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  const allAssets = assets ?? [];
  const totalAssets = allAssets
    .filter((a) => a.category !== "liability")
    .reduce((s, a) => s + Number(a.current_value), 0);
  const totalLiabilities = allAssets
    .filter((a) => a.category === "liability")
    .reduce((s, a) => s + Number(a.current_value), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Top 5 expense categories for the period
  const categoryTotals = allTx
    .filter((t) => t.type === "expense")
    .reduce<Record<string, { name: string; icon: string; total: number }>>(
      (acc, t) => {
        const id = t.category_id;
        if (!acc[id]) acc[id] = { name: t.category.name, icon: t.category.icon, total: 0 };
        acc[id].total += Number(t.amount);
        return acc;
      },
      {}
    );

  const topCategories = Object.values(categoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentTx = allTx.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <Suspense fallback={null}>
        <DashboardFilterTabs />
      </Suspense>

      {/* Add transaction FAB */}
      <AddTransactionButton categories={categories ?? []} assets={accountAssets ?? []} />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Income */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-green-100 rounded-lg">
              <ArrowDownLeft className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Income</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{symbol}{totalIncome.toFixed(2)}</p>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-red-100 rounded-lg">
              <ArrowUpRight className="h-3 w-3 text-red-500" />
            </div>
            <span className="text-xs font-medium text-gray-500">Expenses</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{symbol}{totalExpenses.toFixed(2)}</p>
        </div>

        {/* Total (Net Balance) */}
        <div className={`rounded-xl border shadow-sm p-3 ${netBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1 rounded-lg ${netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-3 w-3 ${netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`} />
            </div>
            <span className="text-xs font-medium text-gray-500">Total</span>
          </div>
          <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {netBalance >= 0 ? '+' : ''}{symbol}{netBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <h2 className="text-xs font-semibold text-gray-700">Top Spending</h2>
          </div>
          <div className="space-y-2">
            {topCategories.map((cat) => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-900">
                      {symbol}{cat.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-100">
                    <div
                      className="h-1 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
          <h2 className="text-xs font-semibold text-gray-700">Recent Transactions</h2>
          <div className="divide-y divide-gray-50">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center gap-2 py-1.5">
                <span className="text-sm shrink-0">{t.category.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {t.description ?? t.category.name}
                  </p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${t.type === "income" ? "text-green-600" : "text-gray-900"}`}>
                  {t.type === "income" ? "+" : "-"}{symbol}{Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allTx.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center space-y-1">
          <p className="text-xs text-gray-500 font-medium">No transactions for this period</p>
          <p className="text-xs text-gray-400">Tap the + button to add one.</p>
        </div>
      )}
    </div>
  );
}
