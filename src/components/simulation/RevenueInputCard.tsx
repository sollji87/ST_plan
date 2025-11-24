"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface RevenueInputCardProps {
  periods: string[];
  onDataChange: (period: string, value: number) => void;
  initialData?: Record<string, number>;
}

export function RevenueInputCard({ periods, onDataChange, initialData = {} }: RevenueInputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, number>>(initialData);

  const handleChange = (period: string, value: number) => {
    setData((prev) => ({ ...prev, [period]: value }));
    onDataChange(period, value);
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

  const years = Object.keys(groupedByYear).sort();

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleYearClick = (year: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedYear(selectedYear === year ? null : year);
  };

  return (
    <Card className="border border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
      <CardHeader className="bg-[#eff6ff] border-b border-gray-200 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#1a1a1a]">매출</CardTitle>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-6">
          {!selectedYear ? (
            <div className="grid grid-cols-3 gap-4">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={(e) => handleYearClick(year, e)}
                  className="p-4 border-2 border-[#1e3a8a] rounded-lg hover:bg-[#eff6ff] transition-colors text-center"
                >
                  <span className="text-sm font-semibold text-[#1e3a8a]">{year}년</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedYear(null);
                }}
                className="mb-4 text-sm text-[#1e3a8a] hover:underline"
              >
                ← 연도 선택으로 돌아가기
              </button>
              <div>
                <h3 className="font-semibold text-[#1e3a8a] mb-3">{selectedYear}년</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedByYear[selectedYear]?.map((period) => {
                    const month = parseInt(period.split("-")[1]);
                    const monthName = `${month}월`;
                    return (
                      <div key={period} className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Label htmlFor={`${period}-revenue`} className="text-sm text-gray-600">
                          {monthName}
                        </Label>
                        <Input
                          id={`${period}-revenue`}
                          type="number"
                          value={data[period] || ""}
                          onChange={(e) =>
                            handleChange(period, parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

