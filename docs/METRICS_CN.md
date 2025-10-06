# Prometheus 监控指标端点

## 概述

MX Space Core 应用现已包含 Prometheus 监控指标端点，可提供有关应用运行的详细信息。此端点可通过环境变量进行开启或关闭，适合在生产环境中使用。

## 功能特性

`/metrics` 端点提供以下指标：

### 应用指标
- **mx_app_uptime_seconds**: 应用运行时长（秒）
- **mx_online_users_total**: 当前在线用户数
- **mx_total_pageviews**: 总访问量（基于 Redis 访问 IP 追踪）
- **mx_total_unique_visitors**: 总独立访客数（UV，来自数据库）

### 系统指标
- **mx_memory_usage_bytes**: 内存使用情况（按类型细分：rss、heapTotal、heapUsed、external）
- **mx_cpu_usage_percent**: CPU 使用率
- **mx_event_loop_lag_seconds**: 事件循环延迟（秒）

### 基础设施指标
- **mx_redis_connected**: Redis 连接状态（1 = 已连接，0 = 未连接）
- **mx_mongo_connected**: MongoDB 连接状态（1 = 已连接，0 = 未连接）

### 默认 Node.js 指标
还包括所有标准的 Node.js 指标：
- 进程 CPU 使用率
- 进程内存使用
- 事件循环延迟
- 活动句柄和请求
- 垃圾回收统计
- 等等...

## 配置方式

### 环境变量

设置 `METRICS_ENABLE=true` 启用指标端点：

```bash
# .env 文件
METRICS_ENABLE=true
```

### 命令行参数

启动应用时使用 `--metrics_enable` 参数：

```bash
node dist/src/main.js --metrics_enable
```

### Docker 环境变量

使用 Docker 时传递环境变量：

```bash
docker run -e METRICS_ENABLE=true -p 2333:2333 mx-space
```

### Docker Compose

```yaml
services:
  mx-space:
    image: mx-space
    environment:
      - METRICS_ENABLE=true
    ports:
      - "2333:2333"
```

## 使用方法

### 访问指标

启用后，可通过以下地址访问指标：

```
GET http://localhost:2333/metrics
```

端点返回 Prometheus 文本格式的指标：

```
# HELP mx_app_uptime_seconds Application uptime in seconds
# TYPE mx_app_uptime_seconds gauge
mx_app_uptime_seconds{app="mx-space-core"} 123.456

# HELP mx_memory_usage_bytes Memory usage in bytes
# TYPE mx_memory_usage_bytes gauge
mx_memory_usage_bytes{app="mx-space-core",type="rss"} 52428800
mx_memory_usage_bytes{app="mx-space-core",type="heapTotal"} 20971520
...
```

### 禁用状态

如果指标端点被禁用（默认状态），访问 `/metrics` 将返回 404 错误：

```json
{
  "message": "Metrics endpoint is disabled"
}
```

## Prometheus 配置

要从 MX Space 抓取指标，请在 `prometheus.yml` 中添加以下配置：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mx-space'
    static_configs:
      - targets: ['localhost:2333']
    metrics_path: '/metrics'
```

## Grafana 仪表板

您可以创建 Grafana 仪表板来可视化这些指标。以下是一些有用的查询：

### 系统健康状况
```promql
# CPU 使用率
mx_cpu_usage_percent{app="mx-space-core"}

# 内存使用
mx_memory_usage_bytes{app="mx-space-core",type="heapUsed"} / 1024 / 1024

# 运行时长
mx_app_uptime_seconds{app="mx-space-core"} / 3600
```

### 应用指标
```promql
# 在线用户
mx_online_users_total{app="mx-space-core"}

# 总访问量
mx_total_pageviews{app="mx-space-core"}

# 独立访客数
mx_total_unique_visitors{app="mx-space-core"}
```

### 基础设施状态
```promql
# Redis 连接
mx_redis_connected{app="mx-space-core"}

# MongoDB 连接
mx_mongo_connected{app="mx-space-core"}
```

## 安全注意事项

1. **访问控制**：`/metrics` 端点是公开的，不需要身份验证。建议使用反向代理（如 Nginx）将访问限制在可信网络或 Prometheus 服务器。

2. **信息泄露**：指标可能包含有关应用性能和使用情况的敏感信息。请确保您的 Prometheus 实例得到妥善保护。

3. **性能影响**：指标收集的性能开销很小。默认情况下，指标每 10 秒更新一次。

## 实现细节

### 指标服务

`MetricsService` 实现在 `apps/core/src/processors/helper/helper.metrics.service.ts`，负责：
- 初始化 Prometheus 客户端
- 每 10 秒收集和更新指标
- 以 Prometheus 格式提供指标

### 集成点

- **AppController**：暴露 `/metrics` 端点
- **WebEventsGateway**：实时更新在线用户数
- **OptionModel**：从数据库提供 UV（独立访客）计数
- **RedisService**：提供连接状态和 PV（访问量）数据

## 故障排除

### 指标端点返回 404
- 验证是否设置了 `METRICS_ENABLE=true`
- 检查应用启动日志是否有错误
- 确保访问的 URL 正确：`http://localhost:2333/metrics`

### 指标显示不正确的值
- 检查 MongoDB 连接（UV 计数依赖数据库）
- 检查 Redis 连接（PV 计数依赖 Redis）
- 验证 WebSocket 网关是否正确连接以进行在线用户追踪

### 内存使用率高
- 指标服务存储的状态极少
- 默认 Node.js 指标收集的开销可忽略不计
- 如需要可调整更新间隔（修改 `MetricsService` 中的 `setInterval` 持续时间）

## 示例输出

```
# HELP mx_app_uptime_seconds Application uptime in seconds
# TYPE mx_app_uptime_seconds gauge
mx_app_uptime_seconds{app="mx-space-core"} 3661.234

# HELP mx_memory_usage_bytes Memory usage in bytes
# TYPE mx_memory_usage_bytes gauge
mx_memory_usage_bytes{app="mx-space-core",type="rss"} 134217728
mx_memory_usage_bytes{app="mx-space-core",type="heapTotal"} 52428800
mx_memory_usage_bytes{app="mx-space-core",type="heapUsed"} 38797312
mx_memory_usage_bytes{app="mx-space-core",type="external"} 2097152

# HELP mx_cpu_usage_percent CPU usage percentage
# TYPE mx_cpu_usage_percent gauge
mx_cpu_usage_percent{app="mx-space-core"} 23.5

# HELP mx_event_loop_lag_seconds Event loop lag in seconds
# TYPE mx_event_loop_lag_seconds gauge
mx_event_loop_lag_seconds{app="mx-space-core"} 0.002

# HELP mx_online_users_total Number of currently online users
# TYPE mx_online_users_total gauge
mx_online_users_total{app="mx-space-core"} 42

# HELP mx_total_pageviews Total page views
# TYPE mx_total_pageviews gauge
mx_total_pageviews{app="mx-space-core"} 15623

# HELP mx_total_unique_visitors Total unique visitors
# TYPE mx_total_unique_visitors gauge
mx_total_unique_visitors{app="mx-space-core"} 3241

# HELP mx_redis_connected Redis connection status (1 = connected, 0 = disconnected)
# TYPE mx_redis_connected gauge
mx_redis_connected{app="mx-space-core"} 1

# HELP mx_mongo_connected MongoDB connection status (1 = connected, 0 = disconnected)
# TYPE mx_mongo_connected gauge
mx_mongo_connected{app="mx-space-core"} 1

# ... (Node.js 默认指标) ...
```
