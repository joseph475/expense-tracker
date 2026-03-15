"use client";

import { useState } from "react";
import { Plus, Trash2, Lock, Loader2 } from "lucide-react";
import type { CategoryType } from "@/types/database";
import { useAppData } from "@/lib/AppDataContext";

const SUGGESTED_ICONS = {
  expense: ["🍔","🚌","🏠","🎬","💊","👕","⚡","📱","🎓","✈️","🐶","🛒","🍺","💇","🏋️"],
  income:  ["💼","💻","📈","🎁","💰","🏦","🎨","📦","🤝","🏆"],
};

export default function CategoryManager() {
  const { categories, userId, addCategory, deleteCategory } = useAppData();
  const [tab, setTab] = useState<CategoryType>("expense");
  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === tab);
  const defaults = filtered.filter((c) => c.user_id === null);
  const custom = filtered.filter((c) => c.user_id === userId);

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteCategory(id);
    setDeletingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Category name is required."); return; }
    if (!icon.trim()) { setError("Please enter an emoji icon."); return; }
    addCategory({ name: name.trim(), icon: icon.trim(), type: tab });
    setShowForm(false);
    setIcon("");
    setName("");
    setError(null);
  }

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex border-b border-gray-200 -mx-4 px-4">
        <button
          onClick={() => { setTab("expense"); setShowForm(false); }}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            tab === "expense" ? "text-red-500" : "text-gray-400"
          }`}
        >
          Expense
          {tab === "expense" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />}
        </button>
        <button
          onClick={() => { setTab("income"); setShowForm(false); }}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            tab === "income" ? "text-green-500" : "text-gray-400"
          }`}
        >
          Income
          {tab === "income" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />}
        </button>
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
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
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
              type="text" required placeholder="e.g. Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
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
          Add {tab} category
        </button>
      )}
    </div>
  );
}
