"use client";

import { useState } from "react";
import type { TransactionWithCategory } from "@/types/database";
import TransactionDetailsModal from "./TransactionDetailsModal";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  currencySymbol: string;
}

export default function RecentTransactions({ transactions, currencySymbol }: RecentTransactionsProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

  const handleCloseModal = () => {
    setSelectedTransactionId(null);
  };

  return (
    <>
      <div className="bg-white">
        <div className="px-3 py-2 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTransactionClick(t.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs">
                  {t.type === "transfer" ? "↔️" : t.category?.icon || "💰"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {t.description ?? (t.type === "transfer" ? "Transfer" : t.category?.name || "Transaction")}
                </p>
                <p className="text-xs text-gray-500">{t.date}</p>
              </div>
              <span className={`text-xs font-semibold shrink-0 ${
                t.type === "income" ? "text-green-600" :
                t.type === "transfer" ? "text-blue-600" :
                "text-red-500"
              }`}>
                {t.type === "income" ? "+" : t.type === "transfer" ? "↔" : "-"}{currencySymbol}{Number(t.amount).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        isOpen={!!selectedTransactionId}
        onClose={handleCloseModal}
        currencySymbol={currencySymbol}
      />
    </>
  );
}