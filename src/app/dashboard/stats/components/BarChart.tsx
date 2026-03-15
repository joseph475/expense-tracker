"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";

interface BarChartProps {
  data: { month: string; income: number; expense: number }[];
  currencyCode?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  currencyCode,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
  currencyCode?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs min-w-[110px]">
      <p className="font-semibold text-gray-600 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span className={p.dataKey === "income" ? "text-green-600" : "text-red-500"}>
            {p.dataKey === "income" ? "Income" : "Expenses"}
          </span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(p.value, currencyCode ?? "USD")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BarChart({ data, currencyCode }: BarChartProps) {
  return (
    <div style={{ touchAction: "pan-y" }}>
      <ResponsiveContainer width="100%" height={120}>
        <RechartsBarChart data={data} barGap={3} barCategoryGap="28%">
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip currencyCode={currencyCode} />}
            cursor={{ fill: "#f9fafb" }}
          />
          <Bar
            dataKey="income"
            fill="#4ADE80"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="expense"
            fill="#F87171"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-400" />
          <span className="text-xs text-gray-500">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
    </div>
  );
}
