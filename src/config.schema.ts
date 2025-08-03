import * as Joi from '@hapi/joi';

export const configSchema = Joi.object({
  STAGE: Joi.string().valid('dev', 'prod').required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_HOST: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  KAFKA_ADDRESS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_GROUP_ID: Joi.string().required(),
  KAFKA_TASKS_TOPIC: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),
});
