export class SimulationInputDto {
  revenue?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  
  cost?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  
  inventory?: {
    baseValue: number;
    growthRate?: number;
    scenario?: 'conservative' | 'neutral' | 'aggressive';
  };
  
  years: number;
}

