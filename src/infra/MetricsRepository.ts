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

  private createInsertQuery(metric: SoldTicketMetric): { query: string, params: Array<any>} {
    return {
      query: `INSERT INTO catalog.metrics (eventId, value, ranAt) VALUES (?, ?, ?)`,
      params: [metric.eventId, metric.value, metric.ranAt.getTime()]
    }
  }

  async insertSoldTicketMetric(metric: SoldTicketMetric) {
    const options = this.createInsertQuery(metric)
    const result = await this.client.execute(options.query, options.params, { prepare: true })
    logger.info("Result insert sold metrics", result)
    return result
  }

  async batchInsertSoldTicketMetrics(metrics: SoldTicketMetric[]) {
    const options = metrics.map((metric) => this.createInsertQuery(metric))
    const result = await this.client.batch(options, { prepare: true })
    logger.info("Result batch insert sold metrics", result)
    return result
  }

  async getSoldMetricsBetween(eventId: string, start: Date, end: Date) {
    const query = `
      SELECT * FROM catalog.metrics
      WHERE eventId = ?
      AND ranAt >= ? AND ranAt <= ?;
    `
    const params = [eventId, start.getTime(), end.getTime()]
    const result = await this.client.execute(query, params, { prepare: true })
    logger.info("Result get sold metrics", result.rows)
    return result
  }
}

const create = () => {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'catalog',
  })
  const repo = new MetricsRepository({ client })
  return repo
}

Injector.register(MetricsRepository, create)
