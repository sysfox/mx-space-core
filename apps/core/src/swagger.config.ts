import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { dump as yamlDump } from 'js-yaml'
import { API_VERSION } from './app.config'
import { logger } from './global/consola.global'
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
  const jsonPath = resolve(cwd, 'openapi.json')
  writeFileSync(jsonPath, JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  })
  logger.success(`OpenAPI JSON exported to: ${jsonPath}`)

  // Export OpenAPI spec as YAML file for Swagger import
  const yamlPath = resolve(cwd, 'swagger.yaml')
  const yamlContent = yamlDump(document, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  })
  writeFileSync(yamlPath, yamlContent, {
    encoding: 'utf8',
  })
  logger.success(`Swagger YAML exported to: ${yamlPath}`)

  return document
}
