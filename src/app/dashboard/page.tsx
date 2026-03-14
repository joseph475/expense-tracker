import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { TransactionWithCategory } from "@/types/database";
import DashboardFilterTabs from "./components/DashboardFilterTabs";
import AddTransactionButton from "./components/AddTransactionButton";
import CalendarView from "./components/CalendarView";
import RecentTransactions from "./components/RecentTransactions";

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
  } else if (view === "calendar" && date) {
    dateFrom = date;
    dateTo = date;
  } else if (view === "calendar") {
    // Calendar view without specific date - show current month
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [ymYear, ymMonth] = ym.split("-").map(Number);
    const monthStart = new Date(ymYear, ymMonth - 1, 1);
    const monthEnd = new Date(ymYear, ymMonth, 0);
    dateFrom = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];
    dateTo = monthEndStr < todayStr ? monthEndStr : todayStr;
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
    .filter((t) => t.type === "expense" && t.category_id && t.category)
    .reduce<Record<string, { name: string; icon: string; total: number }>>(
      (acc, t) => {
        const id = t.category_id!;
        if (!acc[id]) acc[id] = { name: t.category!.name, icon: t.category!.icon, total: 0 };
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
    <div className="min-h-screen bg-gray-50">
      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100">
        <Suspense fallback={null}>
          <DashboardFilterTabs />
        </Suspense>
      </div>

      {/* Add transaction FAB */}
      <AddTransactionButton categories={categories ?? []} assets={accountAssets ?? []} currencySymbol={symbol} />

      {/* Calendar View */}
      {view === "calendar" ? (
        <CalendarView
          transactions={allTx}
          symbol={symbol}
          currentDate={date}
        />
      ) : (
        <>
          {/* Summary section */}
          <div className="bg-white px-3 py-3 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-3">
              {/* Income */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-0.5">
                  <ArrowDownLeft className="h-3.5 w-3.5 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Income</span>
                </div>
                <p className="text-sm font-bold text-green-600">{symbol}{totalIncome.toFixed(2)}</p>
              </div>

              {/* Expenses */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-500 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Expenses</span>
                </div>
                <p className="text-sm font-bold text-red-500">{symbol}{totalExpenses.toFixed(2)}</p>
              </div>

              {/* Total (Net Balance) */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-0.5">
                  <TrendingUp className={`h-3.5 w-3.5 mr-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`} />
                  <span className="text-xs font-medium text-gray-600">Total</span>
                </div>
                <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {netBalance >= 0 ? '+' : ''}{symbol}{netBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>


      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <RecentTransactions transactions={recentTx} currencySymbol={symbol} />
      )}

      {/* Empty state */}
      {allTx.length === 0 && (
        <div className="bg-white px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">No transactions for this period</p>
          <p className="text-xs text-gray-400">Tap the + button to add your first transaction</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
