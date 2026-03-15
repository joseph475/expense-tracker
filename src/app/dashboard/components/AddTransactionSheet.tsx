"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import type { Asset, AssetCategory, Category, TransactionType } from "@/types/database";

function today() {
  return new Date().toISOString().split("T")[0];
}

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function formatPickerMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildCalendarDays(ym: string): (string | null)[] {
  const [y, m] = ym.split("-").map(Number);
  const firstDow = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${ym}-${String(d).padStart(2, "0")}`);
  }
  return cells;
}

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  cash: "Cash",
  investment: "Investment",
  property: "Property",
  vehicle: "Vehicle",
  liability: "Liability",
  other: "Other",
};

type ExtendedTransactionType = TransactionType | "transfer";

export default function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { categories, assets, settings, addTransaction } = useAppData();
  const currencySymbol = settings.currency_symbol;

  const [type, setType] = useState<ExtendedTransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Asset | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<Asset | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showToAccountPicker, setShowToAccountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [pickerMonthStr, setPickerMonthStr] = useState(() => today().slice(0, 7));
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const filteredCategories = categories.filter((c) => c.type === (type === "transfer" ? "expense" : type));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset form state when modal opens
  useEffect(() => {
    if (open) {
      formRef.current?.reset();
      setSelectedCategory(null);
      setSelectedAccount(null);
      setSelectedToAccount(null);
      setType("expense");
      setError(null);
      setSelectedDate(today());
      setPickerMonthStr(today().slice(0, 7));
    }
  }, [open]);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedAccount(null);
    setSelectedToAccount(null);
  }, [type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const amountVal = parseFloat((form.elements.namedItem("amount") as HTMLInputElement).value);
    const descEl = form.elements.namedItem("description") as HTMLInputElement | null;
    const descVal = descEl?.value?.trim() || null;

    setIsPending(true);
    const err = addTransaction({
      type,
      amount: amountVal,
      category_id: selectedCategory?.id ?? null,
      account_id: selectedAccount?.id ?? "",
      to_account_id: selectedToAccount?.id ?? null,
      description: descVal,
      date: selectedDate,
    });
    setIsPending(false);
    if (err) {
      setError(err);
    } else {
      setError(null);
      formRef.current?.reset();
      setSelectedCategory(null);
      setSelectedAccount(null);
      setSelectedToAccount(null);
      onCloseRef.current();
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed z-60 inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-semibold transition active:scale-95 ${
                  type === "expense" ? "bg-red-500 text-white shadow-sm" : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="text-lg leading-none">↑</span>
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-semibold transition active:scale-95 ${
                  type === "income" ? "bg-green-500 text-white shadow-sm" : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="text-lg leading-none">↓</span>
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("transfer")}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-semibold transition active:scale-95 ${
                  type === "transfer" ? "bg-blue-500 text-white shadow-sm" : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="text-lg leading-none">⇄</span>
                Transfer
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">{currencySymbol}</span>
              <input
                id="amount" name="amount" type="number" inputMode="decimal"
                step="0.01" min="0.01" required placeholder="Amount"
                className="w-full pl-6 pr-4 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
              />
            </div>

            {/* Category Picker - Hide for transfers */}
            {type !== "transfer" && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(true)}
                  className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition text-left"
                >
                  <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
                    {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "Select Category *"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* From Account Picker */}
            <div>
              <button
                type="button"
                onClick={() => setShowAccountPicker(true)}
                className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition text-left"
              >
                <span className={selectedAccount ? "text-gray-900" : "text-gray-400"}>
                  {selectedAccount
                    ? selectedAccount.name
                    : type === "transfer"
                      ? "From Account *"
                      : "Select Account *"
                  }
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* To Account Picker - Only for transfers */}
            {type === "transfer" && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowToAccountPicker(true)}
                  className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition text-left"
                >
                  <span className={selectedToAccount ? "text-gray-900" : "text-gray-400"}>
                    {selectedToAccount ? selectedToAccount.name : "To Account *"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none text-left"
            >
              <span className="text-gray-900">{formatDisplayDate(selectedDate)}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            <input
              id="description" name="description" type="text"
              placeholder={type === "transfer" ? "Transfer note (optional)" : "Description (optional)"}
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
            />

            {error && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-6">
              <button
                type="submit"
                disabled={isPending ||
                  !selectedAccount ||
                  (type === "expense" && !selectedCategory) ||
                  (type === "income" && !selectedCategory) ||
                  (type === "transfer" && !selectedToAccount)
                }
                className="flex-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base font-medium transition"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
              </button>
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition bg-gray-50">
                Cancel
              </button>
            </div>
          </form>

          {/* Category Picker Bottom Sheet */}
          <div
            className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${
              showCategoryPicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowCategoryPicker(false)}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${
                showCategoryPicker ? "translate-y-0" : "translate-y-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Select Category</h3>
                </div>
                <div className="overflow-y-auto max-h-[50vh] p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition text-center"
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs font-medium text-gray-900 leading-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>
          </div>

          {/* Account Picker Bottom Sheet */}
          <div
            className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${
              showAccountPicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowAccountPicker(false)}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${
                showAccountPicker ? "translate-y-0" : "translate-y-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Select Account</h3>
                </div>
                <div className="overflow-y-auto max-h-[50vh] p-4">
                  {(() => {
                    // Filter assets for transfer "from" account (exclude liabilities)
                    const filteredAssets = type === "transfer"
                      ? assets.filter(a => a.category !== "liability")
                      : assets;

                    // Group assets by category
                    const groupedAssets = filteredAssets.reduce<Record<string, Asset[]>>((acc, a) => {
                      if (!acc[a.category]) acc[a.category] = [];
                      acc[a.category].push(a);
                      return acc;
                    }, {});

                    // Sort categories based on transaction type
                    const sortedEntries = Object.entries(groupedAssets).sort(([catA], [catB]) => {
                      const isLiabilityA = catA === "liability";
                      const isLiabilityB = catB === "liability";

                      if (type === "expense") {
                        if (isLiabilityA && !isLiabilityB) return -1;
                        if (!isLiabilityA && isLiabilityB) return 1;
                      } else if (type === "income") {
                        if (!isLiabilityA && isLiabilityB) return -1;
                        if (isLiabilityA && !isLiabilityB) return 1;
                      }

                      return catA.localeCompare(catB);
                    });

                    return sortedEntries;
                  })().map(([cat, group]) => (
                    <div key={cat} className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        {CATEGORY_LABELS[cat as AssetCategory] ?? cat}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {group.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowAccountPicker(false);
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition text-center"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {account.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-900 leading-tight">{account.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* To Account Picker Bottom Sheet */}
          <div
            className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${
              showToAccountPicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowToAccountPicker(false)}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${
                showToAccountPicker ? "translate-y-0" : "translate-y-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Select Destination Account</h3>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-4">
                {(() => {
                  const groupedAssets = assets.reduce<Record<string, Asset[]>>((acc, a) => {
                    if (!acc[a.category]) acc[a.category] = [];
                    acc[a.category].push(a);
                    return acc;
                  }, {});
                  const sortedEntries = Object.entries(groupedAssets).sort(([catA], [catB]) => {
                    const isLiabilityA = catA === "liability";
                    const isLiabilityB = catB === "liability";
                    if (!isLiabilityA && isLiabilityB) return -1;
                    if (isLiabilityA && !isLiabilityB) return 1;
                    return catA.localeCompare(catB);
                  });
                  return sortedEntries;
                })().map(([cat, group]) => (
                  <div key={cat} className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      {CATEGORY_LABELS[cat as AssetCategory] ?? cat}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {group.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => { setSelectedToAccount(account); setShowToAccountPicker(false); }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition text-center ${
                            selectedAccount?.id === account.id
                              ? "bg-gray-200 cursor-not-allowed opacity-50"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          disabled={selectedAccount?.id === account.id}
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {account.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 leading-tight">{account.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Picker Bottom Sheet */}
          <div
            className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${
              showDatePicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowDatePicker(false)}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden transform transition-transform duration-300 ease-out ${
                showDatePicker ? "translate-y-0" : "translate-y-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
              </div>
              <div className="p-4 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setPickerMonthStr((m) => shiftMonth(m, -1))}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-base font-semibold text-gray-900">{formatPickerMonth(pickerMonthStr)}</span>
                  <button
                    type="button"
                    onClick={() => setPickerMonthStr((m) => shiftMonth(m, 1))}
                    disabled={pickerMonthStr >= today().slice(0, 7)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {buildCalendarDays(pickerMonthStr).map((dateStr, i) => {
                    if (!dateStr) return <div key={i} />;
                    const isFuture = dateStr > today();
                    const isSelected = dateStr === selectedDate;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isFuture}
                        onClick={() => { setSelectedDate(dateStr); setShowDatePicker(false); }}
                        className={`mx-auto w-9 h-9 rounded-full text-sm font-medium transition flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : isFuture
                            ? "text-gray-300 pointer-events-none"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {Number(dateStr.split("-")[2])}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
