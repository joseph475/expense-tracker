import { Suspense } from "react";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import LoadingSpinner from "./LoadingSpinner";
import type { TransactionWithCategory } from "@/types/database";

interface DashboardStatsProps {
  transactions: TransactionWithCategory[];
  netWorth: number;
  symbol: string;
}

function StatsContent({ transactions, netWorth, symbol }: DashboardStatsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <ArrowUpRight className="h-4 w-4 text-green-600" />
          <span className="text-xs text-gray-600">Income</span>
        </div>
        <p className="text-lg font-semibold text-green-600">
          {formatCurrency(totalIncome, symbol)}
        </p>
      </div>

      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <ArrowDownLeft className="h-4 w-4 text-red-600" />
          <span className="text-xs text-gray-600">Expenses</span>
        </div>
        <p className="text-lg font-semibold text-red-600">
          {formatCurrency(totalExpenses, symbol)}
        </p>
      </div>

      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-gray-600">Net Worth</span>
        </div>
        <p className={`text-lg font-semibold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(netWorth, symbol)}
        </p>
      </div>
    </div>
  );
}

export default function DashboardStats(props: DashboardStatsProps) {
  return (
    <Suspense fallback={<LoadingSpinner size="sm" />}>
      <StatsContent {...props} />
    </Suspense>
  );
}