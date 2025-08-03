import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import { ProducerService } from '../kafka/producer.service';
import { ConsumerService } from '../kafka/consumer.service';
import { EachMessagePayload } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../helpers/constants';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
    private producerService: ProducerService,
    private consumerService: ConsumerService,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.consumerService.consume(
      [this.configService.get(ENV.KAFKA_TASKS_TOPIC)],
      {
        autoCommit: true,
        eachMessage: async ({
          message,
          topic,
          partition,
        }: EachMessagePayload): Promise<void> => {
          const task: Task = JSON.parse(message.value.toString());

          console.log({
            msg: `Received task from Kafka topic ${topic}, partition ${partition}: ${task.id} - ${task.title}`,
          });
        },
      },
    );
  }

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: { id, user },
    });

    if (!found) {
      throw new NotFoundException(`Task ID '${id}' was not found`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, _user: User): Promise<Task> {
    const task: Task = await this.tasksRepository.createTask(
      createTaskDto,
      _user,
    );
    const { user, ..._task } = task;

    await this.sendTaskToKafka(_task as Task);

    return task;
  }

  async sendTaskToKafka(
    task: Task,
    topic: string = this.configService.get(ENV.KAFKA_TASKS_TOPIC),
  ): Promise<void> {
    try {
      await this.producerService.produceMessage(topic, {
        key: task.id,
        value: JSON.stringify(task),
      });
    } catch (e) {}
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({
      id,
      user,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Task ID '${id}' was not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
