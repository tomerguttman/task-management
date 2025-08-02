import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column()
  password: string;

  @OneToMany((_type: any) => Task, (task: Task): any => task.user, {
    eager: true, // Eager loading to automatically load tasks when a user is fetched
  })
  tasks: Task[];
}
