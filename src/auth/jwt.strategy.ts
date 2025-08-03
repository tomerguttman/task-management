import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { Payload } from './jwt-payload.interface';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../helpers/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private configService: ConfigService, // Inject ConfigService if you want to use environment variables
  ) {
    super({
      secretOrKey: configService.get(ENV.JWT_SECRET),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: Payload): Promise<User> {
    const { username, userId } = payload;
    const user: User = await this.usersRepository.findOne({
      where: { username, id: userId },
    });

    if (!user) throw new UnauthorizedException();

    return user; // Attach the user to the request object on successful validation
  }
}
