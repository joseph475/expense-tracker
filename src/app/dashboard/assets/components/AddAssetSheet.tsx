"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import type { AssetCategoryRow } from "@/types/database";

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
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div className={`fixed z-60 inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Add Account</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">

            {/* Name */}
            <input
              name="name"
              type="text"
              required
              placeholder="Account name *"
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
            />

            {/* Category picker trigger */}
            <button
              type="button"
              onClick={() => setShowCategoryPicker(true)}
              className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none transition text-left"
            >
              <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
                {selectedCategory
                  ? `${selectedCategory.icon} ${selectedCategory.name}`
                  : "Select Category"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Value */}
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">
                {currencySymbol}
              </span>
              <input
                name="current_value"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="Initial balance (default 0)"
                className="w-full pl-6 pr-4 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
              />
            </div>

            {/* Interest rate */}
            <div className="relative">
              <input
                name="interest_rate"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="100"
                placeholder="Annual interest rate (optional)"
                className="w-full pl-0 pr-8 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-4 mt-6">
              <button
                type="submit"
                disabled={isPending}
                className="flex-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base font-medium transition"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition bg-gray-50"
              >
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
              <div className="overflow-y-auto max-h-[50vh] p-4 space-y-4">
                {assetCats.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Assets</p>
                    <div className="grid grid-cols-3 gap-3">
                      {assetCats.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition text-center ${
                            selectedCategory?.id === cat.id
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="text-xs font-medium leading-tight">{cat.name}</span>
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
                              : "bg-rose-50 hover:bg-rose-100"
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="text-xs font-medium leading-tight">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
