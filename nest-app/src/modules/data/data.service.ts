import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  private readonly processedDataPath = path.join(
    process.cwd(),
    '..',
    'public',
    'data',
    'processed',
    'historical_data.json',
  );

  /**
   * 과거 데이터 조회
   */
  async getHistoricalData(): Promise<any> {
    try {
      const data = fs.readFileSync(this.processedDataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 빈 배열 반환
      console.warn('과거 데이터 파일을 찾을 수 없습니다:', this.processedDataPath);
      return [];
    }
  }
}

