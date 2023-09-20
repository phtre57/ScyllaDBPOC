
import { Injector } from '@sailplane/injector';
import { Logger } from '@sailplane/logger';

import { MetricsRepository } from './infra/MetricsRepository';
import { START_DATE } from './constants';

const repo = Injector.get(MetricsRepository)!
const logger = new Logger('Seed')


repo.getSoldMetricsBetween("1", START_DATE, new Date())
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
