# Supabase Connection Pooling Setup

## Overview
Connection pooling is configured in the backend to efficiently manage database connections to Supabase PostgreSQL. This prevents connection exhaustion and improves performance.

## Configuration Details

### Pool Settings (in `config/database.js`)

```javascript
max: 20                      // Maximum connections in pool
min: 2                       // Minimum connections to maintain
idleTimeoutMillis: 30000     // Close idle connections after 30 seconds
connectionTimeoutMillis: 5000 // Timeout for acquiring a connection
maxUses: 7500                // Recycle connections after 7500 uses
```

### Why These Settings?

- **max: 20** - Balances performance with Supabase connection limits. Supabase free tier allows ~100 connections, so 20 per backend instance is safe.
- **min: 2** - Maintains minimum connections for quick response times without wasting resources.
- **idleTimeoutMillis: 30000** - Closes idle connections to free up Supabase connection slots.
- **connectionTimeoutMillis: 5000** - Prevents hanging requests if pool is exhausted.
- **maxUses: 7500** - Recycles connections periodically to prevent stale connections and memory leaks.

## Monitoring

### Health Check Endpoints

```bash
# Basic health check
curl http://localhost:3000/health

# Pool statistics
curl http://localhost:3000/health/pool
```

### Pool Statistics Response
```json
{
  "status": "ok",
  "pool": {
    "totalConnections": 5,
    "idleConnections": 4,
    "waitingRequests": 0,
    "activeConnections": 1
  }
}
```

### Console Logs
The application logs pool events:
- ✅ New connection established
- ⚠️ Connection removed from pool
- 📊 Pool statistics on startup

## Best Practices

### 1. Always Release Connections
```javascript
const client = await pool.connect();
try {
  // Use client
} finally {
  client.release();
}
```

### 2. Use Connection Pooling for Queries
```javascript
// Good - uses pool
await pool.query('SELECT * FROM users');

// Also good - explicit client
const client = await pool.connect();
await client.query('SELECT * FROM users');
client.release();
```

### 3. Monitor Pool Health
Check `/health/pool` endpoint regularly in production to ensure:
- `activeConnections` stays reasonable
- `waitingRequests` is 0 or low
- `idleConnections` > 0

### 4. Handle Connection Errors
```javascript
pool.on('error', (err) => {
  console.error('Pool error:', err);
  // Alert monitoring system
});
```

## Scaling Considerations

### For Multiple Backend Instances
If running multiple backend instances, adjust pool settings:
```javascript
// For 3 instances with Supabase free tier (~100 connections)
max: 15  // 15 * 3 = 45 connections total
min: 1   // Reduce minimum to save resources
```

### For Production
```javascript
max: 25
min: 5
idleTimeoutMillis: 60000  // Longer timeout
connectionTimeoutMillis: 10000
maxUses: 10000
```

## Troubleshooting

### "Pool exhausted" Error
- Increase `max` connections
- Check for connection leaks (missing `client.release()`)
- Monitor `/health/pool` endpoint

### Slow Queries
- Check `waitingRequests` in pool stats
- Optimize database queries
- Consider increasing `max` connections

### Connection Timeouts
- Increase `connectionTimeoutMillis`
- Check Supabase database status
- Verify network connectivity

## Environment Variables

Add to `.env` if needed for custom pooling:
```env
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
```

Then update `database.js` to use these values:
```javascript
max: parseInt(process.env.DB_POOL_MAX || '20'),
min: parseInt(process.env.DB_POOL_MIN || '2'),
idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
```

## Graceful Shutdown

The application handles SIGTERM signals to gracefully close the pool:
```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...');
  await pool.end();
  process.exit(0);
});
```

This ensures all connections are properly closed before the process exits.
