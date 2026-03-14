"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2, Lock, Loader2 } from "lucide-react";
import type { Category, CategoryType } from "@/types/database";
import { addCategory, deleteCategory, type CategoryFormState } from "../actions";

const initialState: CategoryFormState = { error: null, success: false };

const SUGGESTED_ICONS = {
  expense: ["🍔","🚌","🏠","🎬","💊","👕","⚡","📱","🎓","✈️","🐶","🛒","🍺","💇","🏋️"],
  income:  ["💼","💻","📈","🎁","💰","🏦","🎨","📦","🤝","🏆"],
};

export default function CategoryManager({
  categories,
  userId,
}: {
  categories: Category[];
  userId: string;
}) {
  const [tab, setTab] = useState<CategoryType>("expense");
  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState("");
  const [state, formAction, isPending] = useActionState(addCategory, initialState);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === tab);
  const defaults = filtered.filter((c) => c.user_id === null);
  const custom = filtered.filter((c) => c.user_id === userId);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteCategory(id);
    setDeletingId(null);
  }

  // Close form on success
  if (state.success && showForm) {
    setShowForm(false);
    setIcon("");
  }

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex rounded-xl border border-gray-200 p-1 gap-1">
        {(["expense", "income"] as CategoryType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "expense" ? "💸 Expense" : "💰 Income"}
          </button>
        ))}
      </div>

      {/* Default categories */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Lock className="h-3 w-3" /> Defaults
        </p>
        <div className="flex flex-wrap gap-2">
          {defaults.map((cat) => (
            <span key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
              {cat.icon} {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Custom categories */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Categories</p>
        {custom.length === 0 && !showForm ? (
          <p className="text-xs text-gray-400">None yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {custom.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-sm text-indigo-700"
              >
                {cat.icon} {cat.name}
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="ml-0.5 p-0.5 rounded-md hover:bg-indigo-200 transition"
                >
                  {deletingId === cat.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />
                  }
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <form action={formAction} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <input type="hidden" name="type" value={tab} />

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ICONS[tab].map((e) => (
                <button
                  key={e} type="button"
                  onClick={() => setIcon(e)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                    icon === e ? "bg-indigo-100 ring-2 ring-indigo-500" : "bg-white border border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              name="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Or type any emoji"
              maxLength={4}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">Name</label>
            <input
              name="name" type="text" required placeholder="e.g. Coffee"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {state.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition">
              {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</> : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add {tab} category
        </button>
      )}
    </div>
  );
}
