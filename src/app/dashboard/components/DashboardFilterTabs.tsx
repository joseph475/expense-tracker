"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type View = "today" | "month" | "date";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function toYM(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function addMonths(ym: string, delta: number) {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardFilterTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const view = (params.get("view") as View) ?? "today";
  const selectedDate = params.get("date") ?? "";
  const selectedMonth = params.get("month") ?? currentMonthStr();
  const todayMonth = currentMonthStr();

  const [pickerYear, setPickerYear] = useState(() =>
    Number(selectedMonth.split("-")[0])
  );
  const todayYear = new Date().getFullYear();
  const todayMonthNum = new Date().getMonth() + 1;

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pickerOpen]);

  function navigate(v: View, extra?: Record<string, string>) {
    const p = new URLSearchParams();
    p.set("view", v);
    if (extra) Object.entries(extra).forEach(([k, val]) => p.set(k, val));
    startTransition(() => router.push(`/dashboard?${p.toString()}`));
  }

  function selectMonth(year: number, month: number) {
    setPickerOpen(false);
    navigate("month", { month: toYM(year, month) });
  }

  const tabClass = (v: View) =>
    `flex-1 py-2 text-sm font-medium rounded-lg transition ${
      view === v
        ? "bg-indigo-600 text-white"
        : "text-gray-500 hover:text-gray-800"
    }`;

  const canGoNext = selectedMonth < todayMonth;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button className={tabClass("today")} onClick={() => navigate("today")}>
          Today
        </button>
        <button
          className={tabClass("month")}
          onClick={() => navigate("month", { month: selectedMonth })}
        >
          Month
        </button>
        <button
          className={tabClass("date")}
          onClick={() =>
            navigate("date", {
              date: selectedDate || new Date().toISOString().split("T")[0],
            })
          }
        >
          Pick Date
        </button>
      </div>

      {view === "month" && (
        <div className="relative w-full" ref={pickerRef}>
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2">
            <button
              onClick={() => navigate("month", { month: addMonths(selectedMonth, -1) })}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setPickerYear(Number(selectedMonth.split("-")[0]));
                setPickerOpen((o) => !o);
              }}
              className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              {formatMonth(selectedMonth)}
            </button>

            <button
              onClick={() => navigate("month", { month: addMonths(selectedMonth, 1) })}
              disabled={!canGoNext}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {pickerOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3">
              {/* Year navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800">{pickerYear}</span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  disabled={pickerYear >= todayYear}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Month grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {MONTH_NAMES.map((name, i) => {
                  const monthNum = i + 1;
                  const ym = toYM(pickerYear, monthNum);
                  const isFuture =
                    pickerYear > todayYear ||
                    (pickerYear === todayYear && monthNum > todayMonthNum);
                  const isSelected = ym === selectedMonth;

                  return (
                    <button
                      key={name}
                      disabled={isFuture}
                      onClick={() => selectMonth(pickerYear, monthNum)}
                      className={`py-1.5 text-xs font-medium rounded-lg transition ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : isFuture
                          ? "text-gray-300 pointer-events-none"
                          : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "date" && (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
          <input
            type="date"
            defaultValue={selectedDate || new Date().toISOString().split("T")[0]}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              if (e.target.value) navigate("date", { date: e.target.value });
            }}
            className="w-full box-border px-4 py-2.5 text-sm text-gray-700 bg-transparent focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
