import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, ConsumerRunConfig, Kafka } from 'kafkajs';
import { Logger } from '@nestjs/common';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private logger: Logger = new Logger(ConsumerService.name);
  private readonly kafka: Kafka = new Kafka({
    clientId: 'task-management-app',
    brokers: ['localhost:9092'],
  });
  private readonly consumers: Consumer[] = [];

  async consume(
    topic: string,
    configuration: ConsumerRunConfig,
  ): Promise<void> {
    const groupId = 'default-group';
    const consumer: Consumer = this.kafka.consumer({
      groupId,
    });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run(configuration);

    this.consumers.push(consumer);
    this.logger.log(
      `Consumer for topic ${topic} started with group ID ${groupId}`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    const disconnectPromises: Promise<void>[] = this.consumers.map(
      (consumer: Consumer): Promise<void> => {
        this.logger.log(`Disconnecting consumer...`);

        return consumer.disconnect();
      },
    );

    await Promise.all(disconnectPromises);
  }
}
