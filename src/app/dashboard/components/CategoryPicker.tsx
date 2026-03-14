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
    <div className="space-y-3">
      <p className="text-lg font-medium text-gray-900">Category</p>
      <input type="hidden" name="category_id" value={selected} />
      <div className="flex flex-wrap gap-3">
        {filtered.map((cat) => {
          const active = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelected(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-base font-medium transition active:scale-95 ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
      {!selected && (
        <p className="text-sm text-gray-500">Tap a category to select it.</p>
      )}
    </div>
  );
}
