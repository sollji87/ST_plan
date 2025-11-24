import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 (Next.js 프론트엔드와 통신하기 위해)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Nest.js 서버가 포트 ${process.env.PORT ?? 3001}에서 실행 중입니다.`);
}
bootstrap();
