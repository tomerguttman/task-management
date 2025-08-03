import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from './helpers/constants';
import { configSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`], // Load environment variables from .env file
      validationSchema: configSchema,
      isGlobal: true,
    }),
    TasksModule,
    LoggerModule.forRoot({
      pinoHttp: {
        redact: {
          paths: ['req.headers.authorization'], // Redact sensitive information like authorization headers
          censor: '******', // Replace redacted values with asterisks
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        type: 'postgres',
        host: configService.get(ENV.DB_HOST),
        port: configService.get(ENV.DB_PORT),
        username: configService.get(ENV.DB_USERNAME),
        password: configService.get(ENV.DB_PASSWORD),
        database: configService.get(ENV.DB_DATABASE),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
      }),
    }),
    AuthModule,
  ],
})
export class AppModule {}
