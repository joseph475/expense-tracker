"use client";

import { useState, useMemo } from "react";
import { Transaction, Category } from "@/types/database";
import MiniPieChart from "./MiniPieChart";
import BarChart from "./BarChart";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

interface StatsClientProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currencyCode: string;
}

type FilterPeriod = "month" | "year" | "all";

export default function StatsClient({ transactions, categories, currencyCode }: StatsClientProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // ── Filtered transactions for pie charts / summary ─────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.type === "transfer") return false;
      const txDate = new Date(tx.date);
      if (filterPeriod === "month") {
        const [y, m] = selectedMonth.split("-");
        return txDate.getFullYear() === parseInt(y) && txDate.getMonth() === parseInt(m) - 1;
      }
      if (filterPeriod === "year") return txDate.getFullYear() === parseInt(selectedYear);
      return true;
    });
  }, [transactions, filterPeriod, selectedMonth, selectedYear]);

  // ── Summary totals ─────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => filteredTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );
  const totalExpense = useMemo(
    () => filteredTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );
  const net = totalIncome - totalExpense;

  // ── Pie chart data ─────────────────────────────────────────────────────────
  const incomeData = useMemo(() => categoryTotals(filteredTransactions.filter(t => t.type === "income")), [filteredTransactions]);
  const expenseData = useMemo(() => categoryTotals(filteredTransactions.filter(t => t.type === "expense")), [filteredTransactions]);

  // ── Bar chart: last 6 months ───────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthTxs = transactions.filter(tx => {
        if (tx.type === "transfer") return false;
        const td = new Date(tx.date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      });
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        income: monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  // ── Top categories (expenses) with % bars ─────────────────────────────────
  const topExpenseCategories = useMemo(() => expenseData.slice(0, 5), [expenseData]);
  const topIncomeCategories = useMemo(() => incomeData.slice(0, 5), [incomeData]);

  // ── Pickers ────────────────────────────────────────────────────────────────
  const availableMonths = useMemo(() => {
    const s = new Set<string>();
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      s.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(s).sort().reverse();
  }, [transactions]);

  const availableYears = useMemo(() => {
    const s = new Set<string>();
    transactions.forEach(tx => s.add(String(new Date(tx.date).getFullYear())));
    return Array.from(s).sort().reverse();
  }, [transactions]);

  const getMonthLabel = () => {
    const [y, m] = selectedMonth.split("-");
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">Statistics</h1>
        <p className="text-xs text-gray-500">Breakdown by category</p>
      </div>

      {/* Period filter */}
      <div className="bg-white border-b border-gray-100 flex items-center gap-2 px-4 py-3">
        {(["month", "year", "all"] as FilterPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setFilterPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {p === "month" ? "Month" : p === "year" ? "Year" : "All time"}
          </button>
        ))}
        {(filterPeriod === "month" || filterPeriod === "year") && (
          <>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button
              onClick={() => filterPeriod === "month" ? setShowMonthPicker(true) : setShowYearPicker(true)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700"
            >
              {filterPeriod === "month" ? getMonthLabel() : selectedYear}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </>
        )}
      </div>

      {/* Summary row */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Income</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(totalIncome, currencyCode)}</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Expenses</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(totalExpense, currencyCode)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Net</p>
          <p className={`text-sm font-bold ${net >= 0 ? "text-indigo-600" : "text-red-500"}`}>
            {net >= 0 ? "" : "-"}{formatCurrency(Math.abs(net), currencyCode)}
          </p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Last 6 Months</p>
        <BarChart data={monthlyData} currencyCode={currencyCode} />
      </div>

      {/* Dual pie charts */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">By Category</p>
        <div className="flex justify-around">
          <MiniPieChart data={expenseData} currencyCode={currencyCode} label="Expenses" labelColor="#ef4444" />
          <MiniPieChart data={incomeData} currencyCode={currencyCode} label="Income" labelColor="#16a34a" />
        </div>
      </div>

      {/* Top expense categories */}
      {topExpenseCategories.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Expenses</p>
          <CategoryList items={topExpenseCategories} currencyCode={currencyCode} />
        </div>
      )}

      {/* Top income categories */}
      {topIncomeCategories.length > 0 && (
        <div className="bg-white px-4 pt-4 pb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Income</p>
          <CategoryList items={topIncomeCategories} currencyCode={currencyCode} />
        </div>
      )}

      {/* Empty state */}
      {filteredTransactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-3xl mb-3">📊</span>
          <p className="text-sm font-medium text-gray-500">No data for this period</p>
          <p className="text-xs text-gray-400 mt-1">Add some transactions to see stats</p>
        </div>
      )}

      {/* Month Picker */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowMonthPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Month</h3>
            </div>
            <div className="overflow-y-auto max-h-72 p-4 space-y-1 pb-8">
              {availableMonths.map(month => {
                const [y, m] = month.split("-");
                const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                return (
                  <button
                    key={month}
                    onClick={() => { setSelectedMonth(month); setShowMonthPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                      selectedMonth === month ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Year Picker */}
      {showYearPicker && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowYearPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Year</h3>
            </div>
            <div className="p-4 space-y-1 pb-8">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => { setSelectedYear(year); setShowYearPicker(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                    selectedYear === year ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function categoryTotals(txs: TransactionWithCategory[]) {
  const map = new Map<string, { name: string; value: number; color: string }>();
  txs.forEach(tx => {
    const name = tx.category?.name || "Uncategorized";
    const existing = map.get(name);
    if (existing) existing.value += tx.amount;
    else map.set(name, { name, value: tx.amount, color: getColor(name) });
  });
  const sorted = Array.from(map.values()).sort((a, b) => b.value - a.value);
  return sorted.map((item, i) => ({ ...item, color: getColorByIndex(i) }));
}

function CategoryList({ items, currencyCode }: { items: { name: string; value: number; color: string }[]; currencyCode: string }) {
  const max = items[0]?.value || 1;
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-700">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">{formatCurrency(item.value, currencyCode)}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const CHART_COLORS = [
  "#6366F1", "#F43F5E", "#10B981", "#F59E0B", "#3B82F6",
  "#EC4899", "#14B8A6", "#F97316", "#8B5CF6", "#06B6D4",
  "#84CC16", "#EF4444", "#A855F7", "#0EA5E9", "#22C55E",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
}

function getColorByIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
