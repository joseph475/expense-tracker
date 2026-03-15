"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";

interface MiniPieChartProps {
  data: { name: string; value: number; color: string }[];
  currencyCode: string;
  label: string;
  labelColor: string;
}

export default function MiniPieChart({ data, currencyCode, label, labelColor }: MiniPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const SIZE = 130;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-xs font-semibold" style={{ color: labelColor }}>{label}</p>
        <div
          className="rounded-full bg-gray-100 flex items-center justify-center"
          style={{ width: SIZE, height: SIZE }}
        >
          <span className="text-[10px] text-gray-400">No data</span>
        </div>
        <p className="text-xs text-gray-400">—</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs font-semibold" style={{ color: labelColor }}>{label}</p>
      <div className="relative" style={{ width: SIZE, height: SIZE, touchAction: "pan-y" }}>
        <PieChart width={SIZE} height={SIZE}>
          <Pie
            data={data}
            cx={SIZE / 2}
            cy={SIZE / 2}
            innerRadius={0}
            outerRadius={54}
            dataKey="value"
            stroke="white"
            strokeWidth={2}
            isAnimationActive
            animationBegin={0}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(value as number, currencyCode), ""]}
            contentStyle={{
              fontSize: 11,
              borderRadius: 10,
              border: "1px solid #f3f4f6",
              padding: "4px 10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ display: "none" }}
          />
        </PieChart>
      </div>
      <p className="text-xs font-semibold text-gray-700">{formatCurrency(total, currencyCode)}</p>
    </div>
  );
}
