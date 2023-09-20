import { Injector } from "@sailplane/injector";
import { Client } from "cassandra-driver";

import { SoldTicketMetric } from "../domain";
import { Logger } from "@sailplane/logger";

const logger = new Logger("MetricsRepository")

export class MetricsRepository {
  client: Client

  constructor({ client }: { client: Client }) {
    this.client = client
    this.client.connect()
  }

  private createInsertQuery(metric: SoldTicketMetric) {
    return `INSERT INTO metrics (eventId, value, ranAt) VALUES (${metric.eventId}, ${metric.value}, ${metric.ranAt.getTime()})`
  }

  async insertSoldTicketMetric(metric: SoldTicketMetric) {
    const query = this.createInsertQuery(metric)
    const result = await this.client.execute(query)
    logger.info("Result insert sold metrics", result)
    return result
  }

  async batchInsertSoldTicketMetrics(metrics: SoldTicketMetric[]) {
    const queries = metrics.map((metric) => this.createInsertQuery(metric))
    const result = await this.client.batch(queries)
    logger.info("Result batch insert sold metrics", result)
    return result
  }

  async getSoldMetricsBetween(start: Date, end: Date) {
    const query = `
      SELECT * FROM catalog.metrics
      WHERE ranAt >= ${start.getTime()} AND ranAt <= ${end.getTime()};
    `
    const result = await this.client.execute(query)
    logger.info("Result get sold metrics", result)
    return result
  }
}

const create = () => {
  const client = new Client({
    contactPoints: ['scylla'],
    localDataCenter: 'DC1',
    keyspace: 'catalog',
  })
  const repo = new MetricsRepository({ client })
  return repo
}

Injector.register(MetricsRepository, create)
