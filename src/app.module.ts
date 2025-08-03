import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    TasksModule,
    LoggerModule.forRoot({
      pinoHttp: {
        redact: {
          paths: ['req.headers.authorization'], // Redact sensitive information like authorization headers
          censor: '******', // Replace redacted values with asterisks
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'task-management',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    // KafkaModule - Removed since KafkaModule is not needed as an import
  ],
})
export class AppModule {}
