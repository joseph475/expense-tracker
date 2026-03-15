"use client";

import { useAppData } from "@/lib/AppDataContext";
import StatsClient from "./components/StatsClient";

export default function StatsPage() {
  const { transactions, categories, settings } = useAppData();
  return (
    <StatsClient
      transactions={transactions}
      categories={categories}
      currencyCode={settings.currency_code}
    />
  );
}
