"use client";

import { useActionState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { addAsset, type AssetFormState } from "../actions";
import type { AssetCategory } from "@/types/database";

const initialState: AssetFormState = { error: null, success: false };

const CATEGORIES: { value: AssetCategory; label: string; icon: string }[] = [
  { value: "cash",       label: "Cash / Bank",   icon: "🏦" },
  { value: "investment", label: "Investment",     icon: "📈" },
  { value: "property",   label: "Property",       icon: "🏠" },
  { value: "vehicle",    label: "Vehicle",        icon: "🚗" },
  { value: "liability",  label: "Credit Card",    icon: "💳" },
  { value: "other",      label: "Other",          icon: "📦" },
];

export default function AddAssetSheet({
  open,
  onClose,
  currencySymbol,
}: {
  open: boolean;
  onClose: () => void;
  currencySymbol: string;
}) {
  const [state, formAction, isPending] = useActionState(addAsset, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) { formRef.current?.reset(); onClose(); }
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
        <div className="bg-white w-full rounded-t-2xl md:rounded-2xl md:max-w-md shadow-xl">

          <div className="flex justify-center pt-3 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Add Asset</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form ref={formRef} action={formAction} className="px-5 py-5 space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
              <input
                id="name" name="name" type="text" required
                placeholder="e.g. BDO Savings Account"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat, i) => (
                  <label key={cat.value} className="cursor-pointer">
                    <input type="radio" name="category" value={cat.value} defaultChecked={i === 0} className="sr-only peer" />
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:text-white transition">
                      {cat.icon} {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <label htmlFor="current_value" className="block text-sm font-medium text-gray-700">Current Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
                <input
                  id="current_value" name="current_value" type="number"
                  inputMode="decimal" step="0.01" min="0" required placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Annual interest rate (optional) */}
            <div className="space-y-1.5">
              <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700">
                Annual Interest Rate
                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="interest_rate" name="interest_rate" type="number"
                  inputMode="decimal" step="0.01" min="0" max="100" placeholder="e.g. 3.5"
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <p className="text-xs text-gray-400">For savings accounts — shows daily earnings on your asset card.</p>
            </div>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</p>
            )}

            <div className="flex gap-3 pt-1 pb-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition">
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
