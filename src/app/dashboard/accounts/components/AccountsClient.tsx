"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X, Loader2 } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import AddAssetSheet from "../../assets/components/AddAssetSheet";
import AccountDetailSheet from "./AccountDetailSheet";
import AddTransactionSheet from "../../components/AddTransactionSheet";
import type { AssetCategoryRow, AssetWithCategory } from "@/types/database";

export type AccountGroup = {
  key: string;
  label: string;
  icon: string;
  isLiability: boolean;
  accounts: AssetWithCategory[];
  total: number;
};

export default function AccountsClient({
  groups,
  symbol,
  assetCategories,
  totalAssets,
  totalLiabilities,
}: {
  groups: AccountGroup[];
  symbol: string;
  assetCategories: AssetCategoryRow[];
  totalAssets: number;
  totalLiabilities: number;
}) {
  const { updateAssetValue, deleteAsset } = useAppData();
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailAccount, setDetailAccount] = useState<AssetWithCategory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const netTotal = totalAssets - totalLiabilities;

  function fmt(n: number) {
    return symbol + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  function startEdit(account: AssetWithCategory) {
    setEditingId(account.id);
    setEditValue(String(account.current_value));
  }

  function handleSaveValue(id: string) {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    updateAssetValue(id, val);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteAsset(id);
    setDeletingId(null);
  }

  function toggleEditMode() {
    setEditMode((v) => !v);
    setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Accounts</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track what you own and owe</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleEditMode}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                editMode
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {editMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assets</p>
            <p className="text-sm font-bold text-indigo-600">{fmt(totalAssets)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Liabilities</p>
            <p className="text-sm font-bold text-rose-500">-{fmt(totalLiabilities)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Worth</p>
            <p className={`text-sm font-bold ${netTotal >= 0 ? "text-green-600" : "text-rose-500"}`}>
              {netTotal >= 0 ? "" : "-"}{fmt(netTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Table Headers */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 items-center gap-4 px-4 py-2">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">Liabilities</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assets</span>
          </div>
        </div>
      </div>

      {/* Account groups */}
      {groups.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">No accounts yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Tap the + button to add your first account</p>
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.key} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              {/* Group header */}
              <div className={`grid grid-cols-3 items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-700 ${
                group.isLiability ? "bg-rose-50 dark:bg-rose-950" : "bg-gray-50 dark:bg-gray-800"
              }`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {group.icon} {group.label}
                </span>

                {/* Liability Total Column */}
                <div className="text-right">
                  {group.isLiability && (
                    <span className="text-xs font-semibold text-rose-500">
                      -{fmt(Math.abs(group.total))}
                    </span>
                  )}
                </div>

                {/* Asset Total Column */}
                <div className="text-right">
                  {!group.isLiability && (
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {fmt(group.total)}
                    </span>
                  )}
                </div>
              </div>

              {/* Account rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {group.accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`grid grid-cols-3 items-center gap-4 px-4 py-2 ${!editMode ? "cursor-pointer active:bg-gray-50 dark:active:bg-gray-800" : ""}`}
                    onClick={() => {
                      if (!editMode) {
                        setDetailAccount(account);
                        setDetailOpen(true);
                      }
                    }}
                  >
                    {/* Account Name */}
                    <div className="flex items-center gap-3">
                      {editMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                          disabled={deletingId === account.id}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition"
                        >
                          {deletingId === account.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <X className="h-3 w-3" />}
                        </button>
                      )}
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{account.name}</p>
                    </div>

                    {/* Liability Column */}
                    <div className="text-right">
                      {group.isLiability && (
                        editMode && editingId === account.id ? (
                          <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                {symbol}
                              </span>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveValue(account.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-24 pl-5 pr-2 py-1.5 rounded-lg border border-indigo-400 text-sm text-right focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={() => handleSaveValue(account.id)}
                              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : editMode ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(account); }}
                            className="text-xs font-semibold text-rose-500 underline underline-offset-2 decoration-dashed decoration-gray-400"
                          >
                            -{fmt(Math.abs(Number(account.current_value)))}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-rose-500">
                            -{fmt(Math.abs(Number(account.current_value)))}
                          </span>
                        )
                      )}
                    </div>

                    {/* Asset Column */}
                    <div className="text-right">
                      {!group.isLiability && (
                        editMode && editingId === account.id ? (
                          <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                {symbol}
                              </span>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveValue(account.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-24 pl-5 pr-2 py-1.5 rounded-lg border border-indigo-400 text-sm text-right focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={() => handleSaveValue(account.id)}
                              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : editMode ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(account); }}
                            className="text-xs font-semibold text-gray-900 dark:text-white underline underline-offset-2 decoration-dashed decoration-gray-400"
                          >
                            {fmt(Number(account.current_value))}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {fmt(Number(account.current_value))}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAssetSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        currencySymbol={symbol}
        assetCategories={assetCategories}
      />

      <AccountDetailSheet
        account={detailAccount}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        symbol={symbol}
        onPayLiability={() => {
          setDetailOpen(false);
          setPayOpen(true);
        }}
      />

      <AddTransactionSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        initialType="transfer"
        initialToAccount={detailAccount}
      />
    </div>
  );
}
