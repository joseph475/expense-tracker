"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { addTransaction, type TransactionFormState } from "../transaction-actions";
import type { Asset, AssetCategory, Category, TransactionType } from "@/types/database";

const initialState: TransactionFormState = { error: null, success: false };

function today() {
  return new Date().toISOString().split("T")[0];
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
  categories,
  assets,
  currencySymbol = "$",
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  assets: Asset[];
  currencySymbol?: string;
}) {
  const [type, setType] = useState<ExtendedTransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Asset | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<Asset | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showToAccountPicker, setShowToAccountPicker] = useState(false);
  const [state, formAction, isPending] = useActionState(addTransaction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const filteredCategories = categories.filter((c) => c.type === (type === "transfer" ? "expense" : type));

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedCategory(null);
      setSelectedAccount(null);
      setSelectedToAccount(null);
      onClose();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedAccount(null);
    setSelectedToAccount(null);
  }, [type]);

  return (
    <div className={`${open ? 'block' : 'hidden'}`}>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div className={`fixed z-[60] inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form ref={formRef} action={formAction} className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">

            <div className="flex rounded-lg p-0.5 gap-0.5 bg-gray-100">
              {(["expense", "income", "transfer"] as ExtendedTransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-md text-xs font-medium capitalize transition ${
                    type === t
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />

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
                <input type="hidden" name="category_id" value={selectedCategory?.id || ""} />
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
            {assets.length > 0 && (
              <div>
                <input type="hidden" name="account_id" value={selectedAccount?.id || ""} />
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
            )}

            {/* To Account Picker - Only for transfers */}
            {type === "transfer" && assets.length > 0 && (
              <div>
                <input type="hidden" name="to_account_id" value={selectedToAccount?.id || ""} />
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

            <input
              id="date" name="date" type="date" required defaultValue={today()}
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition text-gray-900"
            />

            <input
              id="description" name="description" type="text"
              placeholder={type === "transfer" ? "Transfer note (optional)" : "Description (optional)"}
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
            />

            {state.error && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-6">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending ||
                  !selectedAccount ||
                  (type === "expense" && !selectedCategory) ||
                  (type === "income" && !selectedCategory) ||
                  (type === "transfer" && !selectedToAccount)
                }
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base font-medium transition"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
              </button>
            </div>
          </form>

          {/* Category Picker Bottom Sheet */}
          {showCategoryPicker && (
            <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setShowCategoryPicker(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
          )}

          {/* Account Picker Bottom Sheet */}
          {showAccountPicker && (
            <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setShowAccountPicker(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Select Account</h3>
                </div>
                <div className="overflow-y-auto max-h-[50vh] p-4">
                  {Object.entries(
                    assets.reduce<Record<string, Asset[]>>((acc, a) => {
                      if (!acc[a.category]) acc[a.category] = [];
                      acc[a.category].push(a);
                      return acc;
                    }, {})
                  ).map(([cat, group]) => (
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
          )}

          {/* To Account Picker Bottom Sheet */}
          {showToAccountPicker && (
            <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setShowToAccountPicker(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Select Destination Account</h3>
                </div>
                <div className="overflow-y-auto max-h-[50vh] p-4">
                  {Object.entries(
                    assets.reduce<Record<string, Asset[]>>((acc, a) => {
                      if (!acc[a.category]) acc[a.category] = [];
                      acc[a.category].push(a);
                      return acc;
                    }, {})
                  ).map(([cat, group]) => (
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
                              setSelectedToAccount(account);
                              setShowToAccountPicker(false);
                            }}
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
          )}
        </div>
      </div>
    </div>
  );
}
