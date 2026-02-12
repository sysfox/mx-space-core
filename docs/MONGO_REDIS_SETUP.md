# MongoDB 和 Redis 自动配置指南

本文档说明如何自主配置 MongoDB 和 Redis 环境，并生成 API 文档。

## 快速开始

### 1. 启动 MongoDB 和 Redis

使用提供的自动化脚本：

```bash
# 启动 MongoDB 和 Redis（使用 Docker）
bash scripts/setup-mongodb.sh start
```

或者手动启动：

```bash
# 启动 MongoDB
docker run -d --name mx-space-mongo -p 27017:27017 mongo:7

# 启动 Redis  
docker run -d --name mx-space-redis -p 6379:6379 redis:alpine
```

### 2. 使用开发配置文件

项目已包含 `config.dev.yaml` 开发配置文件，包含 MongoDB 和 Redis 的默认配置。

启动应用：

```bash
# 使用配置文件启动
pnpm dev -- --config config.dev.yaml

# 或使用环境变量启动
MONGO_CONNECTION=mongodb://localhost:27017/mx-space pnpm dev
```

### 3. 生成 API 文档

启动服务后，API 文档会自动生成并可通过以下方式访问：

```bash
# 方式 1: 访问 Swagger UI
# 浏览器打开 http://localhost:2333/api-docs

# 方式 2: 单独生成文档（需要 MongoDB 和 Redis 运行）
pnpm -C apps/core swagger
```

生成的文档文件：
- `openapi.json` - JSON 格式的 OpenAPI 3.0 规范
- `swagger.yaml` - YAML 格式的 Swagger 规范

## 环境配置详情

### MongoDB 配置选项

通过 `config.dev.yaml` 或环境变量配置：

```yaml
# MongoDB 配置
collection_name: mx-space        # 数据库名称
db_host: 127.0.0.1              # MongoDB 主机
db_port: 27017                  # MongoDB 端口
db_user: ''                     # 用户名（可选）
db_password: ''                 # 密码（可选）

# 或使用连接字符串（优先级更高）
db_connection_string: mongodb://localhost:27017/mx-space
```

### Redis 配置选项

```yaml
# Redis 配置
redis_host: localhost
redis_port: 6379
redis_password: ''              # 密码（可选）
```

## 管理 MongoDB 和 Redis

### 使用脚本管理

```bash
# 查看状态
bash scripts/setup-mongodb.sh status

# 停止服务
bash scripts/setup-mongodb.sh stop

# 重启服务
bash scripts/setup-mongodb.sh restart

# 查看日志
bash scripts/setup-mongodb.sh logs

# 删除容器（数据保留）
bash scripts/setup-mongodb.sh remove
```

### 手动管理

```bash
# 查看运行状态
docker ps

# 停止容器
docker stop mx-space-mongo mx-space-redis

# 启动已存在的容器
docker start mx-space-mongo mx-space-redis

# 删除容器
docker rm -f mx-space-mongo mx-space-redis
```

## 数据持久化

默认情况下，MongoDB 数据存储在：
- 使用脚本启动: `./data/mongodb`
- 手动启动: Docker 默认卷

## 故障排查

### MongoDB 连接失败

1. 检查 MongoDB 是否运行：
   ```bash
   docker ps | grep mongo
   ```

2. 查看 MongoDB 日志：
   ```bash
   docker logs mx-space-mongo
   ```

3. 测试连接：
   ```bash
   docker exec mx-space-mongo mongosh --eval "db.adminCommand('ping')"
   ```

### Redis 连接失败

1. 检查 Redis 是否运行：
   ```bash
   docker ps | grep redis
   ```

2. 查看 Redis 日志：
   ```bash
   docker logs mx-space-redis
   ```

3. 测试连接：
   ```bash
   docker exec mx-space-redis redis-cli ping
   ```

### API 文档生成失败

如果 `pnpm swagger` 失败，可以：

1. 先启动完整服务：
   ```bash
   pnpm dev
   ```

2. 访问 Swagger UI 并导出 JSON：
   ```
   http://localhost:2333/api-docs-json
   ```

3. 或者使用已提交的文档文件（位于项目根目录）

## 生产环境配置

生产环境建议：

1. 使用环境变量或配置文件
2. 启用认证
3. 配置数据持久化
4. 使用 Docker Compose

示例 Docker Compose 配置已包含在项目中：
```bash
docker-compose up -d
```

## 更多信息

- MongoDB 文档: https://docs.mongodb.com/
- Redis 文档: https://redis.io/documentation
- NestJS 文档: https://docs.nestjs.com/
- Swagger 文档: https://swagger.io/docs/
