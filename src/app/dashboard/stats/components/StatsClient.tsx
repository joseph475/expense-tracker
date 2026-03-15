"use client";

import { useState, useMemo } from "react";
import { Transaction, Category } from "@/types/database";
import PieChart from "./PieChart";
import { ChevronDown } from "lucide-react";

interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

interface StatsClientProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currencyCode: string;
}

type FilterPeriod = "month" | "year" | "all";
type ChartType = "expense" | "income";

export default function StatsClient({ transactions, categories, currencyCode }: StatsClientProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState<ChartType>("expense");
  
  // Bottom sheet states
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return transactions.filter(tx => {
      // Exclude transfers
      if (tx.type === "transfer") return false;
      
      const txDate = new Date(tx.date);
      
      switch (filterPeriod) {
        case "month":
          const [year, month] = selectedMonth.split("-");
          return txDate.getFullYear() === parseInt(year) && 
                 txDate.getMonth() === parseInt(month) - 1;
        case "year":
          return txDate.getFullYear() === parseInt(selectedYear);
        case "all":
          return true;
        default:
          return true;
      }
    });
  }, [transactions, filterPeriod, selectedMonth, selectedYear]);

  // Calculate income data by category
  const incomeData = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(tx => tx.type === "income");
    const categoryTotals = new Map<string, { name: string; value: number; color: string }>();
    
    incomeTransactions.forEach(tx => {
      const categoryName = tx.category?.name || "Uncategorized";
      const existing = categoryTotals.get(categoryName);
      if (existing) {
        existing.value += tx.amount;
      } else {
        categoryTotals.set(categoryName, {
          name: categoryName,
          value: tx.amount,
          color: getRandomColor(categoryName)
        });
      }
    });
    
    return Array.from(categoryTotals.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Calculate expense data by category
  const expenseData = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(tx => tx.type === "expense");
    const categoryTotals = new Map<string, { name: string; value: number; color: string }>();
    
    expenseTransactions.forEach(tx => {
      const categoryName = tx.category?.name || "Uncategorized";
      const existing = categoryTotals.get(categoryName);
      if (existing) {
        existing.value += tx.amount;
      } else {
        categoryTotals.set(categoryName, {
          name: categoryName,
          value: tx.amount,
          color: getRandomColor(categoryName)
        });
      }
    });
    
    return Array.from(categoryTotals.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Generate available months for dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Generate available years for dropdown
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      years.add(date.getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  }, [transactions]);

  const currentData = activeTab === "expense" ? expenseData : incomeData;
  const currentTotal = currentData.reduce((sum, item) => sum + item.value, 0);

  const getMonthLabel = () => {
    const [year, monthNum] = selectedMonth.split("-");
    return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">Statistics</h1>
        <p className="text-xs text-gray-500">Breakdown by category</p>
      </div>

<div className="bg-white">
      {/* Expense / Income tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            activeTab === "expense" ? "text-red-500" : "text-gray-400"
          }`}
        >
          Expenses
          {activeTab === "expense" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            activeTab === "income" ? "text-green-500" : "text-gray-400"
          }`}
        >
          Income
          {activeTab === "income" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Period filter row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {(["month", "year", "all"] as FilterPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterPeriod === p
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500"
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

      {/* Chart */}
      <div className="px-4">
        {currentData.length > 0 ? (
          <PieChart data={currentData} currencyCode={currencyCode} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-3">📊</span>
            <p className="text-sm font-medium text-gray-500">No {activeTab} data</p>
            <p className="text-xs text-gray-400 mt-1">for the selected period</p>
          </div>
        )}
      </div>
      </div>

      {/* Month Picker Bottom Sheet */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowMonthPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Month</h3>
            </div>
            <div className="overflow-y-auto max-h-72 p-4 space-y-1 pb-8">
              {availableMonths.map(month => {
                const [year, monthNum] = month.split("-");
                const label = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                const isSelected = selectedMonth === month;
                return (
                  <button
                    key={month}
                    onClick={() => { setSelectedMonth(month); setShowMonthPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
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

      {/* Year Picker Bottom Sheet */}
      {showYearPicker && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowYearPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Year</h3>
            </div>
            <div className="p-4 space-y-1 pb-8">
              {availableYears.map(year => {
                const isSelected = selectedYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => { setSelectedYear(year); setShowYearPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate consistent colors for categories
function getRandomColor(categoryName: string): string {
  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
    "#14B8A6", "#F43F5E", "#8B5A2B", "#6B7280", "#DC2626"
  ];
  
  // Use category name to generate consistent color
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}