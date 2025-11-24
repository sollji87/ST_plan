"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ComparisonData {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  profitability: number;
}

interface ComparisonTableProps {
  data: ComparisonData[];
  title?: string;
}

export function ComparisonTable({
  data,
  title = "기간별 비교",
}: ComparisonTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // 연도별로 그룹화
  const groupedByYear = data.reduce((acc, item) => {
    const year = item.period.split("-")[0];
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as Record<string, ComparisonData[]>);

  // 연도별 합계 계산
  const yearlyTotals = Object.entries(groupedByYear).map(([year, items]) => {
    const totals = items.reduce(
      (sum, item) => ({
        revenue: sum.revenue + item.revenue,
        cost: sum.cost + item.cost,
        profit: sum.profit + item.profit,
      }),
      { revenue: 0, cost: 0, profit: 0 }
    );
    return {
      year,
      ...totals,
      profitability: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
    };
  });

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-[#1a1a1a]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">기간</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">매출</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">비용</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">이익</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">수익성</th>
              </tr>
            </thead>
            <tbody>
              {yearlyTotals.map((year, index) => (
                <tr 
                  key={year.year} 
                  className={`border-b border-gray-200 hover:bg-[#eff6ff] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                  }`}
                >
                  <td className="p-4 font-semibold text-[#1a1a1a]">{year.year}년</td>
                  <td className="text-right p-4 font-medium text-gray-700">{formatCurrency(year.revenue)}</td>
                  <td className="text-right p-4 font-medium text-gray-700">{formatCurrency(year.cost)}</td>
                  <td
                    className={`text-right p-4 font-bold ${
                      year.profit >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                    }`}
                  >
                    {formatCurrency(year.profit)}
                  </td>
                  <td
                    className={`text-right p-4 font-bold ${
                      year.profitability >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                    }`}
                  >
                    {formatPercent(year.profitability)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

