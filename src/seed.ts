import { faker } from '@faker-js/faker';

import { SoldTicketMetric } from "./domain";
import { Injector } from '@sailplane/injector';
import { MetricsRepository } from './infra/MetricsRepository';
import { Logger } from '@sailplane/logger';
import { NUMBER_OF_EVENTS, NUMBER_OF_METRICS, START_DATE, START_EVENT_ID } from './constants';

const repo = Injector.get(MetricsRepository)!
const logger = new Logger('Seed')

const createSoldTicketMetric = (eventId: string, date: Date): SoldTicketMetric => {
  return {
    eventId: eventId,
    value: faker.number.int({
      max: 10
    }),
    ranAt: date,
  }
}

const createEventMetrics = (eventId: string) => {
  return NUMBER_OF_METRICS.map((_, index) => {
    START_DATE.setMinutes(START_DATE.getMinutes() + 1)
    return createSoldTicketMetric(eventId, new Date(START_DATE))
  })
}

const metrics = NUMBER_OF_EVENTS.map((_, index) => {
  const eventId = START_EVENT_ID + index
  return createEventMetrics(`${eventId}`)
})

repo.batchInsertSoldTicketMetrics(metrics.flat())
  .then(() => {
    logger.error('Done!')
    repo.shutdown()
      .then(() => logger.info('Repo shutdown!'))
  })
  .catch((err) => {
    logger.error('Error in seed', err)
    repo.shutdown()
    .then(() => logger.info('Repo shutdown!'))
  })
