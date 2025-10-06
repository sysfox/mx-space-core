import { createRedisProvider } from '@/mock/modules/redis.mock'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { AppController } from '~/app.controller'
import { fastifyApp } from '~/common/adapters/fastify.adapter'
import { OptionModel } from '~/modules/configs/configs.model'
import { CacheService } from '~/processors/redis/cache.service'
import { MetricsService } from '~/processors/helper/helper.metrics.service'
import { getModelToken } from '~/transformers/model.transformer'

describe('AppController /metrics (e2e)', async () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        CacheService,
        MetricsService,
        {
          provide: getModelToken(OptionModel.name),
          useValue: {
            findOne: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue({ value: 100 }),
            }),
            db: {
              readyState: 1,
            },
          },
        },
        await createRedisProvider(),
      ],
    })
      .overrideProvider(CacheService)
      .useValue({})
      .compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(fastifyApp)
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  test('GET /metrics - should return 404 when metrics disabled', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/metrics',
    })

    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({ message: 'Metrics endpoint is disabled' })
  })
})

describe('AppController /metrics enabled (e2e)', async () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    // Enable metrics by mocking the config
    vi.mock('~/app.config', async () => {
      const actual = await vi.importActual('~/app.config')
      return {
        ...actual,
        METRICS: {
          enable: true,
        },
      }
    })

    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        CacheService,
        MetricsService,
        {
          provide: getModelToken(OptionModel.name),
          useValue: {
            findOne: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue({ value: 100 }),
            }),
            db: {
              readyState: 1,
            },
          },
        },
        await createRedisProvider(),
      ],
    })
      .overrideProvider(CacheService)
      .useValue({})
      .compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(fastifyApp)
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  test('GET /metrics - should return prometheus metrics when enabled', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/metrics',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/plain')

    // Check for some expected metrics
    const metrics = res.payload
    expect(metrics).toContain('# HELP')
    expect(metrics).toContain('# TYPE')
  })
})
