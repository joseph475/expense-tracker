"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TransactionWithCategory } from "@/types/database";

interface CalendarViewProps {
  transactions: TransactionWithCategory[];
  symbol: string;
  currentDate?: string;
}

export default function CalendarView({ transactions, symbol, currentDate }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = currentDate ? new Date(currentDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Memoize transactions grouped by date
  const transactionsByDate = useMemo(() => {
    return transactions.reduce<Record<string, TransactionWithCategory[]>>((acc, tx) => {
      if (!acc[tx.date]) acc[tx.date] = [];
      acc[tx.date].push(tx);
      return acc;
    }, {});
  }, [transactions]);

  // Memoize selected date transactions
  const selectedTransactions = useMemo(() => {
    return selectedDate ? transactionsByDate[selectedDate] || [] : [];
  }, [selectedDate, transactionsByDate]);

  // Calendar helpers - use local date formatting to avoid timezone issues
  const today = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
  
  const days = [];
  const current = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
      setSelectedDate(null);
    }
  };

  const getDayTotal = (date: string) => {
    const dayTransactions = transactionsByDate[date] || [];
    return dayTransactions
      .filter(tx => tx.type !== "transfer") // Exclude transfers from daily total
      .reduce((total, tx) => {
        return total + (tx.type === "income" ? Number(tx.amount) : -Number(tx.amount));
      }, 0);
  };

  return (
    <div className="bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          disabled={new Date(year, month + 1, 1) > new Date()}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          // Use local date formatting to avoid timezone issues
          const dateStr = (() => {
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const dayNum = String(day.getDate()).padStart(2, '0');
            return `${year}-${month}-${dayNum}`;
          })();
          const isCurrentMonth = day.getMonth() === month;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasTransactions = transactionsByDate[dateStr]?.length > 0;
          const dayTotal = getDayTotal(dateStr);
          const isFuture = day > new Date();

          return (
            <button
              key={index}
              onClick={() => {
                if (isCurrentMonth && !isFuture) {
                  setSelectedDate(dateStr === selectedDate ? null : dateStr);
                }
              }}
              disabled={!isCurrentMonth || isFuture}
              className={`
                aspect-square p-1 border-r border-b border-gray-100 text-left relative
                ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                ${isToday ? 'bg-indigo-50' : ''}
                ${isSelected ? 'bg-indigo-100' : ''}
                ${isCurrentMonth && !isFuture ? 'hover:bg-gray-50' : ''}
                ${isFuture ? 'cursor-not-allowed' : ''}
                disabled:cursor-not-allowed
              `}
            >
              <div className="h-full flex flex-col">
                <span className={`text-xs font-medium ${
                  isToday ? 'text-indigo-600' : 
                  isSelected ? 'text-indigo-700' : 
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </span>
                
                {hasTransactions && isCurrentMonth && (
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="text-xs">
                      <div className={`font-medium ${
                        dayTotal >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {dayTotal >= 0 ? '+' : ''}{symbol}{Math.abs(dayTotal).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Transaction Modal */}
      {selectedDate && (
        <div className={`${selectedDate ? 'block' : 'hidden'}`}>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedDate(null)}
          />

          <div className="fixed z-[60] inset-0 bg-white transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  {(() => {
                    // Parse the date string manually to avoid timezone issues
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  })()}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedTransactions.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 w-8"></th>
                        <th className="text-left px-2 py-2 text-xs font-medium text-gray-500">Category</th>
                        <th className="text-left px-2 py-2 text-xs font-medium text-gray-500">Description</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100/50 hover:bg-gray-50">
                          <td className="px-4 py-2 text-base leading-none">
                            {tx.type === "transfer" ? "↔️" : tx.category?.icon || "💰"}
                          </td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
                            {tx.type === "transfer" ? "Transfer" : tx.category?.name || "—"}
                          </td>
                          <td className="px-2 py-2 text-gray-500 truncate max-w-30">
                            {tx.description || "—"}
                          </td>
                          <td className={`px-4 py-2 text-right font-semibold whitespace-nowrap ${
                            tx.type === "income" ? "text-green-600" :
                            tx.type === "transfer" ? "text-blue-600" :
                            "text-red-500"
                          }`}>
                            {tx.type === "income" ? "+" : tx.type === "transfer" ? "↔" : "-"}{symbol}{Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl">📅</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-1">No transactions on this date</p>
                      <p className="text-xs text-gray-400">Tap the + button to add a transaction</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}