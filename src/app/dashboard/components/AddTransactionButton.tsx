"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddTransactionSheet from "./AddTransactionSheet";

export default function AddTransactionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-26 right-4 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition md:hidden ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Add Transaction"
      >
        <Plus className="h-6 w-6" />
      </button>
      <AddTransactionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
