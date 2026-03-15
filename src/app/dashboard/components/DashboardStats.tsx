import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatAmount } from "@/lib/currency";
import type { TransactionWithCategory } from "@/types/database";

interface DashboardStatsProps {
  transactions: TransactionWithCategory[];
  symbol: string;
}

function StatsContent({ transactions, symbol }: DashboardStatsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const total = totalIncome - totalExpenses;

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col items-center gap-0.5 py-2">
        <div className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-green-600" />
          <span className="text-xs text-gray-400 dark:text-gray-500">In</span>
        </div>
        <span className="text-sm font-semibold text-green-600">{formatAmount(totalIncome, symbol)}</span>
      </div>
      <div className="w-px bg-gray-100 dark:bg-gray-700" />
      <div className="flex flex-1 flex-col items-center gap-0.5 py-2">
        <div className="flex items-center gap-1">
          <ArrowDownLeft className="h-3 w-3 text-red-400" />
          <span className="text-xs text-gray-400 dark:text-gray-500">Out</span>
        </div>
        <span className="text-sm font-semibold text-red-400">{formatAmount(totalExpenses, symbol)}</span>
      </div>
      <div className="w-px bg-gray-100 dark:bg-gray-700" />
      <div className="flex flex-1 flex-col items-center gap-0.5 py-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">Total</span>
        <span className={`text-sm font-semibold ${total >= 0 ? "text-gray-900 dark:text-white" : "text-red-500"}`}>
          {formatAmount(total, symbol)}
        </span>
      </div>
    </div>
  );
}

export default function DashboardStats(props: DashboardStatsProps) {
  return <StatsContent {...props} />;
}