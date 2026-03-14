import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import AddExpenseButton from "./components/AddExpenseButton";
import ExpenseList from "./components/ExpenseList";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user!.id}`)
    .order("name");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track where your money goes.</p>
        </div>
        {/* Desktop button lives here; mobile FAB is inside AddExpenseButton */}
        <AddExpenseButton categories={categories ?? []} />
      </div>

      {/* List */}
      <Suspense fallback={<ListSkeleton />}>
        <ExpenseList userId={user!.id} />
      </Suspense>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
