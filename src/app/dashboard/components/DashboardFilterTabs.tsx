"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import SearchAndFilter from "./SearchAndFilter";

type View = "today" | "month" | "calendar";

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface Asset {
  id: string;
  name: string;
  asset_categories?: {
    name: string;
    icon: string;
    is_liability: boolean;
  };
}

interface DashboardFilterTabsProps {
  assets?: Asset[];
}

export default function DashboardFilterTabs({ assets = [] }: DashboardFilterTabsProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const view = (params.get("view") as View) ?? "today";
  const selectedDate = params.get("date") ?? "";
  const selectedMonth = params.get("month") ?? currentMonthStr();

  function navigate(v: View, extra?: Record<string, string>) {
    const p = new URLSearchParams();
    p.set("view", v);
    if (extra) Object.entries(extra).forEach(([k, val]) => p.set(k, val));
    startTransition(() => router.push(`/dashboard?${p.toString()}`));
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Search and Filter Row */}
      <div className="px-4">
        <SearchAndFilter assets={assets} />
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate("today")}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            view === "today" ? "text-indigo-600" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          Today
          {view === "today" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button
          onClick={() => navigate("month", { month: selectedMonth })}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            view === "month" ? "text-indigo-600" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          Month
          {view === "month" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button
          onClick={() => navigate("calendar", { date: selectedDate || new Date().toISOString().split("T")[0] })}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative ${
            view === "calendar" ? "text-indigo-600" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          Calendar
          {view === "calendar" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>
    </div>
  );
}
