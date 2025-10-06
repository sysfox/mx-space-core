# Prometheus Metrics Endpoint

## Overview

The MX Space Core application now includes a Prometheus metrics endpoint that provides detailed runtime information about the application. This endpoint can be enabled or disabled via environment variables, making it suitable for production monitoring.

## Features

The `/metrics` endpoint exposes the following metrics:

### Application Metrics
- **mx_app_uptime_seconds**: Application uptime in seconds
- **mx_online_users_total**: Number of currently online users
- **mx_total_pageviews**: Total page views (based on Redis access IP tracking)
- **mx_total_unique_visitors**: Total unique visitors (UV count from database)

### System Metrics
- **mx_memory_usage_bytes**: Memory usage breakdown by type (rss, heapTotal, heapUsed, external)
- **mx_cpu_usage_percent**: CPU usage percentage
- **mx_event_loop_lag_seconds**: Event loop lag in seconds

### Infrastructure Metrics
- **mx_redis_connected**: Redis connection status (1 = connected, 0 = disconnected)
- **mx_mongo_connected**: MongoDB connection status (1 = connected, 0 = disconnected)

### Default Node.js Metrics
All standard Node.js metrics are also included:
- Process CPU usage
- Process memory usage
- Event loop lag
- Active handles and requests
- Garbage collection statistics
- And more...

## Configuration

### Environment Variable

Set `METRICS_ENABLE=true` to enable the metrics endpoint:

```bash
# .env file
METRICS_ENABLE=true
```

### Command Line Argument

Use the `--metrics_enable` flag when starting the application:

```bash
node dist/src/main.js --metrics_enable
```

### Docker Environment Variable

When using Docker, pass the environment variable:

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

## Usage

### Accessing the Metrics

Once enabled, the metrics are available at:

```
GET http://localhost:2333/metrics
```

The endpoint returns metrics in Prometheus text-based exposition format:

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

### When Disabled

If the metrics endpoint is disabled (default), accessing `/metrics` returns a 404 error:

```json
{
  "message": "Metrics endpoint is disabled"
}
```

## Prometheus Configuration

To scrape metrics from MX Space, add this configuration to your `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mx-space'
    static_configs:
      - targets: ['localhost:2333']
    metrics_path: '/metrics'
```

## Grafana Dashboard

You can create a Grafana dashboard to visualize these metrics. Here are some useful queries:

### System Health
```promql
# CPU Usage
mx_cpu_usage_percent{app="mx-space-core"}

# Memory Usage
mx_memory_usage_bytes{app="mx-space-core",type="heapUsed"} / 1024 / 1024

# Uptime
mx_app_uptime_seconds{app="mx-space-core"} / 3600
```

### Application Metrics
```promql
# Online Users
mx_online_users_total{app="mx-space-core"}

# Total Page Views
mx_total_pageviews{app="mx-space-core"}

# Unique Visitors
mx_total_unique_visitors{app="mx-space-core"}
```

### Infrastructure Status
```promql
# Redis Connection
mx_redis_connected{app="mx-space-core"}

# MongoDB Connection
mx_mongo_connected{app="mx-space-core"}
```

## Security Considerations

1. **Access Control**: The `/metrics` endpoint is public and does not require authentication. Consider using a reverse proxy (e.g., Nginx) to restrict access to trusted networks or Prometheus servers only.

2. **Information Disclosure**: Metrics may contain sensitive information about your application's performance and usage. Ensure your Prometheus instance is properly secured.

3. **Performance Impact**: Metrics collection has minimal performance overhead. Metrics are updated every 10 seconds by default.

## Implementation Details

### Metrics Service

The `MetricsService` is implemented in `apps/core/src/processors/helper/helper.metrics.service.ts` and is responsible for:
- Initializing Prometheus client
- Collecting and updating metrics every 10 seconds
- Providing metrics in Prometheus format

### Integration Points

- **AppController**: Exposes the `/metrics` endpoint
- **WebEventsGateway**: Updates online user count in real-time
- **OptionModel**: Provides UV (unique visitor) count from database
- **RedisService**: Provides connection status and PV (page view) data

## Troubleshooting

### Metrics endpoint returns 404
- Verify that `METRICS_ENABLE=true` is set
- Check application logs for any startup errors
- Ensure you're accessing the correct URL: `http://localhost:2333/metrics`

### Metrics show incorrect values
- Check MongoDB connection (UV count depends on database)
- Check Redis connection (PV count depends on Redis)
- Verify that the WebSocket gateway is properly connected for online user tracking

### High memory usage
- The metrics service stores minimal state
- Default Node.js metrics collection has negligible overhead
- Consider adjusting the update interval if needed (modify `setInterval` duration in `MetricsService`)

## Example Output

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

# ... (Node.js default metrics follow) ...
```
