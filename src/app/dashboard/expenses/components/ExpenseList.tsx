import { createClient } from "@/lib/supabase/server";
import type { TransactionWithCategory } from "@/types/database";
import ExpenseItem from "./ExpenseItem";

export default async function ExpenseList({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-red-500 px-1">Failed to load expenses.</p>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-gray-400">
          No expenses yet. Tap <strong>Add Expense</strong> to get started.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, TransactionWithCategory[]>>(
    (acc, expense) => {
      const date = expense.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense as TransactionWithCategory);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => {
        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {formatDate(date)}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {items.map((expense) => (
                <ExpenseItem key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
