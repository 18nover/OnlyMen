---
name: devops-deployment
description: "DevOps deployment skill for Circuit. Docker multi-stage builds, Docker Compose, GitHub Actions CI/CD, EAS builds, monitoring (Datadog dd-trace + pino), logging, secret rotation, backups, SSL/TLS."
version: 1.0.0
author: OnlyMen Engineering
agent: Circuit
category: infrastructure
tags:
  - devops
  - docker
  - ci-cd
  - github-actions
  - eas
  - prometheus
  - grafana
  - ssl-tls
---

# DevOps Deployment Skill

This skill covers the full deployment lifecycle for OnlyMen services: containerization, CI/CD pipelines, mobile builds, observability, secrets management, backups, and TLS.

---

## 1. Docker Multi-Stage Builds

### Node.js Service (Production)

```dockerfile
# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Stage 2: Build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 3: Production ---
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### Python Service (Production)

```dockerfile
# --- Stage 1: Builder ---
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Production ---
FROM python:3.12-slim AS production
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Multi-Stage Best Practices

- Always use specific base image tags (e.g., `node:20-alpine` not `node:latest`)
- Run as non-root user in the final stage
- Include a HEALTHCHECK instruction
- Use `.dockerignore` to exclude `node_modules`, `.git`, `__pycache__`, `*.env`
- Minimize layers by combining `RUN` commands with `&&`
- Scan images with `docker scout cves` or Trivy before pushing

### .dockerignore

```
node_modules
.git
.env*
*.md
tests/
coverage/
.nyc_output/
docker-compose*.yml
.github/
```

---

## 2. Docker Compose Configuration

### Production Compose

```yaml
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: ghcr.io/onlymen/api:${API_VERSION:-latest}
    restart: unless-stopped
    ports:
      - "${API_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: onlymen
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d onlymen"]
      interval: 10s
      timeout: 3s
      retries: 3

  prometheus:
    image: prom/prometheus:v2.51.0
    restart: unless-stopped
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:10.4.0
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"

volumes:
  redis-data:
  pg-data:
  prometheus-data:
  grafana-data:
```

### Compose Best Practices

- Use `depends_on` with `condition: service_healthy` for startup ordering
- Set resource limits on every service
- Use named volumes for all persistent data
- Pin image versions, never use `latest`
- Keep secrets out of compose files; use `.env` files (gitignored)
- Run `docker compose config` to validate before deploying

---

## 3. GitHub Actions CI/CD

### Main Pipeline

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          ssh ${{ secrets.DEPLOY_HOST }} << 'EOF'
            cd /opt/onlymen
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
          EOF
```

### Pipeline Best Practices

- Run lint and typecheck before tests (fail fast)
- Use GitHub Actions caches for npm and Docker layers
- Never hardcode secrets in workflow files
- Use `environment` protection rules for production deploys
- Tag Docker images with SHA and branch for traceability
- Always prune unused images after deploy

---

## 4. EAS Builds and Submissions

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "team@onlymen.dev",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json"
      }
    }
  }
}
```

### Build Commands

```bash
# Development build (internal distribution)
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (shareable with testers)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production

# OTA update (no store submission needed)
eas update --channel production --message "Bug fix for package detection"
```

### EAS Best Practices

- Use `autoIncrement: true` for production to avoid version conflicts
- Keep `development` and `preview` profiles using internal distribution
- Use OTA updates for non-native code changes (faster than store review)
- Store Apple/Google credentials in EAS Secrets, never in repo
- Test preview builds on real devices before production submission

---

## 5. Monitoring Setup (Datadog — no Prometheus/Grafana in this stack)

There is no Prometheus/Grafana/ELK/Loki anywhere in `atproto/` or `app/` —
verified by grep. Real observability stack:

- **Tracing**: `dd-trace` (Datadog), wired per-service via each service's own
  `tracer.ts` (e.g. `atproto/services/bsky/tracer.ts`).
- **Logging**: pino, via `packages/common/src/logger.ts`'s `subsystemLogger`
  — structured, not scraped metrics.
- **Health checks**: `/xrpc/_health` (not `/health`) — confirmed on `pds` and
  `ozone`; not confirmed whether `bsky`/`bsync` expose an equivalent.
- **Client-side**: Sentry (crash/error reporting) + Bitdrift
  (`BITDRIFT_API_KEY`, injected in CI) on `app/`.

### Key things to monitor (mapped to what actually exists)

| Concern                  | Where it's observed                              |
|---------------------------|---------------------------------------------------|
| Request latency/errors    | `dd-trace` spans per service                      |
| Structured log errors     | pino `subsystemLogger` output, shipped wherever the deploy target sends stdout |
| Service liveness          | `/xrpc/_health` polling                            |
| Client crashes             | Sentry (app/)                                     |
| Client-side perf/logs      | Bitdrift (app/)                                   |

Don't propose adding Prometheus/Grafana without first confirming with Circuit
whether the deploy target already has a metrics-scraping story — the
existing stack is trace- and log-based, not metrics-scraping-based.

---

## 6. Centralized Logging

### Log Structure

All services must log in structured JSON format:

```json
{
  "timestamp": "2025-01-15T14:23:01.123Z",
  "level": "info",
  "service": "pds",
  "message": "record created",
  "traceId": "abc-123-def",
  "did": "did:plc:abc123",
  "collection": "app.bsky.feed.post",
  "duration": 45
}
```

### Log Levels

