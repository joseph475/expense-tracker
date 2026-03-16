"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useAppData } from "@/lib/AppDataContext";
import Sheet from "@/app/dashboard/components/Sheet";

export default function SettingsForm({ currentCode }: { currentCode: string }) {
  const { updateSettings, settings } = useAppData();
  const [selected, setSelected] = useState(currentCode);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = CURRENCIES.find((c) => c.code === selected) ?? CURRENCIES[0];

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({ ...settings, currency_code: current.code, currency_symbol: current.symbol });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <form onSubmit={handleSave} className="space-y-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <span className="text-2xl w-8 text-center shrink-0">{current.symbol}</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{current.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{current.code}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
        </button>

        {saved && (
          <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-xl px-3 py-2">
            Settings saved!
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium transition"
        >
          Save
        </button>
      </form>

      {/* Currency picker sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Select Currency">
        <div className="flex-1 overflow-y-auto py-2">
          {CURRENCIES.map((c) => {
            const active = selected === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => { setSelected(c.code); setSheetOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${active ? "bg-indigo-50 dark:bg-indigo-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                <span className="text-xl w-8 text-center shrink-0">{c.symbol}</span>
                <div className="flex-1 text-left">
                  <p className="text-base font-medium text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.code}</p>
                </div>
                {active && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
