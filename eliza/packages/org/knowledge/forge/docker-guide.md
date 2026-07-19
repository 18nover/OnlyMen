# Docker Guide

## Overview

This guide covers Docker best practices for building, running, and managing containerized services. Includes multi-stage builds, Docker Compose configuration, health checks, resource limits, logging, networking, volumes, secrets, and image optimization.

---

## Multi-Stage Builds

### Node.js / TypeScript

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Go Service

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

FROM alpine:3.19 AS runner
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/server /usr/local/bin/server

USER nobody
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["server"]
```

### Python Service

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Docker Compose

### Full Stack Configuration

```yaml
# docker-compose.yml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://app:${DB_PASSWORD}@postgres:5432/onlymen
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: onlymen
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d onlymen"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 300M
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Health Checks

### Health Check Endpoints

```ts
// Express / Fastify
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: 'ok',
        cache: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Liveness — is the process running?
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness — can it accept traffic?
app.get('/health/ready', async (req, res) => {
  const dbOk = await checkDatabase();
  const cacheOk = await checkCache();

  if (dbOk && cacheOk) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({
      status: 'not ready',
      database: dbOk ? 'ok' : 'down',
      cache: cacheOk ? 'ok' : 'down',
    });
  }
});
```

### Health Check Options

| Option         | Value    | Purpose                              |
|----------------|----------|--------------------------------------|
| `interval`     | 30s      | How often to check                   |
| `timeout`      | 3s       | Max time per check                   |
| `retries`      | 3        | Failures before unhealthy            |
| `start_period` | 10-30s   | Grace period for startup             |

---

## Resource Limits

### CPU and Memory

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Max 2 CPU cores
      memory: 512M      # Max 512MB RAM
    reservations:
      cpus: '0.5'       # Guaranteed 0.5 CPU cores
      memory: 256M      # Guaranteed 256MB RAM
```

### Swap Limits

```yaml
# docker run
docker run --memory=512m --memory-swap=768m myapp

# Compose v3.9+
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
    # Swap is controlled at daemon level
```

### OOM Kill Behavior

```yaml
services:
  app:
    oom_kill_disable: false  # Default: false (will OOM kill)
    oom_score_adj: -500      # Lower = less likely to be killed
```

---

## Logging

### JSON Logging

```ts
// Structured logging for Docker
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// All output goes to stdout/stderr — Docker captures it
logger.info({ userId: 'abc', action: 'login' }, 'User logged in');
logger.error({ err: error, requestId }, 'Request failed');
```

### Docker Logging Configuration

```yaml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"      # Max file size before rotation
        max-file: "3"         # Number of rotated files
        tag: "{{.Name}}"

  # For production with log aggregation
  app:
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/onlymen
        awslogs-region: us-east-1
        awslogs-stream-prefix: app
```

### Log Levels

| Level    | Use Case                                  |
|----------|--------------------------------------------|
| `fatal`  | Process is about to exit                   |
| `error`  | Operation failed, needs attention           |
| `warn`   | Something unexpected, but not critical      |
| `info`   | Normal operation events                     |
| `debug`  | Detailed info for debugging                 |
| `trace`  | Very verbose, lowest priority               |

---

## Networking

### Docker Network Types

| Type      | Description                              | Use Case            |
|-----------|------------------------------------------|----------------------|
| bridge    | Default, isolated network per compose     | Most applications    |
| host      | Shares host network stack                 | Performance-critical |
| overlay   | Multi-host networking (Swarm)            | Clustered services   |
| none      | No networking                            | Isolated containers  |

### Custom Network

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  redis:
    networks:
      - backend

  nginx:
    networks:
      - frontend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

### Service Discovery

```yaml
services:
  app:
    environment:
      # Use service name as hostname
      - DATABASE_URL=postgresql://app:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379
      - API_URL=http://api:8080
```

---

## Volumes

### Named Volumes

```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    volumes:
      - redis_data:/data
```

### Bind Mounts (Development)

```yaml
services:
  app:
    volumes:
      - ./src:/app/src:ro          # Read-only source
      - ./package.json:/app/package.json:ro
      - /app/node_modules          # Anonymous volume (don't mount)
```

### Volume Best Practices

- Use named volumes for databases — persist across rebuilds
- Use bind mounts for development — hot reload
- Never mount source code as writable in production
- Use read-only mounts (`:ro`) where possible
- Anonymous volumes for node_modules — prevent host overwrite

---

## Secrets Management

### Docker Secrets (Swarm)

```yaml
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    file: ./secrets/api_key.txt
```

### Environment Files

```bash
# .env (never commit)
DB_PASSWORD=secure_password_here
REDIS_PASSWORD=redis_secret
API_KEY=sk_live_xxxxx
```

```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env
```

### Secrets Best Practices

1. **Never commit secrets** to version control
2. **Use `.env` files** for local development
3. **Use Docker secrets** for Swarm/Kubernetes
4. **Use cloud secret managers** (AWS SSM, GCP Secret Manager) for production
5. **Rotate secrets** regularly
6. **Limit secret access** — only services that need them

---

## Image Optimization

### Optimization Checklist

1. **Use Alpine base images** — 5MB vs 900MB for Debian
2. **Multi-stage builds** — don't include dev dependencies in production
3. **Layer ordering** — put rarely-changing layers first
4. **`.dockerignore`** — exclude unnecessary files
5. **Minimize layers** — combine RUN commands
6. **No package cache** — clean up in same layer

### `.dockerignore`

```
node_modules
.git
.env
.env.local
dist
coverage
*.log
.DS_Store
docker-compose.yml
Dockerfile
README.md
.github
.vscode
```

### Size Comparison

| Base Image              | Size     |
|-------------------------|----------|
| `node:20`               | ~900MB   |
| `node:20-slim`          | ~200MB   |
| `node:20-alpine`        | ~50MB    |
| Multi-stage (Alpine)    | ~150MB   |
| Multi-stage (distroless)| ~120MB   |

---

## Best Practices

1. **Multi-stage builds** — always separate build and runtime
2. **Non-root user** — never run as root in production
3. **Health checks** — every service must have a health check
4. **Resource limits** — set CPU and memory limits
5. **Restart policy** — use `unless-stopped` for production
6. **Pin versions** — use specific versions, not `latest`
7. **Use `.dockerignore`** — keep images clean
8. **Structured logging** — JSON logs to stdout/stderr
9. **Named volumes** — for persistent data
10. **Test locally** — `docker compose up` before deploying
