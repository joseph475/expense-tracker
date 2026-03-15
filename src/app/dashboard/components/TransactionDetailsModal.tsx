"use client";

import { X } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="fixed inset-0 z-[60] bg-white">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {transaction ? (
              <div className="space-y-6">
                {/* Transaction Type & Amount */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">
                      {transaction.type === "transfer" ? "↔️" : transaction.category?.icon || "💰"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {transaction.type === "transfer" ? "Transfer" : transaction.category?.name || "Transaction"}
                  </h3>
                  <p className={`text-2xl font-bold ${
                    transaction.type === "income" ? "text-green-600" :
                    transaction.type === "transfer" ? "text-blue-600" :
                    "text-red-500"
                  }`}>
                    {transaction.type === "income" ? "+" : transaction.type === "transfer" ? "" : "-"}
                    {currencySymbol}{Number(transaction.amount).toFixed(2)}
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                  {/* Description */}
                  {transaction.description && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-900">{transaction.description}</p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(transaction.date + "T00:00:00").toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Account Information */}
                  {transaction.type === "transfer" ? (
                    <>
                      {transaction.account && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">From Account</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {transaction.account.assetCategory?.icon || "💰"}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.account.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {transaction.to_account && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">To Account</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {transaction.to_account.assetCategory?.icon || "💰"}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.to_account.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    transaction.account && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Account</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {transaction.account.assetCategory?.icon || "💰"}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.account.name}
                          </span>
                        </div>
                      </div>
                    )
                  )}

                  {/* Transaction Type */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "income" ? "bg-green-100 text-green-800" :
                      transaction.type === "transfer" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </div>

                  {/* Transaction ID */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-600">{transaction.id}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Transaction not found</p>
                  <p className="text-xs text-gray-400">This transaction may have been deleted</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
