"use client";

import { useState } from "react";
import type { Category } from "@/types/database";

export default function CategoryPicker({
  categories,
}: {
  categories: Category[];
}) {
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">Category</label>

      {/* Hidden input carries the value into the form */}
      <input type="hidden" name="category_id" value={selected} required />

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
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

      {/* Validation hint — shows if form submitted with nothing selected */}
      {selected === "" && (
        <p className="text-xs text-gray-400">Tap a category to select it.</p>
      )}
    </div>
  );
}
