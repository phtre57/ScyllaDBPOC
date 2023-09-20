
import { Injector } from '@sailplane/injector';
import { Logger } from '@sailplane/logger';

import { MetricsRepository } from './infra/MetricsRepository';
import { START_DATE } from './constants';

const repo = Injector.get(MetricsRepository)!
const logger = new Logger('Seed')


repo.getSoldMetricsBetween("testId0", START_DATE, new Date())
  .then(() => {
    repo.shutdown()
      .then(() => logger.info('Done!'))
  })
  .catch((err) => logger.error('Error in seed', err))
