"use client";

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import type { AssetWithCategory } from "@/types/database";
import Sheet from "@/app/dashboard/components/Sheet";

export default function AccountDetailSheet({
  account,
  open,
  onClose,
  symbol,
  onPayLiability,
}: {
  account: AssetWithCategory | null;
  open: boolean;
  onClose: () => void;
  symbol: string;
  onPayLiability: () => void;
}) {
  const { transactions } = useAppData();

  const accountTransactions = account
    ? transactions
        .filter((t) => t.account_id === account.id || t.to_account_id === account.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
        .slice(0, 20)
    : [];

  const isLiability =
    account?.assetCategory?.is_liability ?? account?.category === "liability";

  function fmt(n: number) {
    return symbol + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  return (
    <Sheet open={open} onClose={onClose} title={account?.name ?? ""}>
      {/* Balance hero */}
      <div className={`px-4 py-5 shrink-0 ${isLiability ? "bg-rose-50 dark:bg-rose-950" : "bg-indigo-50 dark:bg-indigo-950"}`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {isLiability ? "Outstanding Balance" : "Current Balance"}
        </p>
        <p className={`text-2xl font-bold ${isLiability ? "text-rose-500" : "text-indigo-600"}`}>
          {isLiability ? "-" : ""}
          {fmt(Number(account?.current_value ?? 0))}
        </p>
        {account?.assetCategory && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {account.assetCategory.icon} {account.assetCategory.name}
          </p>
        )}
      </div>

      {/* Pay liability button */}
      {isLiability && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <button
            onClick={onPayLiability}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-medium transition"
          >
            <CreditCard className="h-4 w-4" />
            Pay this Liability
          </button>
        </div>
      )}

      {/* Recent transactions — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Transactions</p>
        </div>

        {accountTransactions.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {accountTransactions.map((tx) => {
              const isTransfer = tx.type === "transfer";
              const isIncoming = isTransfer && tx.to_account_id === account?.id;

              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isTransfer
                        ? "bg-blue-100 dark:bg-blue-900"
                        : tx.type === "income"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
                    ) : tx.type === "income" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {tx.category
                        ? `${tx.category.icon} ${tx.category.name}`
                        : isTransfer
                        ? isIncoming
                          ? `From ${tx.account?.name ?? "Transfer"}`
                          : `To ${tx.to_account?.name ?? "Transfer"}`
                        : "Transaction"}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{tx.description}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">{tx.date}</p>
                  </div>

                  <p
                    className={`text-sm font-medium shrink-0 ${
                      isTransfer
                        ? isIncoming
                          ? "text-green-600"
                          : "text-blue-600"
                        : tx.type === "income"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {isTransfer
                      ? isIncoming
                        ? `+${fmt(tx.amount)}`
                        : `-${fmt(tx.amount)}`
                      : tx.type === "income"
                      ? `+${fmt(tx.amount)}`
                      : `-${fmt(tx.amount)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
