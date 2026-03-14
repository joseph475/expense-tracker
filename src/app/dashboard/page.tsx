import { createClient } from "@/lib/supabase/server";
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { TransactionWithCategory } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { data: transactions },
    { data: assets },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user!.id)
      .gte("date", firstOfMonth)
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

  // Top 5 expense categories this month
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

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">{monthName}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Net balance */}
        <div className={`col-span-2 rounded-2xl p-5 text-white ${netBalance >= 0 ? "bg-indigo-600" : "bg-rose-500"}`}>
          <p className="text-sm opacity-80">Net Balance</p>
          <p className="text-3xl font-bold mt-1">
            {netBalance >= 0 ? "+" : "-"}{symbol}{Math.abs(netBalance).toFixed(2)}
          </p>
          <p className="text-xs opacity-70 mt-1">This month</p>
        </div>

        {/* Income */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Income</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{symbol}{totalIncome.toFixed(2)}</p>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
            </div>
            <span className="text-xs font-medium text-gray-500">Expenses</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{symbol}{totalExpenses.toFixed(2)}</p>
        </div>

        {/* Net worth */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Wallet className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">Net Worth</p>
            <p className={`text-xl font-bold mt-0.5 ${netWorth >= 0 ? "text-gray-900" : "text-rose-500"}`}>
              {symbol}{netWorth.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {symbol}{totalAssets.toFixed(2)} assets − {symbol}{totalLiabilities.toFixed(2)} liabilities
            </p>
          </div>
          <Link href="/dashboard/assets" className="text-xs text-indigo-600 font-medium">
            View →
          </Link>
        </div>
      </div>

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Top Spending</h2>
          </div>
          <div className="space-y-3">
            {topCategories.map((cat) => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {symbol}{cat.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500 transition-all"
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-xs text-indigo-600 font-medium">
              See all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl shrink-0">{t.category.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {t.description ?? t.category.name}
                  </p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${t.type === "income" ? "text-green-600" : "text-gray-900"}`}>
                  {t.type === "income" ? "+" : "-"}{symbol}{Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allTx.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center space-y-2">
          <p className="text-sm text-gray-500 font-medium">No transactions this month</p>
          <p className="text-xs text-gray-400">
            Go to{" "}
            <Link href="/dashboard/transactions" className="text-indigo-600 font-medium">
              Transactions
            </Link>{" "}
            to add your first one.
          </p>
        </div>
      )}
    </div>
  );
}
