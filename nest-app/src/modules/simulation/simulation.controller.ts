import { Controller, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationInputDto } from './dto/simulation-input.dto';

@Controller('api/simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  async runSimulation(@Body() input: SimulationInputDto) {
    return this.simulationService.runSimulation(input);
  }
}