| Level     | When to Use                                    |
|-----------|------------------------------------------------|
| `error`   | Unrecoverable failure requiring immediate attention |
| `warn`    | Recoverable issue that should be investigated  |
| `info`    | Normal operational events (startup, deploy, detection) |
| `debug`   | Detailed diagnostic information (off in production) |

### Logging Rules

- Never log raw images, frame data, or base64-encoded content
- Never log secrets, tokens, passwords, or API keys
- Always include `traceId` for request tracing across services
- Rotate logs daily, retain for 30 days
- Use `warn` not `error` for expected failure cases (network timeouts, retries)

---

## 7. Secret Rotation

### Rotation Schedule

| Secret Type             | Rotation Interval | Method              |
|-------------------------|-------------------|---------------------|
| Database passwords      | 90 days           | Script + restart    |
| API keys                | 90 days           | Provider regeneration |
| JWT signing keys        | 180 days          | Dual-key rollout    |
| SSH deploy keys         | 180 days          | Manual + GitHub     |
| TLS certificates        | Auto (Let's Encrypt) | certbot          |
| Docker registry tokens  | 90 days           | GitHub PAT rotation |

### Rotation Procedure

```bash
#!/bin/bash
# rotate-db-password.sh
set -euo pipefail

NEW_PASSWORD=$(openssl rand -base64 32)
DB_USER="onlymen"

# Update password in PostgreSQL
docker compose exec postgres psql -U postgres -c \
  "ALTER USER ${DB_USER} PASSWORD '${NEW_PASSWORD}';"

# Update secret in deployment
docker secret create db_password_new "${NEW_PASSWORD}"
docker service update --secret-rm db_password --secret-add db_password_new api

# Cleanup
docker secret rm db_password
echo "Database password rotated at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### Rotation Best Practices

- Test rotation in staging before production
- Use dual-key periods for JWT rotation (accept both old and new during transition)
- Log every secret rotation event
- Never commit rotated secrets to git
- Verify services are healthy after rotation

---

## 8. Backup Procedures

### Database Backups

```bash
#!/bin/bash
# backup-postgres.sh
set -euo pipefail

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup
docker compose exec -T postgres pg_dump \
  -U "${DB_USER}" -d onlymen --format=custom \
  > "${BACKUP_DIR}/onlymen_${DATE}.dump"

# Compress
gzip "${BACKUP_DIR}/onlymen_${DATE}.dump"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/onlymen_${DATE}.dump.gz" \
  s3://onlymen-backups/postgres/ --storage-class STANDARD_IA

# Cleanup old local backups
find "${BACKUP_DIR}" -name "*.dump.gz" -mtime +${RETENTION_DAYS} -delete
```

### Backup Schedule

| Data              | Frequency | Retention | Storage        |
|-------------------|-----------|-----------|----------------|
| PostgreSQL        | Daily     | 30 days   | S3 + local     |
| Redis             | Daily     | 7 days    | S3             |
| Docker volumes    | Weekly    | 4 weeks   | S3             |
| TLS certificates  | On renewal| Forever   | Git + S3       |

### Recovery Procedure

1. Pull latest backup from S3
2. Stop the affected service
3. Restore database: `docker compose exec -T postgres pg_restore -U ${DB_USER} -d onlymen < backup.dump`
4. Verify data integrity with health check queries
5. Restart service and monitor logs

---

## 9. SSL/TLS Management

### Let's Encrypt with Certbot

```bash
# Initial setup
sudo apt install certbot
sudo certbot certonly --standalone -d api.onlymen.dev -d dashboard.onlymen.dev

# Auto-renewal (cron)
0 0 1 * * certbot renew --deploy-hook "docker compose restart nginx"
```

### Nginx TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.onlymen.dev;

    ssl_certificate /etc/letsencrypt/live/api.onlymen.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.onlymen.dev/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    location / {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### TLS Best Practices

- Always redirect HTTP to HTTPS
- Use TLS 1.2 and 1.3 only (disable SSLv3, TLS 1.0, TLS 1.1)
- Enable HSTS with a long max-age
- Auto-renew certificates before expiry
- Monitor certificate expiry with alerting (alert at 14 days, 7 days, 1 day)
- Never store private keys in git or container images

---

## 10. Common Gotchas

- **Docker cache invalidation**: Changing `COPY . .` rebuilds everything. Copy `package.json` first, install deps, then copy source.
- **Compose profile confusion**: Use `--profile` flag to activate services only when needed (e.g., monitoring in dev).
- **EAS build queue**: Free tier has limited concurrency. Build during off-hours for production releases.
- **Prometheus scrape failures**: If a service restarts during a scrape, Prometheus marks it as down. Use `stale_samples_limit` in Prometheus config.
- **Log volume explosion**: Debug logging in production generates gigabytes per hour. Use environment-based log level control.
- **Secret in git history**: A committed secret must be rotated immediately and purged from git history with `git filter-repo`.
- **Certificate auto-renewal failures**: Certbot needs port 80. If another service binds to it, renewal fails silently.
- **Database migration order**: Never run migrations and deploys simultaneously. Deploy migration first, then the new code version.

---

## 11. Quality Standards

- Every Dockerfile must pass Hadolint linting
- Docker Compose files must be validated with `docker compose config`
- CI pipelines must complete in under 10 minutes
- All production deploys require a passing CI run on the same commit
- Monitoring dashboards must be updated when new services are added
- Backup restoration must be tested monthly (document results)
- TLS certificates must never be within 7 days of expiry without alerting
- Secret rotation must be logged and auditable
