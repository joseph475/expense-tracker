"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import type { AssetCategoryRow } from "@/types/database";
import {
  addAssetCategory,
  deleteAssetCategory,
  updateAssetCategory,
  type AssetCategoryFormState,
  type UpdateAssetCategoryState,
} from "../actions";

const initialAdd: AssetCategoryFormState = { error: null, success: false };
const initialEdit: UpdateAssetCategoryState = { error: null, success: false };

const SUGGESTED_ICONS = ["🏦","💰","📈","🏠","🚗","💳","📦","🏆","💎","🪙","🏗️","✈️","🚢","🎨","💼"];

function EditForm({
  cat,
  onDone,
}: {
  cat: AssetCategoryRow;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateAssetCategory, initialEdit);
  const [icon, setIcon] = useState(cat.icon);
  const [isLiability, setIsLiability] = useState(cat.is_liability);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (state.success) onDoneRef.current();
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
      <input type="hidden" name="id" value={cat.id} />
      <input type="hidden" name="is_liability" value={String(isLiability)} />

      {/* Icon picker */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_ICONS.map((e) => (
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
          name="name" type="text" required defaultValue={cat.name}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Liability toggle */}
      <button
        type="button"
        onClick={() => setIsLiability((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
          isLiability ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600"
        }`}
      >
        <span>This is a liability (debt / credit card)</span>
        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          isLiability ? "bg-red-500 border-red-500" : "border-gray-300"
        }`}>
          {isLiability && <span className="w-2 h-2 rounded-full bg-white" />}
        </span>
      </button>

      {state.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition"
        >
          {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</> : <><Check className="h-3.5 w-3.5" />Save</>}
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
        ? "border-gray-200 bg-gray-50 text-gray-600"
        : "border-indigo-200 bg-indigo-50 text-indigo-700"
    }`}>
      {cat.icon} {cat.name}
      {cat.is_liability && (
        <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md font-medium">Liability</span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="ml-0.5 p-0.5 rounded-md hover:bg-gray-200 transition"
        title="Edit"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {canDelete && (
        <button
          onClick={() => onDelete(cat.id)}
          disabled={deletingId === cat.id}
          className="p-0.5 rounded-md hover:bg-red-100 transition"
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

export default function AssetCategoryManager({
  categories,
  userId,
}: {
  categories: AssetCategoryRow[];
  userId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState("");
  const [isLiability, setIsLiability] = useState(false);
  const [state, formAction, isPending] = useActionState(addAssetCategory, initialAdd);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaults = categories.filter((c) => c.user_id === null);
  const custom = categories.filter((c) => c.user_id === userId);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteAssetCategory(id);
    setDeletingId(null);
  }

  if (state.success && showForm) {
    setShowForm(false);
    setIcon("");
    setIsLiability(false);
  }

  return (
    <div className="space-y-4">
      {/* Default categories */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Defaults</p>
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Categories</p>
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
        <form action={formAction} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <input type="hidden" name="is_liability" value={String(isLiability)} />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ICONS.map((e) => (
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

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">Name</label>
            <input
              name="name" type="text" required placeholder="e.g. Cryptocurrency"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsLiability((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
              isLiability ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <span>This is a liability (debt / credit card)</span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
              isLiability ? "bg-red-500 border-red-500" : "border-gray-300"
            }`}>
              {isLiability && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
          </button>

          {state.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setIsLiability(false); setIcon(""); }}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition"
            >
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
          Add category
        </button>
      )}
    </div>
  );
}
