"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, TrendingUp } from "lucide-react";
import type { Asset } from "@/types/database";
import { updateAssetValue, deleteAsset } from "../actions";

const CATEGORY_ICONS: Record<string, string> = {
  cash: "🏦", investment: "📈", property: "🏠", vehicle: "🚗", liability: "💳", other: "📦",
};

const LIABILITIES = new Set(["liability"]);

function calcProjected(asset: Asset): { projected: number; earned: number; daily: number } {
  if (!asset.interest_rate || asset.interest_rate <= 0) {
    return { projected: Number(asset.current_value), earned: 0, daily: 0 };
  }

  const principal = Number(asset.current_value);
  const annualRate = asset.interest_rate / 100;
  const dailyRate = annualRate / 365;

  // Days since last updated_at
  const lastUpdated = new Date(asset.updated_at);
  const now = new Date();
  const days = Math.max(0, (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  // Compound daily: A = P * (1 + r/365)^days
  const projected = principal * Math.pow(1 + dailyRate, days);
  const earned = projected - principal;
  const daily = principal * dailyRate;

  return { projected, earned, daily };
}

export default function AssetCard({
  asset,
  currencySymbol,
}: {
  asset: Asset;
  currencySymbol: string;
}) {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(String(asset.current_value));
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const { projected, earned, daily } = calcProjected(asset);
  const hasInterest = !!asset.interest_rate && asset.interest_rate > 0;
  const isLiability = LIABILITIES.has(asset.category);

  async function handleSave() {
    const val = parseFloat(newValue);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    await updateAssetValue(asset.id, val);
    setEditing(false);
    setLoading(false);
  }

  async function handleApplyInterest() {
    setLoading(true);
    await updateAssetValue(asset.id, parseFloat(projected.toFixed(2)));
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    await deleteAsset(asset.id);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0">{CATEGORY_ICONS[asset.category]}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            {asset.category}
            {hasInterest && ` · ${asset.interest_rate}% p.a.`}
          </p>
        </div>

        {editing ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{currencySymbol}</span>
              <input
                type="number" inputMode="decimal" step="0.01" min="0"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-28 pl-5 pr-2 py-1.5 rounded-lg border border-indigo-400 text-sm focus:outline-none"
                autoFocus
              />
            </div>
            <button onClick={handleSave} disabled={loading} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className={`text-sm font-bold ${isLiability ? "text-red-500" : "text-gray-900"}`}>
                {isLiability ? "-" : ""}{currencySymbol}{Number(asset.current_value).toFixed(2)}
              </p>
              {hasInterest && earned > 0.001 && (
                <p className="text-xs text-green-600 font-medium">
                  +{currencySymbol}{projected.toFixed(2)} projected
                </p>
              )}
            </div>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete} disabled={loading}
              className={`p-1.5 rounded-lg text-xs transition ${confirming ? "bg-red-100 text-red-600 font-medium px-2" : "text-gray-300 hover:text-red-400 hover:bg-red-50"}`}
            >
              {confirming ? "Sure?" : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Interest info row */}
      {hasInterest && (
        <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-green-600 shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-800">
                Daily earnings: +{currencySymbol}{daily.toFixed(4)}
              </p>
              {earned > 0.001 && (
                <p className="text-xs text-green-600">
                  Accumulated: +{currencySymbol}{earned.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          {earned >= 0.01 && (
            <button
              onClick={handleApplyInterest}
              disabled={loading}
              className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded-lg transition"
            >
              Apply
            </button>
          )}
        </div>
      )}
    </div>
  );
}
