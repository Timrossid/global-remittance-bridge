# Health Check Endpoints

## Payment API
- `GET /health` - Overall health status
- `GET /health/db` - Database connectivity
- `GET /health/redis` - Redis connectivity
- `GET /metrics` - Prometheus metrics

## Expected Responses
```json
{
  "status": "healthy",
  "timestamp": "2026-09-10T12:00:00Z",
  "uptime": 3600,
  "database": {
    "status": "healthy",
    "timestamp": "2026-09-10T12:00:00Z"
  }
}
```

## Monitoring
- Health checks run every 30 seconds
- Three consecutive failures trigger an alert
- Automatic recovery attempted for transient failures
- Manual intervention required for persistent failures
