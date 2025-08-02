import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }

  async signin(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const { username, password } = createUserDto;
    const user: User = await this.usersRepository.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Please check your login credentials');

    const payload: Payload = {
      username: user.username,
      userId: user.id,
      iat: Date.now(), // issued at time
    };

    const accessToken: string = this.jwtService.sign(payload);

    return { accessToken };
  }
}
