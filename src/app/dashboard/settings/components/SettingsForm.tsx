"use client";

import { useActionState, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { saveSettings, type SettingsState } from "../actions";

const initialState: SettingsState = { error: null, success: false };

export default function SettingsForm({ currentCode }: { currentCode: string }) {
  const [selected, setSelected] = useState(currentCode);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);

  const current = CURRENCIES.find((c) => c.code === selected) ?? CURRENCIES[0];

  return (
    <>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="currency_code" value={selected} />

        {/* Compact current value row */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 transition"
        >
          <span className="text-2xl w-8 text-center shrink-0">{current.symbol}</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">{current.name}</p>
            <p className="text-xs text-gray-400">{current.code}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        </button>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            Settings saved!
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </form>

      {/* Currency picker sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
            <div className="bg-white w-full rounded-t-2xl md:rounded-2xl md:max-w-sm shadow-xl max-h-[75dvh] flex flex-col">

              <div className="flex justify-center pt-3 md:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <h2 className="text-base font-semibold text-gray-900">Select Currency</h2>
                <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto py-2">
                {CURRENCIES.map((c) => {
                  const active = selected === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setSelected(c.code); setSheetOpen(false); }}
                      className={`w-full flex items-center gap-3 px-5 py-3 transition ${active ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                    >
                      <span className="text-xl w-8 text-center shrink-0">{c.symbol}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.code}</p>
                      </div>
                      {active && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
