"use client";

import { useState } from "react";
import type { Category, TransactionType } from "@/types/database";

export default function CategoryPicker({
  categories,
  type,
}: {
  categories: Category[];
  type: TransactionType;
}) {
  const [selected, setSelected] = useState<string>("");
  const filtered = categories.filter((c) => c.type === type);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      <input type="hidden" name="category_id" value={selected} />
      <div className="flex flex-wrap gap-2">
        {filtered.map((cat) => {
          const active = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelected(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition active:scale-95 ${
                active
                  ? "bg-indigo-600 border-indigo-600 text-white shadow"
                  : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
      {!selected && (
        <p className="text-xs text-gray-400">Tap a category to select it.</p>
      )}
    </div>
  );
}
