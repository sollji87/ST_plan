import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './modules/simulation/simulation.module';
import { DataModule } from './modules/data/data.module';

@Module({
  imports: [SimulationModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
