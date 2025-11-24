"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChannelInputModal } from "./ChannelInputModal";

export interface ChannelData {
  name: string;
  revenue: number;
  actualSales?: number; // 실판매액 (입력 가능)
}

export interface IncomeStatementData {
  period: string; // "2023", "2024", "2025" 또는 "2025-11", "2025-12" 등
  revenue: number; // 매출
  cost: number; // 비용
  profit: number; // 이익
  profitability: number; // 수익성 (%)
  inventory?: number; // 재고 (선택적)
  channels?: ChannelData[]; // 채널별 데이터
}

interface IncomeStatementProps {
  data: IncomeStatementData[];
  title?: string;
  onChannelUpdate?: (period: string, channelName: string, actualSales: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function IncomeStatement({ data, title = "손익계산서", onChannelUpdate }: IncomeStatementProps) {
  const [selectedChannel, setSelectedChannel] = useState<{
    period: string;
    channelName: string;
    currentRevenue: number;
    currentActualSales?: number;
  } | null>(null);
  // 연도별로 그룹화
  const groupedByYear = data
    .filter((item) => item && item.period) // period가 있는 항목만 필터링
    .reduce((acc, item) => {
      const year = item.period.split("-")[0];
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    }, {} as Record<string, IncomeStatementData[]>);

  // 연도별 합계 계산
  const yearlyTotals = Object.entries(groupedByYear).map(([year, items]) => {
    const totals = items.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        cost: acc.cost + item.cost,
        profit: acc.profit + item.profit,
        inventory: acc.inventory + (item.inventory || 0),
      }),
      { revenue: 0, cost: 0, profit: 0, inventory: 0 }
    );
    const profitability = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;
    return { year, ...totals, profitability };
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
                {data.some((d) => d.channels && d.channels.length > 0) && (
                  <th className="text-center p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">채널별 매출</th>
                )}
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">비용</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">이익</th>
                <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">수익성</th>
                {data.some((d) => d.inventory !== undefined) && (
                  <th className="text-right p-4 font-bold text-[#1a1a1a] bg-[#f5f5f0]">재고</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* 연도별 합계 행 */}
              {yearlyTotals.map((year, index) => (
                <tr
                  key={`year-${year.year}`}
                  className={`border-b-2 border-gray-400 font-bold ${
                    index % 2 === 0 ? "bg-[#f9fafb]" : "bg-white"
                  }`}
                >
                  <td className="p-4 text-[#1a1a1a]">{year.year}년 합계</td>
                  <td className="text-right p-4 text-[#1a1a1a]">{formatCurrency(year.revenue)}</td>
                  {data.some((d) => d.channels && d.channels.length > 0) && (
                    <td className="text-center p-4 text-gray-500 text-sm">-</td>
                  )}
                  <td className="text-right p-4 text-[#1a1a1a]">{formatCurrency(year.cost)}</td>
                  <td
                    className={`text-right p-4 ${
                      year.profit >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                    }`}
                  >
                    {formatCurrency(year.profit)}
                  </td>
                  <td
                    className={`text-right p-4 ${
                      year.profitability >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                    }`}
                  >
                    {formatPercent(year.profitability)}
                  </td>
                  {data.some((d) => d.inventory !== undefined) && (
                    <td className="text-right p-4 text-[#1a1a1a]">
                      {formatCurrency(year.inventory)}
                    </td>
                  )}
                </tr>
              ))}
              {/* 월별 상세 데이터 */}
              {Object.entries(groupedByYear).map(([year, items]) =>
                items.map((item, index) => (
                  <tr
                    key={`${item.period}-${index}`}
                    className={`border-b border-gray-200 hover:bg-[#eff6ff] transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-700">
                      {item.period.includes("-") ? item.period : `${item.period}년`}
                    </td>
                    <td className="text-right p-4 text-gray-700">{formatCurrency(item.revenue)}</td>
                    {data.some((d) => d.channels && d.channels.length > 0) && (
                      <td className="text-center p-4">
                        {item.channels && item.channels.length > 0 ? (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {item.channels.map((channel, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setSelectedChannel({
                                    period: item.period,
                                    channelName: channel.name,
                                    currentRevenue: channel.revenue,
                                    currentActualSales: channel.actualSales,
                                  })
                                }
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-colors cursor-pointer"
                                title="클릭하여 실판매액 입력"
                              >
                                {channel.name}
                                <br />
                                <span className="text-[10px]">
                                  {formatCurrency(channel.actualSales || channel.revenue)}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="text-right p-4 text-gray-700">{formatCurrency(item.cost)}</td>
                    <td
                      className={`text-right p-4 font-medium ${
                        item.profit >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                      }`}
                    >
                      {formatCurrency(item.profit)}
                    </td>
                    <td
                      className={`text-right p-4 font-medium ${
                        item.profitability >= 0 ? "text-[#1e3a8a]" : "text-[#dc2626]"
                      }`}
                    >
                      {formatPercent(item.profitability)}
                    </td>
                    {data.some((d) => d.inventory !== undefined) && (
                      <td className="text-right p-4 text-gray-700">
                        {item.inventory ? formatCurrency(item.inventory) : "-"}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      {selectedChannel && (
        <ChannelInputModal
          period={selectedChannel.period}
          channelName={selectedChannel.channelName}
          currentRevenue={selectedChannel.currentRevenue}
          currentActualSales={selectedChannel.currentActualSales}
          onSave={(period, channelName, actualSales) => {
            if (onChannelUpdate) {
              onChannelUpdate(period, channelName, actualSales);
            }
            setSelectedChannel(null);
          }}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </Card>
  );
}

