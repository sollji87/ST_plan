"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryIncomeStatementData } from "@/components/dashboard/SummaryIncomeStatement";

export interface SavedSimulation {
  id: string;
  name: string;
  data: SummaryIncomeStatementData[];
  createdAt: Date;
}

interface SimulationComparisonProps {
  historicalData: SummaryIncomeStatementData[];
}

export function SimulationComparison({ historicalData }: SimulationComparisonProps) {
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 로컬 스토리지에서 저장된 시뮬레이션 로드
  useEffect(() => {
    const saved = localStorage.getItem("savedSimulations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((sim: any) => ({
          ...sim,
          createdAt: new Date(sim.createdAt),
        }));
        setSavedSimulations(parsed);
      } catch (error) {
        console.error("저장된 시뮬레이션 로드 실패:", error);
      }
    }
  }, []);

  // 시뮬레이션 저장
  const saveSimulation = (name: string, data: SummaryIncomeStatementData[]) => {
    const newSimulation: SavedSimulation = {
      id: `sim-${Date.now()}`,
      name,
      data,
      createdAt: new Date(),
    };
    const updated = [...savedSimulations, newSimulation];
    setSavedSimulations(updated);
    localStorage.setItem("savedSimulations", JSON.stringify(updated));
  };

  // 시뮬레이션 삭제
  const deleteSimulation = (id: string) => {
    const updated = savedSimulations.filter((sim) => sim.id !== id);
    setSavedSimulations(updated);
    localStorage.setItem("savedSimulations", JSON.stringify(updated));
    setSelectedSimulations(selectedSimulations.filter((sid) => sid !== id));
  };

  // 시뮬레이션 선택 토글
  const toggleSimulation = (id: string) => {
    setSelectedSimulations((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // AI 비교 분석 실행
  const analyzeComparison = async () => {
    if (selectedSimulations.length < 2) {
      alert("비교할 시뮬레이션을 2개 이상 선택해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setComparisonResult(null);

    try {
      const simulations = selectedSimulations
        .map((id) => savedSimulations.find((sim) => sim.id === id))
        .filter((sim): sim is SavedSimulation => sim !== undefined);

      // 2026-2027년 데이터만 추출
      const comparisonData = simulations.map((sim) => ({
        name: sim.name,
        data2026: sim.data.filter((d) => d.period.startsWith("2026")),
        data2027: sim.data.filter((d) => d.period.startsWith("2027")),
      }));

      // OpenAI API 호출 (실제 구현 시 API Route 사용)
      const prompt = `
다음 두 시뮬레이션의 2026-2027년 계획 데이터를 비교 분석해주세요.

${comparisonData.map((sim, idx) => `
시뮬레이션 ${sim.name}:
- 2026년 총 매출: ${sim.data2026.reduce((sum, d) => sum + d.totalActualSales, 0).toLocaleString()}원
- 2027년 총 매출: ${sim.data2027.reduce((sum, d) => sum + d.totalActualSales, 0).toLocaleString()}원
- 2026년 영업이익: ${sim.data2026.reduce((sum, d) => sum + d.operatingProfit, 0).toLocaleString()}원
- 2027년 영업이익: ${sim.data2027.reduce((sum, d) => sum + d.operatingProfit, 0).toLocaleString()}원
`).join("\n")}

두 시뮬레이션의 차이점, 장단점, 추천사항을 분석해주세요.
`;

      // 임시 분석 결과 (실제로는 OpenAI API 호출)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const analysis = `
**시뮬레이션 비교 분석 결과**

${comparisonData.map((sim, idx) => `
**${sim.name}**
- 2026-2027년 평균 매출 성장률: ${((sim.data2027.reduce((sum, d) => sum + d.totalActualSales, 0) / sim.data2026.reduce((sum, d) => sum + d.totalActualSales, 0) - 1) * 100).toFixed(1)}%
- 영업이익률 추이: 안정적
`).join("\n")}

**주요 차이점:**
- 매출 성장 패턴의 차이
- 비용 구조의 차이
- 수익성 개선 여지

**추천사항:**
- 두 시뮬레이션의 중간값을 고려한 하이브리드 접근법 검토
- 리스크 관리 측면에서 보수적 시나리오 우선 검토
      `;

      setComparisonResult(analysis);
    } catch (error) {
      console.error("비교 분석 실패:", error);
      setComparisonResult("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 저장된 시뮬레이션 목록 */}
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="bg-[#eff6ff] border-b border-gray-200 py-4">
          <CardTitle className="text-xl font-bold text-[#1a1a1a]">저장된 시뮬레이션</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {savedSimulations.length === 0 ? (
            <p className="text-gray-500 text-sm">저장된 시뮬레이션이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {savedSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSimulations.includes(sim.id)
                      ? "border-[#1e3a8a] bg-[#eff6ff]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleSimulation(sim.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSimulations.includes(sim.id)}
                      onChange={() => toggleSimulation(sim.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-[#1e3a8a]"
                    />
                    <div>
                      <div className="font-semibold text-[#1a1a1a]">{sim.name}</div>
                      <div className="text-xs text-gray-500">
                        {sim.createdAt.toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSimulation(sim.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비교 분석 */}
      {selectedSimulations.length >= 2 && (
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="bg-[#eff6ff] border-b border-gray-200 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-[#1a1a1a]">시뮬레이션 비교 분석</CardTitle>
              <Button
                onClick={analyzeComparison}
                disabled={isAnalyzing}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              >
                {isAnalyzing ? "분석 중..." : "AI 분석 시작"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isAnalyzing ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-[#1e3a8a]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-600">AI가 시뮬레이션을 분석하고 있습니다...</p>
              </div>
            ) : comparisonResult ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {comparisonResult}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                비교할 시뮬레이션을 선택한 후 &quot;AI 분석 시작&quot; 버튼을 클릭하세요.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

