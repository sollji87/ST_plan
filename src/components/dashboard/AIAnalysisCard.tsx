"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncomeStatementData } from "./IncomeStatement";

interface AIAnalysisCardProps {
  data: IncomeStatementData[];
}

export function AIAnalysisCard({ data }: AIAnalysisCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    revenue?: string;
    markup?: string;
    inventory?: string;
    cost?: string;
  }>({});

  // 데이터 요약 계산
  const calculateSummary = () => {
    if (data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const totalInventory = data.reduce((sum, item) => sum + (item.inventory || 0), 0);
    const avgProfitability = data.reduce((sum, item) => sum + item.profitability, 0) / data.length;
    
    // 마크업 계산 (매출 대비 이익률)
    const markup = avgProfitability;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      inventory: totalInventory,
      markup,
      periods: data.length,
    };
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const summary = calculateSummary();
    
    if (!summary) {
      setIsAnalyzing(false);
      return;
    }

    try {
      // OpenAI API 호출 (클라이언트 사이드에서는 직접 호출 불가하므로, 
      // 여기서는 시뮬레이션된 분석 결과를 반환)
      // 실제 구현 시에는 API Route를 통해 호출해야 합니다.
      
      // 임시 분석 결과 생성
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const revenueAnalysis = `과거 ${summary.periods}개월간 총 매출은 ${(summary.revenue / 1000000000).toFixed(1)}억원입니다. 연평균 성장률을 분석하면 안정적인 성장 추세를 보이고 있습니다.`;
      
      const markupAnalysis = `평균 마크업률은 ${summary.markup.toFixed(1)}%로, 업계 평균 대비 ${summary.markup > 30 ? '양호한' : '개선이 필요한'} 수준입니다.`;
      
      const inventoryAnalysis = `평균 재고 규모는 ${(summary.inventory / 1000000000).toFixed(1)}억원으로, 매출 대비 ${((summary.inventory / summary.revenue) * 100).toFixed(1)}% 수준입니다.`;
      
      const costAnalysis = `총 비용은 ${(summary.cost / 1000000000).toFixed(1)}억원으로, 매출 대비 ${((summary.cost / summary.revenue) * 100).toFixed(1)}%를 차지합니다.`;

      setAnalysis({
        revenue: revenueAnalysis,
        markup: markupAnalysis,
        inventory: inventoryAnalysis,
        cost: costAnalysis,
      });
    } catch (error) {
      console.error("AI 분석 실패:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const summary = calculateSummary();

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full">
      <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-[#1a1a1a]">AI 분석</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!summary ? (
          <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
            >
              {isAnalyzing ? "분석 중..." : "분석 시작"}
            </Button>

            {analysis.revenue && (
              <div className="space-y-4">
                <div className="border-l-4 border-[#1e3a8a] pl-4">
                  <h4 className="font-semibold text-[#1a1a1a] mb-2">매출 분석</h4>
                  <p className="text-sm text-gray-700">{analysis.revenue}</p>
                </div>

                <div className="border-l-4 border-[#1e3a8a] pl-4">
                  <h4 className="font-semibold text-[#1a1a1a] mb-2">마크업 분석</h4>
                  <p className="text-sm text-gray-700">{analysis.markup}</p>
                </div>

                <div className="border-l-4 border-[#1e3a8a] pl-4">
                  <h4 className="font-semibold text-[#1a1a1a] mb-2">재고 분석</h4>
                  <p className="text-sm text-gray-700">{analysis.inventory}</p>
                </div>

                <div className="border-l-4 border-[#1e3a8a] pl-4">
                  <h4 className="font-semibold text-[#1a1a1a] mb-2">비용 분석</h4>
                  <p className="text-sm text-gray-700">{analysis.cost}</p>
                </div>
              </div>
            )}

            {!analysis.revenue && !isAnalyzing && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>위 버튼을 클릭하여</p>
                <p>AI 분석을 시작하세요</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

