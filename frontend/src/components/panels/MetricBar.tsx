'use client';

interface MetricBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

export function MetricBar({ label, value, maxValue = 10, color }: MetricBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-dark-600">{label}</span>
        <span className="text-sm text-dark-500">{value.toFixed(1)}/{maxValue}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
}
