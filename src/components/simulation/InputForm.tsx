"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { GrowthRateInput } from "./GrowthRateInput";
import { ScenarioSelector } from "./ScenarioSelector";

export interface SimulationFormData {
  revenue: {
    baseValue: number;
    growthRate?: number;
    scenario: "conservative" | "neutral" | "aggressive";
  };
  cost: {
    baseValue: number;
    growthRate?: number;
    scenario: "conservative" | "neutral" | "aggressive";
  };
  inventory: {
    baseValue: number;
    growthRate?: number;
    scenario: "conservative" | "neutral" | "aggressive";
  };
  years: number;
}

interface InputFormProps {
  onSubmit: (data: SimulationFormData) => void;
  isLoading?: boolean;
}

export function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [formData, setFormData] = useState<SimulationFormData>({
    revenue: {
      baseValue: 0,
      growthRate: 0,
      scenario: "neutral",
    },
    cost: {
      baseValue: 0,
      growthRate: 0,
      scenario: "neutral",
    },
    inventory: {
      baseValue: 0,
      growthRate: 0,
      scenario: "neutral",
    },
    years: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e3a8a] rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">매출 설정</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="revenue-base">기준 매출액 (원)</Label>
            <Input
              id="revenue-base"
              type="number"
              value={formData.revenue.baseValue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  revenue: {
                    ...formData.revenue,
                    baseValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              placeholder="예: 1000000000"
            />
          </div>
          <GrowthRateInput
            label="연간 성장률 (%)"
            value={formData.revenue.growthRate || 0}
            onChange={(value) =>
              setFormData({
                ...formData,
                revenue: { ...formData.revenue, growthRate: value },
              })
            }
          />
          <ScenarioSelector
            label="시나리오"
            value={formData.revenue.scenario}
            onChange={(value) =>
              setFormData({
                ...formData,
                revenue: { ...formData.revenue, scenario: value },
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-[#f5f5f5] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">비용 설정</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="cost-base">기준 비용 (원)</Label>
            <Input
              id="cost-base"
              type="number"
              value={formData.cost.baseValue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: {
                    ...formData.cost,
                    baseValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              placeholder="예: 600000000"
            />
          </div>
          <GrowthRateInput
            label="연간 성장률 (%)"
            value={formData.cost.growthRate || 0}
            onChange={(value) =>
              setFormData({
                ...formData,
                cost: { ...formData.cost, growthRate: value },
              })
            }
          />
          <ScenarioSelector
            label="시나리오"
            value={formData.cost.scenario}
            onChange={(value) =>
              setFormData({
                ...formData,
                cost: { ...formData.cost, scenario: value },
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-[#f5f5f0] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e3a8a] rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">재고 설정</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="inventory-base">기준 재고액 (원)</Label>
            <Input
              id="inventory-base"
              type="number"
              value={formData.inventory.baseValue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventory: {
                    ...formData.inventory,
                    baseValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              placeholder="예: 500000000"
            />
          </div>
          <GrowthRateInput
            label="연간 성장률 (%)"
            value={formData.inventory.growthRate || 0}
            onChange={(value) =>
              setFormData({
                ...formData,
                inventory: { ...formData.inventory, growthRate: value },
              })
            }
          />
          <ScenarioSelector
            label="시나리오"
            value={formData.inventory.scenario}
            onChange={(value) =>
              setFormData({
                ...formData,
                inventory: { ...formData.inventory, scenario: value },
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-[#eff6ff] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e3a8a] rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-[#1a1a1a]">기간 설정</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div>
            <Label htmlFor="years">시뮬레이션 기간 (년)</Label>
            <Select
              id="years"
              value={formData.years}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  years: parseInt(e.target.value) || 3,
                })
              }
            >
              <option value="1">1년</option>
              <option value="2">2년</option>
              <option value="3">3년</option>
              <option value="5">5년</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} size="lg" className="min-w-[200px]">
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

