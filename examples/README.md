# MX Space Monitoring Examples

This directory contains example configurations for monitoring MX Space with Prometheus and Grafana.

## Quick Start

### Using Docker Compose

1. Start the complete monitoring stack:

```bash
cd examples
docker-compose -f docker-compose.metrics.yml up -d
```

This will start:
- **MX Space** on port 2333 (with metrics enabled)
- **MongoDB** for data storage
- **Redis** for caching
- **Prometheus** on port 9090
- **Grafana** on port 3000

2. Access the services:
- MX Space: http://localhost:2333
- Metrics endpoint: http://localhost:2333/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### Configure Grafana

1. Open Grafana at http://localhost:3000 and log in with `admin/admin`

2. Add Prometheus as a data source:
   - Go to Configuration → Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - Set URL to `http://prometheus:9090`
   - Click "Save & Test"

3. Create a dashboard:
   - Go to Create → Dashboard
   - Add a new panel
   - Use the example queries from the documentation

### Example Queries

#### System Health Panel
```promql
mx_cpu_usage_percent{app="mx-space-core"}
```

#### Memory Usage Panel
```promql
mx_memory_usage_bytes{app="mx-space-core",type="heapUsed"} / 1024 / 1024
```

#### Online Users Panel
```promql
mx_online_users_total{app="mx-space-core"}
```

#### Page Views Panel
```promql
rate(mx_total_pageviews{app="mx-space-core"}[5m])
```

## Manual Configuration

### Enable Metrics in Existing Installation

Add to your `.env` file:
```
METRICS_ENABLE=true
```

Or use command line:
```bash
node dist/src/main.js --metrics_enable
```

### Prometheus Configuration

Update your `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mx-space'
    static_configs:
      - targets: ['localhost:2333']
    metrics_path: '/metrics'
```

### Available Metrics

See the [METRICS.md](../docs/METRICS.md) documentation for a complete list of available metrics.

## Troubleshooting

### Metrics endpoint not accessible
- Ensure `METRICS_ENABLE=true` is set
- Check MX Space logs for errors
- Verify the application is running on port 2333

### Prometheus not scraping metrics
- Check Prometheus targets at http://localhost:9090/targets
- Verify the network connectivity between Prometheus and MX Space
- Check the Prometheus configuration

### No data in Grafana
- Verify Prometheus data source is correctly configured
- Check that metrics are being collected by viewing the Prometheus UI
- Ensure the correct metric names are used in queries
