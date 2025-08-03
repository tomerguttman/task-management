import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, ConsumerRunConfig, Kafka } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../helpers/constants';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private logger: Logger = new Logger(ConsumerService.name);
  private readonly kafka: Kafka = new Kafka({
    clientId: this.configService.get(ENV.KAFKA_CLIENT_ID),
    brokers: [this.configService.get(ENV.KAFKA_ADDRESS)],
  });
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async consume(
    topics: string[],
    configuration: ConsumerRunConfig,
  ): Promise<void> {
    const groupId = this.configService.get(ENV.KAFKA_GROUP_ID);
    const consumer: Consumer = this.kafka.consumer({
      groupId,
    });

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: true });
    await consumer.run(configuration);

    this.consumers.push(consumer);
    this.logger.log(
      `Consumer for topics ${topics.join(
        ', ',
      )} started with group ID ${groupId}`,
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
