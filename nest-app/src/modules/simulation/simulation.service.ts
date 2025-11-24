import { Injectable } from '@nestjs/common';
import { SimulationInputDto } from './dto/simulation-input.dto';

export interface SimulationResult {
  revenue: Array<{ period: string; value: number }>;
  cost: Array<{ period: string; value: number }>;
  inventory: Array<{ period: string; value: number }>;
  profit: Array<{ period: string; value: number }>;
  profitability: Array<{ period: string; value: number }>;
}

@Injectable()
export class SimulationService {
  private readonly SCENARIO_MULTIPLIERS = {
    conservative: 0.9,
    neutral: 1.0,
    aggressive: 1.1,
  };

  /**
   * 시뮬레이션 실행
   */
  async runSimulation(input: SimulationInputDto): Promise<SimulationResult> {
    const periods = this.generatePeriods(input.years);
    
    const revenue = this.calculateMetric(
      input.revenue?.baseValue || 0,
      input.revenue?.growthRate || 0,
      input.revenue?.scenario || 'neutral',
      periods,
    );
    
    const cost = this.calculateMetric(
      input.cost?.baseValue || 0,
      input.cost?.growthRate || 0,
      input.cost?.scenario || 'neutral',
      periods,
    );
    
    const inventory = this.calculateMetric(
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
   * 기간 생성 (월별)
   */
  private generatePeriods(years: number): string[] {
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
  private calculateMetric(
    baseValue: number,
    growthRate: number,
    scenario: 'conservative' | 'neutral' | 'aggressive',
    periods: string[],
  ): Array<{ period: string; value: number }> {
    const multiplier = this.SCENARIO_MULTIPLIERS[scenario];
    const adjustedBaseValue = baseValue * multiplier;
    
    return periods.map((period, index) => {
      const monthlyGrowthRate = growthRate / 12 / 100; // 연 성장률을 월 성장률로 변환
      const value = adjustedBaseValue * Math.pow(1 + monthlyGrowthRate, index);
      return { period, value: Math.round(value) };
    });
  }
}

