import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    // Logic for user signup
    return this.authService.signup(createUserDto);
  }

  @Post('/signin')
  signin(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    // Logic for user signup
    return this.authService.signin(createUserDto);
  }
}
