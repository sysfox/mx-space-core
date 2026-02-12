#!/usr/bin/env node
/**
 * Generate Swagger/OpenAPI documentation without starting the server
 * Usage: node dist/src/generate-swagger.js
 */
import 'dotenv-expand/config'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { dump as yamlDump } from 'js-yaml'
import { API_VERSION } from './app.config'
import { AppModule } from './app.module'
import { fastifyApp } from './common/adapters/fastify.adapter'
import { logger } from './global/consola.global'
import { cwd } from './global/env.global'
import { initializeApp } from './global/index.global'

async function generateSwagger() {
  try {
    initializeApp()

    logger.info('Creating NestJS application...')
    const app = await NestFactory.create(
      AppModule.register(false),
      fastifyApp,
      {
        logger: false,
      },
    )

    logger.info('Building OpenAPI documentation...')
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

    // Export as JSON
    const jsonPath = resolve(cwd, 'openapi.json')
    writeFileSync(jsonPath, JSON.stringify(document, null, 2), {
      encoding: 'utf8',
    })
    logger.success(`✓ OpenAPI JSON exported to: ${jsonPath}`)

    // Export as YAML
    const yamlPath = resolve(cwd, 'swagger.yaml')
    const yamlContent = yamlDump(document, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    })
    writeFileSync(yamlPath, yamlContent, {
      encoding: 'utf8',
    })
    logger.success(`✓ Swagger YAML exported to: ${yamlPath}`)

    await app.close()
    logger.success('✓ Documentation generated successfully!')
    process.exit(0)
  } catch (error) {
    logger.error('Failed to generate documentation:', error)
    process.exit(1)
  }
}

generateSwagger()
