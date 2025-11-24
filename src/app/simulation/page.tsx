"use client";

import { useState, useEffect } from "react";
import { RevenueInputCard } from "@/components/simulation/RevenueInputCard";
import { PurchaseOrderInputCard } from "@/components/simulation/PurchaseOrderInputCard";
import { MarkupInputCard } from "@/components/simulation/MarkupInputCard";
import { AdvertisingInputCard } from "@/components/simulation/AdvertisingInputCard";
import { PersonnelInputCard } from "@/components/simulation/PersonnelInputCard";
import { getHistoricalData } from "@/lib/api";
import { IncomeStatement, IncomeStatementData } from "@/components/dashboard/IncomeStatement";
import { SummaryIncomeStatement, SummaryIncomeStatementData } from "@/components/dashboard/SummaryIncomeStatement";
import { KPICards } from "@/components/dashboard/KPICards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CostChart } from "@/components/dashboard/CostChart";
import { ComparisonTable } from "@/components/dashboard/ComparisonTable";
import { AIAnalysisCard } from "@/components/dashboard/AIAnalysisCard";
import { SimulationComparison } from "@/components/simulation/SimulationComparison";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 25년 11-12월, 26년 1-12월, 27년 1-12월 생성
function generatePeriods(): string[] {
  const periods: string[] = [];
  
  // 2025년 11-12월
  for (let month = 11; month <= 12; month++) {
    periods.push(`2025-${String(month).padStart(2, "0")}`);
  }
  
  // 2026년 1-12월
  for (let month = 1; month <= 12; month++) {
    periods.push(`2026-${String(month).padStart(2, "0")}`);
  }
  
  // 2027년 1-12월
  for (let month = 1; month <= 12; month++) {
    periods.push(`2027-${String(month).padStart(2, "0")}`);
  }
  
  return periods;
}

