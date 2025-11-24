// 프론트엔드 시뮬레이션 계산 유틸리티

export interface GrowthRate {
  year1?: number;
  year2?: number;
  year3?: number;
}

export interface ScenarioMultiplier {
  conservative: number;
  neutral: number;
  aggressive: number;
}

export const SCENARIO_MULTIPLIERS: ScenarioMultiplier = {
  conservative: 0.9,
  neutral: 1.0,
  aggressive: 1.1,
};

/**
 * 성장률을 적용하여 다음 값을 계산
 */
export function applyGrowthRate(
  baseValue: number,
  growthRate: number,
  period: number
): number {
  return baseValue * Math.pow(1 + growthRate / 100, period);
}

/**
 * 시나리오를 적용하여 값을 조정
 */
export function applyScenario(
  value: number,
  scenario: 'conservative' | 'neutral' | 'aggressive'
): number {
  return value * SCENARIO_MULTIPLIERS[scenario];
}

/**
 * 월별 데이터 생성 (간단한 선형 보간)
 */
export function generateMonthlyData(
  startValue: number,
  endValue: number,
  months: number
): number[] {
  const data: number[] = [];
  const increment = (endValue - startValue) / months;

  for (let i = 0; i <= months; i++) {
    data.push(startValue + increment * i);
  }

  return data;
}

