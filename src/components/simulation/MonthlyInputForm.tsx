"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface MonthlyInputData {
  period: string; // "2025-11", "2025-12", "2026-01" 등
  revenue: number;
  cost: number;
  inventory: number;
}

interface MonthlyInputFormProps {
  onSubmit: (data: MonthlyInputData[]) => void;
  isLoading?: boolean;
}

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

export function MonthlyInputForm({ onSubmit, isLoading = false }: MonthlyInputFormProps) {
  const periods = generatePeriods();
  
  const [formData, setFormData] = useState<Record<string, MonthlyInputData>>(() => {
    const initial: Record<string, MonthlyInputData> = {};
    periods.forEach((period) => {
      initial[period] = {
        period,
        revenue: 0,
        cost: 0,
        inventory: 0,
      };
    });
    return initial;
  });

  const handleChange = (period: string, field: keyof MonthlyInputData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = Object.values(formData);
    onSubmit(data);
  };

  // 연도별로 그룹화
  const groupedByYear = periods.reduce((acc, period) => {
    const year = period.split("-")[0];
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(period);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {Object.entries(groupedByYear).map(([year, yearPeriods]) => (
        <Card key={year} className="border border-gray-200 shadow-md">
          <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">{year}년</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yearPeriods.map((period) => {
                const month = parseInt(period.split("-")[1]);
                const monthName = `${month}월`;
                const data = formData[period];

                return (
                  <div
                    key={period}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#1e3a8a] mb-4 text-center">{monthName}</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`${period}-revenue`} className="text-sm text-gray-600">
                          매출 (원)
                        </Label>
                        <Input
                          id={`${period}-revenue`}
                          type="number"
                          value={data.revenue || ""}
                          onChange={(e) =>
                            handleChange(period, "revenue", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${period}-cost`} className="text-sm text-gray-600">
                          비용 (원)
                        </Label>
                        <Input
                          id={`${period}-cost`}
                          type="number"
                          value={data.cost || ""}
                          onChange={(e) =>
                            handleChange(period, "cost", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${period}-inventory`} className="text-sm text-gray-600">
                          재고 (원)
                        </Label>
                        <Input
                          id={`${period}-inventory`}
                          type="number"
                          value={data.inventory || ""}
                          onChange={(e) =>
                            handleChange(period, "inventory", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} size="lg" className="min-w-[200px] bg-[#1e3a8a] hover:bg-[#1e40af] text-white">
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
    </form>
  );
}

