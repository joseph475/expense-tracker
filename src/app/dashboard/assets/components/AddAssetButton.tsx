"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddAssetSheet from "./AddAssetSheet";

export default function AddAssetButton({ currencySymbol }: { currencySymbol: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow transition">
        <Plus className="h-4 w-4" /> Add Asset
      </button>
      <button onClick={() => setOpen(true)} className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition" aria-label="Add Asset">
        <Plus className="h-6 w-6" />
      </button>
      <AddAssetSheet open={open} onClose={() => setOpen(false)} currencySymbol={currencySymbol} />
    </>
  );
}
