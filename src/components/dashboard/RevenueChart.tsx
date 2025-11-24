"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChartData {
  period: string;
  value: number;
}

interface RevenueChartProps {
  data: ChartData[];
  title?: string;
  color?: string;
}

export function RevenueChart({
  data,
  title = "매출 추이",
  color = "#3b82f6",
}: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data.map((item) => ({
    period: item.period,
    value: item.value,
    formatted: formatCurrency(item.value),
  }));

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-[#1a1a1a]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1e3a8a"
              strokeWidth={2.5}
              name={title}
              dot={{ r: 4, fill: "#1e3a8a" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

