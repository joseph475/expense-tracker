import { createClient } from "@/lib/supabase/server";
import type { TransactionWithCategory } from "@/types/database";
import TransactionItem from "./TransactionItem";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function TransactionList({
  userId,
  currencySymbol,
}: {
  userId: string;
  currencySymbol: string;
}) {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return <p className="text-sm text-red-500 px-1">Failed to load transactions.</p>;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-gray-400">No transactions yet. Tap <strong>+</strong> to add one.</p>
      </div>
    );
  }

  const grouped = transactions.reduce<Record<string, TransactionWithCategory[]>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t as TransactionWithCategory);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => {
        const net = items.reduce((sum, t) =>
          t.type === "income" ? sum + Number(t.amount) : sum - Number(t.amount), 0
        );
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {formatDate(date)}
              </span>
              <span className={`text-xs font-semibold ${net >= 0 ? "text-green-600" : "text-gray-500"}`}>
                {net >= 0 ? "+" : ""}{currencySymbol}{Math.abs(net).toFixed(2)}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {items.map((t) => (
                <TransactionItem key={t.id} transaction={t} currencySymbol={currencySymbol} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
