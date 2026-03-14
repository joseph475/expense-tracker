"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddTransactionSheet from "./AddTransactionSheet";
import type { Asset, Category } from "@/types/database";

export default function AddTransactionButton({
  categories,
  assets,
}: {
  categories: Category[];
  assets: Asset[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition md:hidden"
        aria-label="Add Transaction"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddTransactionSheet open={open} onClose={() => setOpen(false)} categories={categories} assets={assets} />
    </>
  );
}
