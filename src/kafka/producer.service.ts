import { Injectable, OnModuleInit, OnApplicationShutdown } from "@nestjs/common";
import { Kafka, Producer } from 'kafkajs';
import { Logger } from '@nestjs/common';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private logger: Logger = new Logger(ProducerService.name);
  private readonly kafka: Kafka = new Kafka({
    clientId: "task-management-app",
    brokers: ["localhost:9092"],
  });
  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async produceMessage(topic: string, message: {
    key?: string; value: string; headers?: Record<string, string>
  }): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}:`, error);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.logger.log(`Disconnecting producer...`);

    await this.producer.disconnect();
  }
}
