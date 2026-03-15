"use client";

import { useState } from "react";
import { Plus, Loader2, Pencil, Check, X } from "lucide-react";
import type { AssetCategoryRow } from "@/types/database";
import { useAppData } from "@/lib/AppDataContext";

const SUGGESTED_ICONS = ["🏦","💰","📈","🏠","🚗","💳","📦","🏆","💎","🪙","🏗️","✈️","🚢","🎨","💼"];

function EditForm({
  cat,
  onDone,
}: {
  cat: AssetCategoryRow;
  onDone: () => void;
}) {
  const { updateAssetCategory } = useAppData();
  const [icon, setIcon] = useState(cat.icon);
  const [isLiability, setIsLiability] = useState(cat.is_liability);
  const [name, setName] = useState(cat.name);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    if (!icon.trim()) { setError("Please enter an emoji icon."); return; }
    updateAssetCategory(cat.id, { name: name.trim(), icon: icon.trim(), is_liability: isLiability });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_ICONS.map((e) => (
            <button
              key={e} type="button"
              onClick={() => setIcon(e)}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                icon === e ? "bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-300"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Or type any emoji"
          maxLength={4}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Name</label>
        <input
          type="text" required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => setIsLiability((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
          isLiability ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600" : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
        }`}
      >
        <span>This is a liability (debt / credit card)</span>
        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          isLiability ? "bg-red-500 border-red-500" : "border-gray-300 dark:border-gray-600"
        }`}>
          {isLiability && <span className="w-2 h-2 rounded-full bg-white" />}
        </span>
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          <Check className="h-3.5 w-3.5" />Save
        </button>
      </div>
    </form>
  );
}

function CategoryPill({
  cat,
  canDelete,
  onDelete,
  deletingId,
}: {
  cat: AssetCategoryRow;
  canDelete: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditForm cat={cat} onDone={() => setEditing(false)} />;
  }

  return (
    <span className={`flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl border text-sm ${
      cat.user_id === null
        ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        : "border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
    }`}>
      {cat.icon} {cat.name}
      {cat.is_liability && (
        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded-md font-medium">Liability</span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="ml-0.5 p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        title="Edit"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {canDelete && (
        <button
          onClick={() => onDelete(cat.id)}
          disabled={deletingId === cat.id}
          className="p-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition"
          title="Delete"
        >
          {deletingId === cat.id
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <X className="h-3 w-3 text-red-400" />}
        </button>
      )}
    </span>
  );
}

export default function AssetCategoryManager() {
  const { assetCategories, userId, addAssetCategory, deleteAssetCategory } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState("");
  const [name, setName] = useState("");
  const [isLiability, setIsLiability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaults = assetCategories.filter((c) => c.user_id === null);
  const custom = assetCategories.filter((c) => c.user_id === userId);

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteAssetCategory(id);
    setDeletingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Category name is required."); return; }
    if (!icon.trim()) { setError("Please enter an emoji icon."); return; }
    addAssetCategory({ name: name.trim(), icon: icon.trim(), is_liability: isLiability });
    setShowForm(false);
    setIcon("");
    setName("");
    setIsLiability(false);
    setError(null);
  }

  return (
    <div className="space-y-4">
      {/* Default categories */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Defaults</p>
        <div className="flex flex-wrap gap-2">
          {defaults.map((cat) => (
            <CategoryPill
              key={cat.id}
              cat={cat}
              canDelete={false}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>
      </div>

      {/* Custom categories */}
      {(custom.length > 0 || showForm) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Your Categories</p>
          <div className="flex flex-wrap gap-2">
            {custom.map((cat) => (
              <CategoryPill
                key={cat.id}
                cat={cat}
                canDelete
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ICONS.map((e) => (
                <button
                  key={e} type="button"
                  onClick={() => setIcon(e)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                    icon === e ? "bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Or type any emoji"
              maxLength={4}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Name</label>
            <input
              type="text" required placeholder="e.g. Cryptocurrency"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsLiability((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
              isLiability ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600" : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
            }`}
          >
            <span>This is a liability (debt / credit card)</span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
              isLiability ? "bg-red-500 border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}>
              {isLiability && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
          </button>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setIsLiability(false); setIcon(""); setName(""); setError(null); }}
              className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      )}
    </div>
  );
}
