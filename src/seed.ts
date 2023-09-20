import { faker } from '@faker-js/faker';

import { SoldTicketMetric } from "./domain";
import { Injector } from '@sailplane/injector';
import { MetricsRepository } from './infra/MetricsRepository';
import { Logger } from '@sailplane/logger';
import { NUMBER_OF_METRICS, START_DATE } from './constants';

const repo = Injector.get(MetricsRepository)!
const logger = new Logger('Seed')

const createSoldTicketMetric = (date: Date): SoldTicketMetric => {
  return {
    eventId: faker.helpers.arrayElement(["testId0"]),
    value: faker.number.int({
      max: 10
    }),
    ranAt: date,
  }
}

const metrics = NUMBER_OF_METRICS.map((_, index) => {
  START_DATE.setMinutes(START_DATE.getMinutes() + 1)
  return createSoldTicketMetric(new Date(START_DATE))
})

repo.batchInsertSoldTicketMetrics(metrics)
  .then(() => logger.info('Done!'))
  .catch((err) => logger.error('Error in seed', err))
