"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import type { AssetCategoryRow } from "@/types/database";
import Sheet from "@/app/dashboard/components/Sheet";

export default function AddAssetSheet({
  open,
  onClose,
  currencySymbol,
  assetCategories,
}: {
  open: boolean;
  onClose: () => void;
  currencySymbol: string;
  assetCategories: AssetCategoryRow[];
}) {
  const { addAsset, assets } = useAppData();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryRow | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSelectedCategory(null);
      formRef.current?.reset();
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const rawValue = (form.elements.namedItem("current_value") as HTMLInputElement).value;
    const current_value = rawValue === "" ? 0 : parseFloat(rawValue);
    const rateEl = form.elements.namedItem("interest_rate") as HTMLInputElement;
    const interest_rate = rateEl.value !== "" ? parseFloat(rateEl.value) : null;

    if (!name) { setError("Account name is required."); return; }
    if (isNaN(current_value) || current_value < 0) { setError("Value must be 0 or more."); return; }
    const duplicate = assets.some(a => a.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) { setError(`An account named "${name}" already exists.`); return; }

    setIsPending(true);
    addAsset({ name, asset_category_id: selectedCategory?.id ?? null, current_value, interest_rate });
    setIsPending(false);
    formRef.current?.reset();
    setSelectedCategory(null);
    onCloseRef.current();
  }

  const assetCats = assetCategories.filter((c) => !c.is_liability);
  const liabilityCats = assetCategories.filter((c) => c.is_liability);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add Account"
      footer={
        <div className="flex gap-3">
          <button
            type="submit"
            form="add-asset-form"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition"
          >
            Cancel
          </button>
        </div>
      }
    >
      <form id="add-asset-form" ref={formRef} onSubmit={handleSubmit} className="px-4 py-4 space-y-4 overflow-y-auto flex-1">

        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          {/* Name */}
          <div className="flex items-center px-4 h-14 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Name</span>
            <input
              name="name" type="text" required placeholder="Required"
              className="flex-1 text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Category */}
          <button type="button" onClick={() => setShowCategoryPicker(true)}
            className="w-full flex items-center px-4 h-14 border-b border-gray-100 dark:border-gray-800 text-left">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Category</span>
            <span className={`flex-1 text-sm text-right mr-2 ${selectedCategory ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
              {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "None"}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
          </button>

          {/* Balance */}
          <div className="flex items-center px-4 h-14 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Balance</span>
            <div className="flex-1 flex items-center justify-end">
              <span className="text-sm text-gray-400 dark:text-gray-500 mr-1">{currencySymbol}</span>
              <input
                name="current_value" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00"
                className="text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-32"
              />
            </div>
          </div>

          {/* Interest rate */}
          <div className="flex items-center px-4 h-14">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">Interest</span>
            <div className="flex-1 flex items-center justify-end">
              <input
                name="interest_rate" type="number" inputMode="decimal" step="0.01" min="0" max="100" placeholder="Optional"
                className="text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-28"
              />
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">%</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-xl px-3 py-2">{error}</p>
        )}

      </form>

      {/* Category Picker Bottom Sheet */}
      <div
        className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${
          showCategoryPicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowCategoryPicker(false)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${
            showCategoryPicker ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Category</h3>
          </div>
          <div className="overflow-y-auto max-h-[50vh] p-4 space-y-4">
            {assetCats.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Assets</p>
                <div className="grid grid-cols-3 gap-3">
                  {assetCats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition text-center ${
                        selectedCategory?.id === cat.id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-xs font-medium leading-tight ${selectedCategory?.id === cat.id ? "text-white" : "text-gray-900 dark:text-white"}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {liabilityCats.length > 0 && (
              <div>
                <p className="text-xs font-medium text-rose-500 uppercase tracking-wide mb-3">Liabilities</p>
                <div className="grid grid-cols-3 gap-3">
                  {liabilityCats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition text-center ${
                        selectedCategory?.id === cat.id
                          ? "bg-rose-500 text-white"
                          : "bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-xs font-medium leading-tight ${selectedCategory?.id === cat.id ? "text-white" : "text-gray-900 dark:text-white"}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
