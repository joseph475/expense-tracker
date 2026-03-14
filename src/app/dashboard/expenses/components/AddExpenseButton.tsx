"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddExpenseSheet from "./AddExpenseSheet";
import type { Category } from "@/types/database";

export default function AddExpenseButton({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop — button in header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow transition"
      >
        <Plus className="h-4 w-4" />
        Add Expense
      </button>

      {/* Mobile — floating action button above bottom nav */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-30 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-lg transition"
        aria-label="Add Expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddExpenseSheet
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
