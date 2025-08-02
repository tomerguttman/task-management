import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    try {
      const { username, password } = createUserDto;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = this.create({ username, password: hashedPassword });

      await this.save(newUser);
    } catch (e) {
      if (e.code === '23505')
        throw new ConflictException('Username already exists');

      throw e; // Re-throw the error if it's not a conflict
    }
  }
}
