import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { API_VERSION } from './app.config'
import { cwd } from './global/env.global'

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Mix Space API')
    .setDescription('Mix Space - Personal Space, 个人空间的完整后端 API 文档')
    .setVersion(API_VERSION.toString())
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addServer('http://localhost:2333', 'Development')
    .addServer('/api/v2', 'Production')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  })

  // Set up Swagger UI
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Mix Space API Documentation',
  })

  // Export OpenAPI spec as JSON file for Apifox import
  const outputPath = resolve(cwd, 'openapi.json')
  writeFileSync(outputPath, JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  })

  return document
}
