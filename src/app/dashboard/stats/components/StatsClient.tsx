"use client";

import { useState, useMemo, useEffect } from "react";
import { Transaction, Category } from "@/types/database";
import { formatCurrency } from "@/lib/currency";
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
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Close pickers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.picker-container') && !target.closest('.bottom-sheet')) {
        setShowPeriodPicker(false);
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    }

    if (showPeriodPicker || showMonthPicker || showYearPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPeriodPicker, showMonthPicker, showYearPicker]);

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

  // Get display labels
  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case "month": return "This Month";
      case "year": return "This Year";
      case "all": return "All Time";
      default: return "This Month";
    }
  };

  const getMonthLabel = () => {
    const [year, monthNum] = selectedMonth.split("-");
    return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h1>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Period Filter */}
            <div className="relative picker-container">
              <button
                onClick={() => setShowPeriodPicker(true)}
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1"
              >
                {getPeriodLabel()}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </div>

            {/* Month Filter */}
            {filterPeriod === "month" && (
              <div className="relative picker-container">
                <button
                  onClick={() => setShowMonthPicker(true)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1"
                >
                  {getMonthLabel()}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            )}

            {/* Year Filter */}
            {filterPeriod === "year" && (
              <div className="relative picker-container">
                <button
                  onClick={() => setShowYearPicker(true)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1"
                >
                  {selectedYear}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("expense")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "expense"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "income"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          {currentData.length > 0 ? (
            <PieChart data={currentData} currencyCode={currencyCode} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No {activeTab} data for selected period
            </div>
          )}
        </div>
      </div>

      {/* Period Picker Bottom Sheet */}
      {showPeriodPicker && (
        <div className="fixed inset-0 flex items-end z-50">
          <div className="bg-white w-full p-4 bottom-sheet">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Period</h3>
              <button
                onClick={() => setShowPeriodPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {[
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
                { value: "all", label: "All Time" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterPeriod(option.value as FilterPeriod);
                    setShowPeriodPicker(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg ${
                    filterPeriod === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Month Picker Bottom Sheet */}
      {showMonthPicker && (
        <div className="fixed inset-0 flex items-end z-50">
          <div className="bg-white w-full p-4 max-h-96 overflow-y-auto bottom-sheet">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Month</h3>
              <button
                onClick={() => setShowMonthPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {availableMonths.map(month => {
                const [year, monthNum] = month.split("-");
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(month);
                      setShowMonthPicker(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg ${
                      selectedMonth === month
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Year Picker Bottom Sheet */}
      {showYearPicker && (
        <div className="fixed inset-0 flex items-end z-50">
          <div className="bg-white w-full p-4 bottom-sheet">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Year</h3>
              <button
                onClick={() => setShowYearPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedYear === year
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
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