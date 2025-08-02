import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: 'top_secret_51', // Replace it with your actual secret
      signOptions: {
        expiresIn: 3600, // Token expiration time in seconds
      },
    }),
    TypeOrmModule.forFeature([UsersRepository]),
  ],
  providers: [AuthService, JwtStrategy], // Registering the JwtStrategy
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule], // Exporting JwtStrategy and PassportModule for use in other modules
})
export class AuthModule {}
