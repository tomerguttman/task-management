import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { TransformInterceptor } from './tasks/transform.interceptor';

process.on('unhandledRejection', (err: Error): void => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err: Error): void => {
  console.error('Uncaught Exception:', err);
});

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  const logger: Logger = app.get(Logger);

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(logger);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']); // Enable graceful shutdown, will disconnect clients

  await app.listen(3000);

  logger.log('Application is running on: http://localhost:3000');
}

bootstrap();
