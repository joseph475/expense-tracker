"use client";

import { useAppData } from "@/lib/AppDataContext";
import Sheet from "./Sheet";

interface TransactionDetailsModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

export default function TransactionDetailsModal({
  transactionId,
  isOpen,
  onClose,
  currencySymbol,
}: TransactionDetailsModalProps) {
  const { transactions } = useAppData();
  const transaction = transactionId ? transactions.find(t => t.id === transactionId) ?? null : null;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Transaction Details">
      <div className="flex-1 overflow-y-auto p-4">
        {transaction ? (
          <div className="space-y-6">
            {/* Transaction Type & Amount */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">
                  {transaction.type === "transfer" ? "↔️" : transaction.category?.icon || "💰"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {transaction.type === "transfer" ? "Transfer" : transaction.category?.name || "Transaction"}
              </h3>
              <p className={`text-2xl font-bold ${
                transaction.type === "income" ? "text-green-600" :
                transaction.type === "transfer" ? "text-blue-600" :
                "text-red-500"
              }`}>
                {transaction.type === "income" ? "+" : transaction.type === "transfer" ? "" : "-"}
                {currencySymbol}{Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              {transaction.description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white">{transaction.description}</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.date + "T00:00:00").toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {transaction.type === "transfer" ? (
                <>
                  {transaction.account && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Account</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{transaction.account.assetCategory?.icon || "💰"}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.account.name}</span>
                      </div>
                    </div>
                  )}
                  {transaction.to_account && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Account</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{transaction.to_account.assetCategory?.icon || "💰"}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.to_account.name}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                transaction.account && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{transaction.account.assetCategory?.icon || "💰"}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.account.name}</span>
                    </div>
                  </div>
                )
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.type === "income" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" :
                  transaction.type === "transfer" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300" :
                  "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                }`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{transaction.id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Transaction not found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">This transaction may have been deleted</p>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