export default function SimulationPage() {
  const periods = generatePeriods();
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<IncomeStatementData[]>([]);
  const [futureData, setFutureData] = useState<IncomeStatementData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [simulationName, setSimulationName] = useState("");
  
  // 각 카드별 데이터 상태
  const [revenueData, setRevenueData] = useState<Record<string, number>>({});
  const [purchaseOrderData, setPurchaseOrderData] = useState<Record<string, number>>({});
  const [markupData, setMarkupData] = useState<Record<string, number>>({});
  const [advertisingData, setAdvertisingData] = useState<Record<string, number>>({});
  const [personnelData, setPersonnelData] = useState<Record<string, number>>({});

  // 과거 데이터 로드 (23-25년)
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const data = await getHistoricalData();
        // IncomeStatementData 형식으로 변환
        const formattedData: IncomeStatementData[] = data.map((item: any) => {
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
      }
    };
    loadHistoricalData();
  }, []);

  const handleSimulate = () => {
    setIsLoading(true);
    setError(null);

    try {
      // 각 카드의 데이터를 기반으로 IncomeStatementData 생성
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
      
      const formattedData: IncomeStatementData[] = periods.map((period) => {
        const revenue = revenueData[period] || 0;
        const purchaseOrder = purchaseOrderData[period] || 0;
        const markup = markupData[period] || 0;
        const advertising = advertisingData[period] || 0;
        
        // 마크업을 기반으로 비용 계산 (매출 / (1 + 마크업/100))
        const cost = markup > 0 ? revenue / (1 + markup / 100) : revenue * 0.7;
        
        // 채널별 매출 분배
        const channels = channelNames.map((name, idx) => ({
          name,
          revenue: Math.round(revenue * channelRatios[idx]),
        }));
        
        return {
          period,
          revenue,
          cost,
          profit: revenue - cost,
          profitability: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
          inventory: purchaseOrder * 0.8, // 발주금액의 80%를 재고로 가정
          channels,
        };
      });
      
      setFutureData(formattedData);
      // 시뮬레이션 실행 후 저장 다이얼로그 표시
      setShowSaveDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "시뮬레이션 실행에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSimulation = () => {
    if (!simulationName.trim()) {
      alert("시뮬레이션 이름을 입력해주세요.");
      return;
    }

    const summaryData = convertToSummaryFormat(futureData);
    const savedSimulations = JSON.parse(localStorage.getItem("savedSimulations") || "[]");
    const newSimulation = {
      id: `sim-${Date.now()}`,
      name: simulationName.trim(),
      data: summaryData,
      createdAt: new Date().toISOString(),
    };
    savedSimulations.push(newSimulation);
    localStorage.setItem("savedSimulations", JSON.stringify(savedSimulations));
    
    setSimulationName("");
    setShowSaveDialog(false);
    alert("시뮬레이션이 저장되었습니다.");
  };

  // IncomeStatementData를 SummaryIncomeStatementData로 변환
  function convertToSummaryFormat(data: IncomeStatementData[]): SummaryIncomeStatementData[] {
    return data.map((item) => {
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

  // 전체 데이터 합치기 (과거 + 미래)
  const allData = [...historicalData, ...futureData];
  
  // SummaryIncomeStatement를 위한 데이터 변환
  const summaryAllData = convertToSummaryFormat(allData);

  // 최종 기간의 데이터로 KPI 계산
  const finalData = allData.length > 0 ? allData[allData.length - 1] : null;
  const finalRevenue = finalData?.revenue || 0;
  const finalCost = finalData?.cost || 0;
  const finalProfit = finalData?.profit || 0;
  const finalProfitability = finalData?.profitability || 0;

  // 차트용 데이터 생성
  const chartData = allData.map((item) => ({
    period: item.period,
    value: item.revenue,
  }));

  const costChartData = allData.map((item) => ({
    period: item.period,
    value: item.cost,
  }));

  // 비교 테이블용 데이터 생성 (연도별)
  const comparisonData = allData
    .filter((item) => item && item.period) // period가 있는 항목만 필터링
    .reduce((acc, item) => {
      const year = item.period.split("-")[0];
      const existing = acc.find((d) => d.period === year);
      if (existing) {
        existing.revenue += item.revenue || 0;
        existing.cost += item.cost || 0;
        existing.profit += item.profit || 0;
      } else {
        acc.push({
          period: year,
          revenue: item.revenue || 0,
          cost: item.cost || 0,
          profit: item.profit || 0,
          profitability: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
        });
      }
      return acc;
    }, [] as Array<{ period: string; revenue: number; cost: number; profit: number; profitability: number }>);

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
            <span className="px-4 py-1.5 bg-[#1e3a8a] text-white rounded text-xs font-semibold tracking-wide uppercase">
              시뮬레이션
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#1a1a1a] tracking-tight">
            사업계획 시뮬레이션
          </h1>
          <p className="text-base text-gray-600 mb-4">(기준연월 : 실적 202301-202510, 계획 202511-202712)</p>
        </div>

        {/* 미래 데이터 입력 폼 */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">계획입력</h2>
            <Button
              onClick={handleSimulate}
              disabled={isLoading}
              size="lg"
              className="min-w-[200px] bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  실행 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  시뮬레이션 실행
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <RevenueInputCard
              periods={periods}
              onDataChange={(period, value) => {
                setRevenueData((prev) => ({ ...prev, [period]: value }));
              }}
              initialData={revenueData}
            />
            <PurchaseOrderInputCard
              periods={periods}
              onDataChange={(period, value) => {
                setPurchaseOrderData((prev) => ({ ...prev, [period]: value }));
              }}
              initialData={purchaseOrderData}
            />
            <MarkupInputCard
              periods={periods}
              onDataChange={(period, value) => {
                setMarkupData((prev) => ({ ...prev, [period]: value }));
              }}
              initialData={markupData}
            />
            <AdvertisingInputCard
              periods={periods}
              onDataChange={(period, value) => {
                setAdvertisingData((prev) => ({ ...prev, [period]: value }));
              }}
              initialData={advertisingData}
            />
            <PersonnelInputCard
              periods={periods}
              onDataChange={(period, value) => {
                setPersonnelData((prev) => ({ ...prev, [period]: value }));
              }}
              initialData={personnelData}
            />
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-[#dc2626] rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[#dc2626] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* 과거 데이터 요약 손익계산서 및 AI 분석 */}
        {historicalData.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SummaryIncomeStatement
                  data={convertToSummaryFormat(historicalData)}
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

        {/* 시뮬레이션 비교 */}
        <div className="mb-10">
          <SimulationComparison historicalData={convertToSummaryFormat(historicalData)} />
        </div>

        {/* 저장 다이얼로그 */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-[#1a1a1a]">시뮬레이션 저장</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시뮬레이션 이름
                </label>
                <input
                  type="text"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder="예: 시뮬레이션 A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveSimulation();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSimulationName("");
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSaveSimulation}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
