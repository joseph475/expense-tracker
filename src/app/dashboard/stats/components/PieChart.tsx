"use client";

import { formatCurrency } from "@/lib/currency";

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  currencyCode: string;
}

export default function PieChart({ data, currencyCode }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for each segment
  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle
    };
  });

  // SVG dimensions
  const size = 160;
  const center = size / 2;
  const radius = 60;

  // Special case: single category (100%)
  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center">
        {/* Full Circle for Single Category */}
        <div className="relative mb-4">
          <svg width={size} height={size}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={data[0].color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          
          {/* Center circle with total */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-xs font-semibold text-gray-900">
                  {formatCurrency(total, currencyCode)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: data[0].color }}
              />
              <span className="text-gray-700 truncate">{data[0].name}</span>
            </div>
            <div className="flex items-center space-x-2 text-right">
              <span className="text-gray-500">100.0%</span>
              <span className="font-medium text-gray-900 min-w-0">
                {formatCurrency(data[0].value, currencyCode)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create SVG path for each segment (multiple categories)
  const createPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* SVG Pie Chart */}
      <div className="relative mb-4">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
        
        {/* Center circle with total */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xs font-semibold text-gray-900">
                {formatCurrency(total, currencyCode)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-1.5">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 truncate">{segment.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-right">
              <span className="text-gray-500">{segment.percentage.toFixed(1)}%</span>
              <span className="font-medium text-gray-900 min-w-0">
                {formatCurrency(segment.value, currencyCode)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}