import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { ENV } from '../helpers/constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private logger: Logger = new Logger(ProducerService.name);
  private readonly kafka: Kafka = new Kafka({
    clientId: this.configService.get(ENV.KAFKA_CLIENT_ID),
    brokers: [this.configService.get(ENV.KAFKA_ADDRESS)],
  });
  private readonly producer: Producer = this.kafka.producer();

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async produceMessage(
    topic: string,
    message: {
      key?: string;
      value: string;
      headers?: Record<string, string>;
    },
  ): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}:`, error);
    }
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log(`Disconnecting producer due to ${signal}`);

    await this.producer.disconnect();
  }
}
