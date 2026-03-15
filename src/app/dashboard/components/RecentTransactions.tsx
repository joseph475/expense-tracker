"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TransactionWithCategory } from "@/types/database";
import TransactionDetailsModal from "./TransactionDetailsModal";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function toYM(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function addMonths(ym: string, delta: number) {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  currencySymbol: string;
}

export default function RecentTransactions({ transactions, currencySymbol }: RecentTransactionsProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const view = params.get("view") ?? "today";
  const selectedMonth = params.get("month") ?? currentMonthStr();
  const todayMonth = currentMonthStr();
  const todayYear = new Date().getFullYear();
  const todayMonthNum = new Date().getMonth() + 1;

  const [pickerYear, setPickerYear] = useState(() => Number(selectedMonth.split("-")[0]));

  function navigateMonth(month: string) {
    const p = new URLSearchParams();
    p.set("view", "month");
    p.set("month", month);
    startTransition(() => router.push(`/dashboard?${p.toString()}`));
  }

  function selectMonth(year: number, month: number) {
    setPickerOpen(false);
    navigateMonth(toYM(year, month));
  }

  const canGoNext = selectedMonth < todayMonth;

  return (
    <>
      <div className="bg-white">
        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-900">
            {view === "today" ? "Today" : "Transactions"}
          </h2>

          {view === "month" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth(addMonths(selectedMonth, -1))}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => {
                  setPickerYear(Number(selectedMonth.split("-")[0]));
                  setPickerOpen(true);
                }}
                className="text-xs font-semibold text-gray-700 hover:text-indigo-600 transition px-1 py-0.5 rounded-md hover:bg-gray-50"
              >
                {formatMonth(selectedMonth)}
              </button>

              <button
                onClick={() => navigateMonth(addMonths(selectedMonth, 1))}
                disabled={!canGoNext}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-3xl mb-3">🧾</span>
            <p className="text-sm font-medium text-gray-500">No transactions</p>
            <p className="text-xs text-gray-400 mt-1">Tap + to add one</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTransactionId(t.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs">
                    {t.type === "transfer" ? "↔️" : t.category?.icon || "💰"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {t.description ?? (t.type === "transfer" ? "Transfer" : t.category?.name || "Transaction")}
                  </p>
                  <p className="text-xs text-gray-500">{t.date}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${
                  t.type === "income" ? "text-green-600" :
                  t.type === "transfer" ? "text-blue-600" :
                  "text-red-500"
                }`}>
                  {t.type === "income" ? "+" : t.type === "transfer" ? "↔" : "-"}{currencySymbol}{Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month Picker Bottom Sheet */}
      {pickerOpen && (
        <div className="fixed inset-0 z-70 bg-black/40" onClick={() => setPickerOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Month</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-base font-semibold text-gray-900">{pickerYear}</span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  disabled={pickerYear >= todayYear}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-6">
                {MONTH_NAMES.map((name, i) => {
                  const monthNum = i + 1;
                  const ym = toYM(pickerYear, monthNum);
                  const isFuture =
                    pickerYear > todayYear ||
                    (pickerYear === todayYear && monthNum > todayMonthNum);
                  const isSelected = ym === selectedMonth;
                  return (
                    <button
                      key={name}
                      disabled={isFuture}
                      onClick={() => selectMonth(pickerYear, monthNum)}
                      className={`py-3 text-sm font-medium rounded-xl transition ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : isFuture
                          ? "text-gray-300 pointer-events-none bg-gray-50"
                          : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 bg-gray-50"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        isOpen={!!selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
