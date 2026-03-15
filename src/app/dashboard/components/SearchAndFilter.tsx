"use client";

import { useState } from "react";
import { Search, Filter, X, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Asset {
  id: string;
  name: string;
  asset_categories?: {
    name: string;
    icon: string;
    is_liability: boolean;
  };
}

interface SearchAndFilterProps {
  assets: Asset[];
}

export default function SearchAndFilter({ assets }: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Get current account filters from URL
  const currentAccountFilters = searchParams.get("accounts")?.split(",").filter(Boolean) || [];
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(currentAccountFilters);

  const updateURL = (search?: string, accounts?: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search parameter
    if (search !== undefined) {
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
    }

    // Update accounts parameter
    if (accounts !== undefined) {
      if (accounts.length > 0) {
        params.set("accounts", accounts.join(","));
      } else {
        params.delete("accounts");
      }
    }

    // Preserve other parameters
    const currentView = searchParams.get("view");
    const currentDate = searchParams.get("date");
    const currentMonth = searchParams.get("month");
    
    if (currentView) params.set("view", currentView);
    if (currentDate) params.set("date", currentDate);
    if (currentMonth) params.set("month", currentMonth);

    router.push(`/dashboard?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(searchTerm);
    setShowSearchModal(false);
  };

  const handleAccountToggle = (accountId: string) => {
    const newSelected = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    
    setSelectedAccounts(newSelected);
  };

  const applyAccountFilter = () => {
    updateURL(undefined, selectedAccounts);
    setShowFilterModal(false);
  };

  const clearAccountFilter = () => {
    setSelectedAccounts([]);
    updateURL(undefined, []);
    setShowFilterModal(false);
  };

  const hasActiveFilters = searchTerm || currentAccountFilters.length > 0;

  return (
    <>
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left side - Search Button */}
        <div className="flex justify-start">
          <button
            onClick={() => setShowSearchModal(true)}
            className={`p-2 rounded-lg transition ${
              searchTerm ? "bg-indigo-100 text-indigo-600" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Center - Transactions Label */}
        <div className="flex justify-center">
          <h2 className="text-base font-semibold text-gray-900">Transactions</h2>
        </div>

        {/* Right side - Filter Button with Active filters indicator */}
        <div className="flex justify-end items-center gap-2">
          {hasActiveFilters && (
            <div className="flex items-center gap-1 text-xs text-indigo-600">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              <span>Filtered</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowFilterModal(true)}
              className={`p-2 rounded-lg transition ${
                currentAccountFilters.length > 0 ? "bg-indigo-100 text-indigo-600" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
            {currentAccountFilters.length > 0 && (
              <span className="absolute top-0 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {currentAccountFilters.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal — slides from right */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          showSearchModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowSearchModal(false)}
      />
      <div className={`fixed inset-0 z-60 bg-white transform transition-transform duration-300 ease-in-out ${
        showSearchModal ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Search</h2>
            <button
              onClick={() => setShowSearchModal(false)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Descriptions, categories, accounts..."
                    className="w-full pl-9 pr-4 py-3 text-sm bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400"
                    autoFocus
                  />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); updateURL(""); setShowSearchModal(false); }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition font-medium shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filter Modal — slides from right */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          showFilterModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowFilterModal(false)}
      />
      <div className={`fixed inset-0 z-60 bg-white transform transition-transform duration-300 ease-in-out ${
        showFilterModal ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Filter by Account</h2>
            <button
              onClick={() => setShowFilterModal(false)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1.5">
              {assets.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 active:bg-gray-100 transition"
                >
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleAccountToggle(account.id)}
                      className="sr-only"
                    />
                    <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition ${
                      selectedAccounts.includes(account.id)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}>
                      {selectedAccounts.includes(account.id) && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base leading-none">{account.asset_categories?.icon || "💰"}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{account.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button
              onClick={applyAccountFilter}
              className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Apply{selectedAccounts.length > 0 ? ` (${selectedAccounts.length})` : ""}
            </button>
            {selectedAccounts.length > 0 && (
              <button
                onClick={clearAccountFilter}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}