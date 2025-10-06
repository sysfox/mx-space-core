import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '~/transformers/model.transformer'
import * as client from 'prom-client'
import { METRICS } from '~/app.config'
import { RedisService } from '../redis/redis.service'
import { OptionModel } from '~/modules/configs/configs.model'
import { RedisKeys } from '~/constants/cache.constant'
import { getRedisKey } from '~/utils/redis.util'
import os from 'node:os'

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: client.Registry
  private readonly enabled: boolean

  // Gauges for various metrics
  private readonly uptimeGauge: client.Gauge<string>
  private readonly memoryUsageGauge: client.Gauge<string>
  private readonly cpuUsageGauge: client.Gauge<string>
  private readonly eventLoopLagGauge: client.Gauge<string>
  private readonly onlineUsersGauge: client.Gauge<string>
  private readonly totalPVGauge: client.Gauge<string>
  private readonly totalUVGauge: client.Gauge<string>
  private readonly redisConnectedGauge: client.Gauge<string>
  private readonly mongoConnectedGauge: client.Gauge<string>

  constructor(
    private readonly redisService: RedisService,
    @InjectModel(OptionModel)
    private readonly optionModel: MongooseModel<OptionModel>,
  ) {
    this.enabled = METRICS.enable

    if (!this.enabled) {
      return
    }

    this.register = new client.Registry()

    // Set default labels
    this.register.setDefaultLabels({
      app: 'mx-space-core',
    })

    // Collect default metrics (Node.js metrics)
    client.collectDefaultMetrics({ register: this.register })

    // Custom metrics
    this.uptimeGauge = new client.Gauge({
      name: 'mx_app_uptime_seconds',
      help: 'Application uptime in seconds',
      registers: [this.register],
    })

    this.memoryUsageGauge = new client.Gauge({
      name: 'mx_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register],
    })

    this.cpuUsageGauge = new client.Gauge({
      name: 'mx_cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.register],
    })

    this.eventLoopLagGauge = new client.Gauge({
      name: 'mx_event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.register],
    })

    this.onlineUsersGauge = new client.Gauge({
      name: 'mx_online_users_total',
      help: 'Number of currently online users',
      registers: [this.register],
    })

    this.totalPVGauge = new client.Gauge({
      name: 'mx_total_pageviews',
      help: 'Total page views',
      registers: [this.register],
    })

    this.totalUVGauge = new client.Gauge({
      name: 'mx_total_unique_visitors',
      help: 'Total unique visitors',
      registers: [this.register],
    })

    this.redisConnectedGauge = new client.Gauge({
      name: 'mx_redis_connected',
      help: 'Redis connection status (1 = connected, 0 = disconnected)',
      registers: [this.register],
    })

    this.mongoConnectedGauge = new client.Gauge({
      name: 'mx_mongo_connected',
      help: 'MongoDB connection status (1 = connected, 0 = disconnected)',
      registers: [this.register],
    })
  }

  async onModuleInit() {
    if (!this.enabled) {
      return
    }

    // Update metrics every 10 seconds
    setInterval(() => {
      this.updateMetrics().catch((error) => {
        console.error('Failed to update metrics:', error)
      })
    }, 10000)

    // Initial update
    await this.updateMetrics()
  }

  private async updateMetrics() {
    if (!this.enabled) {
      return
    }

    try {
      // Update uptime
      this.uptimeGauge.set(process.uptime())

      // Update memory usage
      const memUsage = process.memoryUsage()
      this.memoryUsageGauge.set({ type: 'rss' }, memUsage.rss)
      this.memoryUsageGauge.set({ type: 'heapTotal' }, memUsage.heapTotal)
      this.memoryUsageGauge.set({ type: 'heapUsed' }, memUsage.heapUsed)
      this.memoryUsageGauge.set({ type: 'external' }, memUsage.external)

      // Update CPU usage
      const cpus = os.cpus()
      let totalIdle = 0
      let totalTick = 0
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += cpu.times[type]
        }
        totalIdle += cpu.times.idle
      }
      const cpuUsage = 100 - (100 * totalIdle) / totalTick
      this.cpuUsageGauge.set(cpuUsage)

      // Update event loop lag
      const start = Date.now()
      setImmediate(() => {
        const lag = (Date.now() - start) / 1000
        this.eventLoopLagGauge.set(lag)
      })

      // Update UV from database
      const uvRecord = await this.optionModel.findOne({ name: 'uv' }).lean()
      if (uvRecord && typeof uvRecord.value === 'number') {
        this.totalUVGauge.set(uvRecord.value)
      }

      // Update online users and PV from Redis
      const redis = this.redisService.getClient()
      const ipCount = await redis.scard(getRedisKey(RedisKeys.AccessIp))
      this.totalPVGauge.set(ipCount || 0)

      // Check Redis connection
      try {
        await redis.ping()
        this.redisConnectedGauge.set(1)
      } catch {
        this.redisConnectedGauge.set(0)
      }

      // Check MongoDB connection
      try {
        const state = this.optionModel.db.readyState
        this.mongoConnectedGauge.set(state === 1 ? 1 : 0)
      } catch {
        this.mongoConnectedGauge.set(0)
      }
    } catch (error) {
      console.error('Error updating metrics:', error)
    }
  }

  setOnlineUsers(count: number) {
    if (!this.enabled) {
      return
    }
    this.onlineUsersGauge.set(count)
  }

  async getMetrics(): Promise<string> {
    if (!this.enabled) {
      return ''
    }

    return this.register.metrics()
  }

  getContentType(): string {
    return this.register.contentType
  }

  isEnabled(): boolean {
    return this.enabled
  }
}
