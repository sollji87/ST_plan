"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncomeStatementData } from "./IncomeStatement";

interface HistoricalDataAnalysisProps {
  data: IncomeStatementData[];
}

export function HistoricalDataAnalysis({ data }: HistoricalDataAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<{
    revenue?: string;
    profitability?: string;
    inventory?: string;
    channels?: string;
  }>({});

  // 데이터 요약 계산
  const calculateSummary = () => {
    if (data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const totalInventory = data.reduce((sum, item) => sum + (item.inventory || 0), 0);
    const avgProfitability = data.reduce((sum, item) => sum + item.profitability, 0) / data.length;
    
    // 채널별 매출 분석
    const channelRevenue: Record<string, number> = {};
    data.forEach((item) => {
      item.channels?.forEach((ch) => {
        channelRevenue[ch.name] = (channelRevenue[ch.name] || 0) + ch.revenue;
      });
    });

    const topChannels = Object.entries(channelRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    return {
      revenue: totalRevenue,
      cost: totalCost,
      inventory: totalInventory,
      profitability: avgProfitability,
      periods: data.length,
      topChannels,
      channelRevenue,
    };
  };

  const summary = calculateSummary();

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-[#C97D60] to-[#8B6F47] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1a1a1a]">과거 데이터 분석</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        {!summary ? (
          <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col">
            {!showAnalysis && (
              <>
                <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                  과거 매출, 수익성, 재고, 채널 데이터를 분석하여 사업 계획 수립에 활용할 수 있습니다.
                </p>
                <Link href="/analysis" className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-[#C97D60] to-[#8B6F47] hover:from-[#B86A4F] hover:to-[#7A5F3F] text-white"
                  >
                    과거 데이터 분석하기 →
                  </Button>
                </Link>
              </>
            )}

            {showAnalysis && (
              <>
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 mx-auto text-[#C97D60]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600 text-sm">분석 중...</p>
                  </div>
                ) : analysis.revenue ? (
                  <div className="space-y-4">
                    <div className="border-l-4 border-[#C97D60] pl-4 py-2">
                      <h4 className="font-semibold text-[#8B6F47] mb-1 text-sm">매출 분석</h4>
                      <p className="text-sm text-gray-700">{analysis.revenue}</p>
                    </div>

                    <div className="border-l-4 border-[#C97D60] pl-4 py-2">
                      <h4 className="font-semibold text-[#8B6F47] mb-1 text-sm">수익성 분석</h4>
                      <p className="text-sm text-gray-700">{analysis.profitability}</p>
                    </div>

                    <div className="border-l-4 border-[#C97D60] pl-4 py-2">
                      <h4 className="font-semibold text-[#8B6F47] mb-1 text-sm">재고 분석</h4>
                      <p className="text-sm text-gray-700">{analysis.inventory}</p>
                    </div>

                    <div className="border-l-4 border-[#C97D60] pl-4 py-2">
                      <h4 className="font-semibold text-[#8B6F47] mb-1 text-sm">채널 분석</h4>
                      <p className="text-sm text-gray-700">{analysis.channels}</p>
                    </div>

                    <Button
                      onClick={() => {
                        setShowAnalysis(false);
                        setAnalysis({});
                      }}
                      variant="outline"
                      className="w-full mt-4 border-[#8B6F47] text-[#8B6F47] hover:bg-[#F5E6D3]"
                    >
                      닫기
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

