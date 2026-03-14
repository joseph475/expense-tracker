import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { TransactionWithCategory } from "@/types/database";
import DashboardFilterTabs from "./components/DashboardFilterTabs";
import AddTransactionButton from "./components/AddTransactionButton";
import CalendarView from "./components/CalendarView";
import RecentTransactions from "./components/RecentTransactions";
import DashboardStats from "./components/DashboardStats";
import LoadingSpinner from "./components/LoadingSpinner";
import {
  getCachedUserSession,
  getCachedUserSettings,
  getCachedCategories,
  getCachedAssets,
  getCachedAssetValues,
  getTransactions,
  calculateNetWorth,
} from "@/lib/data-fetching";

// Enable static generation for better performance
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

interface DashboardPageProps {
  searchParams: Promise<{ 
    view?: string; 
    date?: string; 
    month?: string; 
    search?: string; 
    accounts?: string 
  }>;
}

// Separate component for async data fetching
async function DashboardContent({ searchParams }: DashboardPageProps) {
  const { view = "today", date, month, search, accounts } = await searchParams;

  // Get user session (cached)
  const user = await getCachedUserSession();
  if (!user) redirect("/auth");

  // Calculate date range
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
    const monthEnd = new Date(ymYear, ymMonth, 0);
    dateFrom = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];
    dateTo = monthEndStr < todayStr ? monthEndStr : todayStr;
  }

  // Parallel data fetching with caching
  const [
    transactions,
    assets,
    settings,
    categories,
    accountAssets,
    assetValues,
  ] = await Promise.all([
    getTransactions(user.id, dateFrom, dateTo),
    getCachedAssets(user.id),
    getCachedUserSettings(user.id),
    getCachedCategories(user.id),
    getCachedAssets(user.id), // For account filtering
    getCachedAssetValues(user.id),
  ]);

  const symbol = settings?.currency_symbol ?? "$";
  let allTx = transactions;

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    allTx = allTx.filter(tx =>
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.category?.name?.toLowerCase().includes(searchLower) ||
      (tx as any).account?.name?.toLowerCase().includes(searchLower) ||
      (tx as any).to_account?.name?.toLowerCase().includes(searchLower)
    );
  }

  // Apply account filter
  if (accounts) {
    const accountIds = accounts.split(',').filter(Boolean);
    if (accountIds.length > 0) {
      allTx = allTx.filter(tx =>
        (tx.account_id && accountIds.includes(tx.account_id)) ||
        (tx.to_account_id && accountIds.includes(tx.to_account_id))
      );
    }
  }

  // Calculate net worth using cached function
  const netWorth = calculateNetWorth(assetValues);

  // Top 5 expense categories for the period (memoized)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <DashboardFilterTabs assets={accountAssets} />
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Section with Suspense */}
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <DashboardStats 
              transactions={allTx} 
              netWorth={netWorth} 
              symbol={symbol} 
            />
          </Suspense>

          {/* Main Content */}
          {view === "calendar" ? (
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarView
                transactions={allTx}
                symbol={symbol}
                currentDate={date || todayStr}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <RecentTransactions
                transactions={allTx}
                currencySymbol={symbol}
              />
            </Suspense>
          )}
        </div>

        {/* Floating Action Button */}
        <AddTransactionButton
          categories={categories}
          assets={assets}
          currencySymbol={symbol}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage(props: DashboardPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <DashboardContent {...props} />
    </Suspense>
  );
}
