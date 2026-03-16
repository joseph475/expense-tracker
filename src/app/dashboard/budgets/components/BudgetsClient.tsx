"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import type { Budget, Category } from "@/types/database";
import Sheet from "@/app/dashboard/components/Sheet";

interface Props {
  budgets: Budget[];
  expenseCategories: Category[];
  thisMonthSpending: Map<string, number>;
  symbol: string;
}

export default function BudgetsClient({ budgets, expenseCategories, thisMonthSpending, symbol }: Props) {
  const { addBudget, updateBudget, deleteBudget } = useAppData();

  // Add sheet state
  const [addOpen, setAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<Category | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));
  const availableCategories = expenseCategories.filter((c) => !budgetedCategoryIds.has(c.id));

  function handleAdd() {
    const amount = parseFloat(addAmount);
    if (!addCategory || isNaN(amount) || amount <= 0) return;
    addBudget({ category_id: addCategory.id, amount });
    setAddOpen(false);
    setAddCategory(null);
    setAddAmount("");
  }

  function handleEditSave(id: string) {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    updateBudget(id, amount);
    setEditId(null);
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly spending limits</p>
        </div>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Budget list */}
        {budgets.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-medium text-gray-500 dark:text-gray-400">No budgets yet</p>
            <p className="text-sm mt-1">Tap Add to set a monthly spending limit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => {
              const cat = expenseCategories.find((c) => c.id === budget.category_id);
              const spent = thisMonthSpending.get(budget.category_id) ?? 0;
              const pct = Math.min((spent / budget.amount) * 100, 100);
              const over = spent > budget.amount;
              const isEditing = editId === budget.id;

              return (
                <div key={budget.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat?.icon ?? "📦"}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{cat?.name ?? "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24 text-right text-sm bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white pb-0.5"
                            autoFocus
                          />
                          <button onClick={() => handleEditSave(budget.id)} className="text-indigo-600 dark:text-indigo-400">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditId(null)} className="text-gray-400">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(budget.id); setEditAmount(String(budget.amount)); }}
                            className="text-gray-400 dark:text-gray-600 p-1"
                          >
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteBudget(budget.id)} className="text-gray-400 dark:text-gray-600 p-1">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={over ? "text-rose-500 font-medium" : "text-gray-500 dark:text-gray-400"}>
                      {symbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {symbol}{budget.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} limit
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-rose-500" : pct > 80 ? "bg-amber-400" : "bg-indigo-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="text-xs text-rose-500 mt-1.5">
                      Over by {symbol}{(spent - budget.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Budget Sheet */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New Budget"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!addCategory || !addAmount}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            {/* Category picker */}
            <button
              type="button"
              onClick={() => setShowCategoryPicker(true)}
              className="w-full flex items-center px-4 h-14 border-b border-gray-100 dark:border-gray-800 text-left"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Category</span>
              <span className={`flex-1 text-sm text-right mr-2 ${addCategory ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                {addCategory ? `${addCategory.icon} ${addCategory.name}` : "Select *"}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
            </button>

            {/* Amount input */}
            <div className="flex items-center px-4 h-14">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Limit</span>
              <div className="flex-1 flex items-center justify-end">
                <span className="text-sm text-gray-400 dark:text-gray-500 mr-1">{symbol}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Picker Bottom Sheet */}
        <div
          className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${showCategoryPicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setShowCategoryPicker(false)}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${showCategoryPicker ? "translate-y-0" : "translate-y-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Category</h3>
            </div>
            <div className="overflow-y-auto max-h-[50vh] p-4">
              <div className="grid grid-cols-3 gap-3">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setAddCategory(cat); setShowCategoryPicker(false); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition text-center ${
                      addCategory?.id === cat.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className={`text-xs font-medium leading-tight ${addCategory?.id === cat.id ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
