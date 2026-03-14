"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { addTransaction, type TransactionFormState } from "../actions";
import type { Category, TransactionType } from "@/types/database";
import CategoryPicker from "./CategoryPicker";

const initialState: TransactionFormState = { error: null, success: false };

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function AddTransactionSheet({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [state, formAction, isPending] = useActionState(addTransaction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onClose();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white w-full rounded-t-2xl md:rounded-2xl md:max-w-md shadow-xl max-h-[92dvh] flex flex-col">

          {/* Handle */}
          <div className="flex justify-center pt-3 md:hidden shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Add Transaction</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable form */}
          <form ref={formRef} action={formAction} className="px-5 py-5 space-y-4 overflow-y-auto">

            {/* Type toggle */}
            <div className="flex rounded-xl border border-gray-200 p-1 gap-1">
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    type === t
                      ? t === "expense"
                        ? "bg-red-500 text-white shadow"
                        : "bg-green-500 text-white shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "expense" ? "💸 Expense" : "💰 Income"}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />

            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Category */}
            <CategoryPicker categories={categories} type={type} />

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={today()}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="e.g. Lunch with team"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {state.error}
              </p>
            )}

            <div className="flex gap-3 pt-1 pb-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
