import { Controller, Get } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('api/data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('historical')
  async getHistoricalData() {
    return this.dataService.getHistoricalData();
  }
}

