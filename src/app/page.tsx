"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricalDataAnalysis } from "@/components/dashboard/HistoricalDataAnalysis";
import { getHistoricalData } from "@/lib/api";
import { IncomeStatementData } from "@/components/dashboard/IncomeStatement";

export default function Home() {
  const [historicalData, setHistoricalData] = useState<IncomeStatementData[]>([]);

  // 과거 데이터 로드
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
      }
    };
    loadHistoricalData();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-6 py-2 bg-[#1e3a8a] text-white rounded-full text-sm font-semibold tracking-wide uppercase">
              SERGIO TACCHINI
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1a1a1a] tracking-tight">
            중장기 사업계획<br />네비게이터
          </h1>
        </div>

        {/* 과거 데이터 분석 및 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* 과거 데이터 분석 카드 */}
          {historicalData.length > 0 && (
            <HistoricalDataAnalysis data={historicalData} />
          )}
          
          {/* 시뮬레이션 시작 카드 */}
          <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded bg-[#1e3a8a] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-[#1a1a1a]">시뮬레이션 시작</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                매출, 비용, 재고, 수익성 지표를 입력하여 3년간의 사업계획을 시뮬레이션합니다.
                수치 직접 입력, 성장률 설정, 시나리오 선택 등 다양한 방식으로 입력할 수 있습니다.
              </p>
              <Link href="/simulation" className="mt-auto">
                <Button size="lg" className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white">
                  시뮬레이션 시작하기 →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 주요 기능 카드 */}
          <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded bg-foreground flex items-center justify-center">
                  <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground">주요 기능</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <ul className="space-y-3 text-gray-600 flex-1">
                <li className="flex items-start">
                  <span className="text-[#1e3a8a] mr-3 font-bold">•</span>
                  <span>매출/비용/재고 수치 직접 입력</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#1e3a8a] mr-3 font-bold">•</span>
                  <span>연간 성장률 설정</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#1e3a8a] mr-3 font-bold">•</span>
                  <span>시나리오 선택 (보수적/중립/공격적)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#1e3a8a] mr-3 font-bold">•</span>
                  <span>3년간 월별 예측 계산</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#1e3a8a] mr-3 font-bold">•</span>
                  <span>차트 및 테이블로 결과 시각화</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

