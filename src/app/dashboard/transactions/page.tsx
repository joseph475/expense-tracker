import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import AddTransactionButton from "./components/AddTransactionButton";
import TransactionList from "./components/TransactionList";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: categories }, { data: settings }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user!.id}`)
      .order("name"),
    supabase
      .from("user_settings")
      .select("currency_symbol")
      .eq("user_id", user!.id)
      .single(),
  ]);

  const currencySymbol = settings?.currency_symbol ?? "$";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500">Income and expenses in one place.</p>
        </div>
        <AddTransactionButton categories={categories ?? []} />
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <TransactionList userId={user!.id} currencySymbol={currencySymbol} />
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
