"use client";

import { useState, useEffect } from "react";
import { getHistoricalData } from "@/lib/api";
import { IncomeStatementData } from "@/components/dashboard/IncomeStatement";
import { SummaryIncomeStatement, SummaryIncomeStatementData } from "@/components/dashboard/SummaryIncomeStatement";
import { AIAnalysisCard } from "@/components/dashboard/AIAnalysisCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<IncomeStatementData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 과거 데이터 로드 (2023년 1월 ~ 2025년 10월)
  useEffect(() => {
    const loadHistoricalData = async () => {
      setIsLoading(true);
      try {
        const data = await getHistoricalData();
        // IncomeStatementData 형식으로 변환 및 2025년 10월까지 필터링
        const formattedData: IncomeStatementData[] = data
          .filter((item: any) => {
            const period = item.period || item.PERIOD;
            if (!period) return false;
            // 2025-10까지만 포함 (2025-11, 2025-12 제외)
            return period <= "2025-10";
          })
          .map((item: any) => {
            // 채널 데이터가 없으면 생성
            let channels = item.channels || item.CHANNELS;
            if (!channels && (item.revenue || item.REVENUE)) {
              const revenue = item.revenue || item.REVENUE || 0;
              const channelNames = [
                "백화점",
                "면세점",
                "직영(가두)",
                "온라인(직)",
                "온라인(제휴)",
                "아웃렛(직)",
                "기타",
              ];
              const channelRatios = [0.05, 0.08, 0.15, 0.35, 0.25, 0.10, 0.02];
              channels = channelNames.map((name, idx) => ({
                name,
                revenue: Math.round(revenue * channelRatios[idx]),
              }));
            }
            
            return {
              period: item.period || item.PERIOD,
              revenue: item.revenue || item.REVENUE || 0,
              cost: item.cost || item.COST || 0,
              profit: (item.revenue || item.REVENUE || 0) - (item.cost || item.COST || 0),
              profitability: (item.revenue || item.REVENUE) > 0 ? (((item.revenue || item.REVENUE || 0) - (item.cost || item.COST || 0)) / (item.revenue || item.REVENUE || 0)) * 100 : 0,
              inventory: item.inventory || item.INVENTORY,
              channels: channels,
            };
          });
        setHistoricalData(formattedData);
      } catch (err) {
        console.error("과거 데이터 로드 실패:", err);
        setError("과거 데이터를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadHistoricalData();
  }, []);

  // IncomeStatementData를 SummaryIncomeStatementData로 변환 (2025년 10월까지만)
  function convertToSummaryFormat(data: IncomeStatementData[]): SummaryIncomeStatementData[] {
    return data
      .filter((item) => {
        const period = item.period;
        if (!period) return false;
        // 2025-10까지만 포함
        return period <= "2025-10";
      })
      .map((item) => {
      // 채널 데이터 변환
      const channels = item.channels?.map((ch) => ({
        name: ch.name,
        salesTag: ch.revenue * 1.1, // 판매TAG는 매출의 110% 가정
        actualSales: ch.actualSales || ch.revenue,
        shipmentPrice: (ch.actualSales || ch.revenue) * 0.9, // 출고가는 실판가의 90% 가정
      }));

      const totalSalesTag = channels?.reduce((sum, ch) => sum + ch.salesTag, 0) || item.revenue * 1.1;
      const totalActualSales = channels?.reduce((sum, ch) => sum + ch.actualSales, 0) || item.revenue;
      const totalShipmentPrice = channels?.reduce((sum, ch) => sum + ch.shipmentPrice, 0) || item.revenue * 0.9;

      return {
        period: item.period,
        endingInventory: item.inventory || 0,
        purchaseOrder: item.revenue * 1.2, // 발주금액은 매출의 120% 가정
        totalSalesTag,
        totalActualSales,
        totalShipmentPrice,
        salesLessVAT: totalShipmentPrice / 1.1, // 부가세 제외
        cogs: item.cost * 0.7, // 매출원가는 비용의 70% 가정
        grossProfit: totalShipmentPrice / 1.1 - item.cost * 0.7,
        directCosts: item.cost * 0.2, // 직접비는 비용의 20% 가정
        directProfit: totalShipmentPrice / 1.1 - item.cost * 0.9,
        advertisingExpense: item.revenue * 0.15, // 광고선전비는 매출의 15% 가정
        personnelExpense: item.revenue * 0.1, // 인건비는 매출의 10% 가정
        otherOperatingExpense: item.revenue * 0.05, // 기타영업비는 매출의 5% 가정
        ownLeaseFee: item.revenue * 0.03, // 자가임차료는 매출의 3% 가정
        commonCostAllocation: item.revenue * 0.02, // 공통비 배부는 매출의 2% 가정
        totalOperatingExpense:
          item.revenue * 0.15 +
          item.revenue * 0.1 +
          item.revenue * 0.05 +
          item.revenue * 0.03 +
          item.revenue * 0.02,
        operatingProfit:
          totalShipmentPrice / 1.1 -
          item.cost * 0.7 -
          item.revenue * 0.15 -
          item.revenue * 0.1 -
          item.revenue * 0.05 -
          item.revenue * 0.03 -
          item.revenue * 0.02,
        channels,
      };
    });
  }

  const summaryHistoricalData = convertToSummaryFormat(historicalData);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/">
            <Button variant="ghost" className="mb-6 hover:bg-gray-100 text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              홈으로
            </Button>
          </Link>
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 bg-gradient-to-r from-[#C97D60] to-[#8B6F47] text-white rounded text-xs font-semibold tracking-wide uppercase">
              과거 데이터 분석
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#1a1a1a] tracking-tight">
            과거 데이터 분석
          </h1>
          <p className="text-base text-gray-600 mb-4">(기준연월 : 실적 202301-202510)</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <svg className="animate-spin h-12 w-12 mx-auto text-[#C97D60]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-[#dc2626] rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#dc2626] mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* 과거 데이터 요약 손익계산서 및 AI 분석 */}
            {historicalData.length > 0 && (
              <div className="mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SummaryIncomeStatement
                      data={summaryHistoricalData.filter((item) => {
                        const year = item.period.split("-")[0];
                        return parseInt(year) <= 2025;
                      })}
                      title="요약 손익계산서"
                      readOnly={true}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <AIAnalysisCard data={historicalData} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

