import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from '../helpers/constants';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    // registerAsync allows you to use async configuration for the JwtModule
    // This is useful for loading configuration from environment variables or other sources
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        secret: configService.get(ENV.JWT_SECRET), // Use environment variable for secret
        signOptions: {
          expiresIn: configService.get(ENV.JWT_EXPIRATION_TIME), // Token expiration time, can be adjusted as needed
        },
      }),
    }),
    TypeOrmModule.forFeature([UsersRepository]),
  ],
  providers: [AuthService, JwtStrategy], // Registering the JwtStrategy
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule], // Exporting JwtStrategy and PassportModule for use in other modules
})
export class AuthModule {}
