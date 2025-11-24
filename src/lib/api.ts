// 시뮬레이션 계산 유틸리티 (프론트엔드에서 직접 계산)

import { applyGrowthRate, applyScenario, SCENARIO_MULTIPLIERS } from './simulation';

export interface SimulationInput {
  // 매출 관련
  revenue?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  // 비용 관련
  cost?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  // 재고 관련
  inventory?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  // 기간
  years: number;
}

export interface SimulationResult {
  revenue: Array<{ period: string; value: number }>;
  cost: Array<{ period: string; value: number }>;
  inventory: Array<{ period: string; value: number }>;
  profit: Array<{ period: string; value: number }>;
  profitability: Array<{ period: string; value: number }>;
}

/**
 * 기간 생성 (월별)
 */
function generatePeriods(years: number): string[] {
  const periods: string[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 1); // 다음 달부터 시작
  
  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date(startDate);
      date.setFullYear(startDate.getFullYear() + year);
      date.setMonth(startDate.getMonth() + month);
      periods.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      );
    }
  }
  
  return periods;
}

/**
 * 지표 계산 (성장률 및 시나리오 적용)
 */
function calculateMetric(
  baseValue: number,
  growthRate: number,
  scenario: 'conservative' | 'neutral' | 'aggressive',
  periods: string[],
): Array<{ period: string; value: number }> {
  const multiplier = SCENARIO_MULTIPLIERS[scenario];
  const adjustedBaseValue = baseValue * multiplier;
  
  return periods.map((period, index) => {
    const monthlyGrowthRate = growthRate / 12 / 100; // 연 성장률을 월 성장률로 변환
    const value = adjustedBaseValue * Math.pow(1 + monthlyGrowthRate, index);
    return { period, value: Math.round(value) };
  });
}

/**
 * 시뮬레이션 실행 (프론트엔드에서 직접 계산)
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  const periods = generatePeriods(input.years);
  
  const revenue = calculateMetric(
    input.revenue?.baseValue || 0,
    input.revenue?.growthRate || 0,
    input.revenue?.scenario || 'neutral',
    periods,
  );
  
  const cost = calculateMetric(
    input.cost?.baseValue || 0,
    input.cost?.growthRate || 0,
    input.cost?.scenario || 'neutral',
    periods,
  );
  
  const inventory = calculateMetric(
    input.inventory?.baseValue || 0,
    input.inventory?.growthRate || 0,
    input.inventory?.scenario || 'neutral',
    periods,
  );
  
  // 수익 및 수익성 계산
  const profit = revenue.map((r, i) => ({
    period: r.period,
    value: r.value - cost[i].value,
  }));
  
  const profitability = revenue.map((r, i) => ({
    period: r.period,
    value: r.value > 0 ? (profit[i].value / r.value) * 100 : 0,
  }));

  return {
    revenue,
    cost,
    inventory,
    profit,
    profitability,
  };
}

/**
 * 과거 데이터 조회 (public 폴더에서 직접 로드)
 */
export async function getHistoricalData(): Promise<any> {
  try {
    const response = await fetch('/data/processed/historical_data.json');
    if (!response.ok) {
      // 파일이 없으면 예시 데이터 반환 (23-25년)
      return generateSampleHistoricalData();
    }
    const fileData = await response.json();
    
    // 파일 데이터가 있고 2023년 이후 데이터가 있는지 확인
    const hasRecentData = fileData.some((item: any) => {
      const period = item.period || item.PERIOD || '';
      const year = parseInt(period.split('-')[0]);
      return year >= 2023;
    });
    
    // 2023년 이후 데이터가 없으면 예시 데이터 반환
    if (!hasRecentData || fileData.length === 0) {
      console.warn('2023년 이후 데이터가 없어 예시 데이터를 생성합니다.');
      return generateSampleHistoricalData();
    }
    
    return fileData;
  } catch (error) {
    console.warn('과거 데이터를 불러올 수 없습니다:', error);
    return generateSampleHistoricalData();
  }
}

/**
 * 예시 과거 데이터 생성 (23-25년) - 채널별 데이터 포함
 */
function generateSampleHistoricalData(): Array<{
  period: string;
  revenue: number;
  cost: number;
  inventory: number;
  channels?: Array<{
    name: string;
    revenue: number;
    actualSales?: number; // 실판매액 (입력 가능)
  }>;
}> {
  // 채널 목록 (이미지 기반)
  const channels = [
    "백화점",
    "면세점",
    "직영(가두)",
    "온라인(직)",
    "온라인(제휴)",
    "아웃렛(직)",
    "기타",
  ];
  
  const data: Array<{
    period: string;
    revenue: number;
    cost: number;
    inventory: number;
    channels?: Array<{ name: string; revenue: number; actualSales?: number }>;
  }> = [];
  
  // 2023년 1월부터 2027년 12월까지
  for (let year = 2023; year <= 2027; year++) {
    const endMonth = 12; // 모든 연도 12월까지
    
    for (let month = 1; month <= endMonth; month++) {
          const period = `${year}-${String(month).padStart(2, '0')}`;
          // 예시 데이터: 매출은 점진적으로 증가, 비용은 매출의 60-70%
          const baseRevenue = 
            year === 2023 ? 800000000 : 
            year === 2024 ? 1000000000 : 
            year === 2025 ? 1200000000 :
            year === 2026 ? 1400000000 :
            1600000000; // 2027년
          const monthlyVariation = 0.9 + Math.random() * 0.2; // 90-110% 변동
          const revenue = Math.round(baseRevenue * monthlyVariation);
          const cost = Math.round(revenue * (0.6 + Math.random() * 0.1)); // 60-70%
          const inventory = Math.round(revenue * (0.4 + Math.random() * 0.1)); // 40-50%
      
      // 채널별 매출 분배 (이미지 기반 비율)
      const channelRatios = [
        0.05, // 백화점
        0.08, // 면세점
        0.15, // 직영(가두)
        0.35, // 온라인(직)
        0.25, // 온라인(제휴)
        0.10, // 아웃렛(직)
        0.02, // 기타
      ];
      
      const channelData = channels.map((name, idx) => ({
        name,
        revenue: Math.round(revenue * channelRatios[idx]),
      }));
      
      data.push({ period, revenue, cost, inventory, channels: channelData });
    }
  }
  
  return data;
}
