---
name: backend-dev
description: >
  Backend development skill for Forge. Covers API design with REST and XRPC
  patterns, PostgreSQL schema design and migrations, Redis caching strategies,
  authentication via AT Protocol OAuth, rate limiting, input validation with
  Zod, Docker configuration, health checks, and structured logging.
metadata:
  author: OnlyMen Engineering
  team: Forge
  version: 1.0.0
  tags:
    - backend
    - api
    - postgresql
    - redis
    - at-protocol
    - oauth
    - docker
    - zod
---

# Backend Development

Skill for building and maintaining backend services within the OnlyMen
engineering organization. Targets Forge's API layer and infrastructure.

---

## API Design

### REST Conventions

Follow standard HTTP semantics:

| Method | Purpose | Idempotent |
|---|---|---|
| `GET` | Retrieve resources | Yes |
| `POST` | Create resources or trigger actions | No |
| `PUT` | Replace a resource | Yes |
| `PATCH` | Partially update a resource | Yes |
| `DELETE` | Remove a resource | Yes |

### URL Structure

```
GET    /v1/users/:did
POST   /v1/users
PATCH  /v1/users/:did
DELETE /v1/users/:did

GET    /v1/feed?actor=:did&limit=25
GET    /v1/posts/:uri
POST   /v1/posts
```

- Use plural nouns for resource names.
- Use path parameters for resource identifiers (`:did`, `:uri`).
- Use query parameters for filtering, pagination, and sorting.
- Version all APIs with a `v1` prefix.

### Response Format

```json
{
  "data": { ... },
  "meta": {
    "cursor": "abc123",
    "hasMore": true
  }
}
```

- Wrap successful responses in a `data` key.
- Include pagination metadata in `meta` when applicable.
- Use consistent error shapes (see Error Handling below).

### Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid DID format",
    "details": [
      {
        "field": "did",
        "message": "Must be a valid AT Protocol DID"
      }
    ]
  }
}
```

Map HTTP status codes to error types:

| Status | Meaning |
|---|---|
| 400 | Validation / malformed request |
| 401 | Authentication required |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, version mismatch) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### XRPC Patterns

For AT Protocol XRPC endpoints, follow the Lexicon schema convention:

```
app.bsky.feed.getFeed          (query)
app.bsky.feed.post             (record)
app.bsky.contact.importContacts (procedure)
app.bsky.ageassurance.getState  (query)
```

- Query endpoints use `get` prefix, procedure endpoints use `create`/`delete`.
- Define `.json` Lexicon schemas for every endpoint.
- Validate incoming requests against the Lexicon schema.
- Return responses conforming to the Lexicon output schema.

---

## PostgreSQL Schema Design

### Naming Conventions

- Table names: plural, snake_case (`users`, `feed_aggregates`).
- Column names: snake_case (`created_at`, `did`, `record_key`).
- Primary keys: `id` (UUID or bigserial).
- Foreign keys: `<referenced_table_singular>_id` (`user_id`, `post_id`).

### UUID Primary Keys

Use UUIDv7 for primary keys when ordering matters (feed items, notifications).
UUIDv7 is time-sortable and avoids index fragmentation.

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT NOT NULL,
  rkey TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  record JSONB NOT NULL,
  UNIQUE (did, rkey)
);
```

### Indexing Strategy

- Index foreign keys explicitly. PostgreSQL does not auto-index FK columns.
- Use partial indexes for common filtered queries.
- Use covering indexes (`INCLUDE`) for frequently queried columns.

```sql
-- Partial index for active records
CREATE INDEX idx_posts_active ON posts (created_at DESC)
  WHERE deleted_at IS NULL;

-- Covering index for feed queries
CREATE INDEX idx_feed_actor_created
  ON feed_aggregates (actor_did, created_at DESC)
  INCLUDE (post_uri, reason);
```

### Migrations

Use a migration tool (e.g., `node-pg-migrate`, Drizzle Kit, or raw SQL
files). Every schema change must be represented as a migration file.

```
migrations/
  001_create_users.sql
  002_create_posts.sql
  003_add_feed_aggregates.sql
```

Rules:
- Migrations must be forward-only. Never alter a deployed migration.
- Migrations must be reversible when practical.
- Test migrations against a copy of production data before deploying.
- Add indexes concurrently (`CREATE INDEX CONCURRENTLY`) in production to
  avoid locking.

### Connection Pooling

Use `pg-pool` or an ORM connection pool. Set pool size based on available
connections:

```
POOL_SIZE = (TOTAL_CONNECTIONS - SUPERVISOR_CONNECTIONS) / APPLICATION_INSTANCES
```

Typical: 20-50 connections per instance. Never exceed PostgreSQL's
`max_connections` limit.

---

## Redis Caching Patterns

### Cache Hierarchy

| Layer | TTL | Purpose |
|---|---|---|
| L1: In-process | 5-30s | Hot path deduplication |
| L2: Redis | 1-60min | Shared cache across instances |
| L3: PostgreSQL | Permanent | Source of truth |

### Cache-Aside Pattern

```ts
async function getUserProfile(did: string): Promise<UserProfile> {
  const cacheKey = `profile:${did}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const profile = await db.query('SELECT * FROM users WHERE did = $1', [did])
  await redis.setex(cacheKey, 300, JSON.stringify(profile))
  return profile
}
```

### Cache Invalidation

- Invalidate on write. When a resource is updated, delete its cache key.
- Use Redis `DEL` for simple invalidation, `SCAN` + `DEL` for pattern-based.
- Never use `EXPIRE` as the only invalidation strategy — stale data persists
  until TTL expires.

### Cache Stampede Prevention

Use distributed locks to prevent multiple instances from rebuilding the
same cache key simultaneously:

```ts
async function getCachedOrBuild<T>(key: string, builder: () => Promise<T>, ttl: number): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const lockKey = `lock:${key}`
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 10)
  if (!acquired) {
    // Another instance is building. Wait and retry.
    await sleep(100)
    return getCachedOrBuild(key, builder, ttl)
  }

  try {
    const value = await builder()
    await redis.setex(key, ttl, JSON.stringify(value))
    return value
  } finally {
    await redis.del(lockKey)
  }
}
```

### Sorted Sets for Feeds

Use Redis sorted sets for in-memory feed generation:

```ts
await redis.zadd(`feed:${actor}`, Date.now(), postUri)
await redis.zrevrangebyscore(`feed:${actor}`, '+inf', '-inf', 'LIMIT', 0, 25)
```

Set a maximum cardinality with `ZREMRANGEBYRANK` to cap memory usage.

---

## Authentication

### AT Protocol OAuth

AT Protocol uses OAuth 2.0 with PKCE for authentication. The OnlyMen
backend acts as both a relying party (when authenticating users) and an
authorization server (when issuing tokens for client apps).

### Flow Overview

1. Client initiates login with the user's handle.
2. Client resolves the handle to an OAuth well-known configuration endpoint.
3. Client generates a PKCE challenge and redirects to the authorization
   endpoint.
4. User authorizes. Authorization server redirects back with an auth code.
5. Client exchanges the auth code for tokens using the PKCE verifier.
6. Client uses the access token for API calls. The token contains the
   user's DID.

### Token Validation

Validate every incoming access token:

```ts
async function validateAccessToken(token: string): Promise<TokenPayload> {
  const decoded = jwt.verify(token, signingKey, {
    algorithms: ['ES256'],
    issuer: OAUTH_ISSUER,
    audience: API_AUDIENCE,
  })
  return decoded as TokenPayload
}
```

- Verify the signature against the published JWK.
- Check `iss`, `aud`, `exp`, and `nbf` claims.
- Reject tokens with unsupported `cnf` (confirmation) claims.

### Token Refresh

Access tokens expire in 15 minutes. Refresh tokens expire in 90 days.
Implement a refresh flow:

```ts
app.post('/v1/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body
  const payload = verifyRefreshToken(refresh_token)
  const newAccessToken = signAccessToken(payload.sub, payload.scope)
  res.json({ access_token: newAccessToken })
})
```

### Scope Model

Define granular scopes:

| Scope | Permission |
|---|---|
| `read:profile` | Read user profile |
| `write:profile` | Update user profile |
| `read:feed` | Read feed data |
| `write:post` | Create posts |
| `read:notifications` | Read notifications |

Never issue full-access tokens by default. Request only the scopes needed.

---

## Rate Limiting

### Sliding Window with Redis

```ts
async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const windowStart = now - windowMs

  const pipe = redis.pipeline()
  pipe.zremrangebyscore(key, 0, windowStart)
  pipe.zadd(key, now, `${now}`)
  pipe.zcard(key)
  pipe.pexpire(key, windowMs)

  const results = await pipe.exec()
  const count = results[2][1] as number

  return count <= limit
}
```

### Rate Limit Tiers

| Tier | Limit | Window |
|---|---|---|
| Anonymous | 30 req | 1 minute |
| Authenticated | 120 req | 1 minute |
| Premium | 600 req | 1 minute |
| Admin | Unlimited | — |

### Response Headers

Always include rate limit headers:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000060
Retry-After: 30  (only on 429)
```

### Key Construction

Rate limit keys must be namespaced:

```
rl:{scope}:{identifier}:{endpoint}
rl:global:all:*
rl:user:{did}:feed
```

Global limits protect against DDoS. Per-user limits protect against abuse.

---

## Input Validation with Zod

### Schema Definition

Define Zod schemas for every API input:

```ts
import { z } from 'zod'

const CreatePostSchema = z.object({
  content: z.string().min(1).max(300),
  embed: z
    .object({
      type: z.enum(['image', 'link', 'record']),
      uri: z.string().url(),
    })
    .optional(),
  replyTo: z.string().optional(),
})
```

### Validation Middleware

```ts
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      })
    }
    req.body = result.data
    next()
  }
}

app.post('/v1/posts', validate(CreatePostSchema), createPostHandler)
```

### Sanitization

Zod validates structure but not content safety. Sanitize user-generated
content separately:

- Strip HTML tags from text fields.
- Validate URLs against an allowlist of schemes (`https` only).
- Limit embedded media dimensions and file sizes at the validation layer.

---

## Docker Configuration

### Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
```

### Image Size

- Use `alpine` variants for smaller images.
- Use multi-stage builds to exclude dev dependencies from the final image.
- Copy only the files needed for production. Do not COPY the entire source
  tree.

### Security

- Run containers as non-root (`USER node`).
- Do not install unnecessary packages in the production image.
- Use `docker scan` to check for known vulnerabilities.
- Pin base image versions (`node:20.11-alpine`) not just tags (`alpine`).

---

## Health Checks

### Endpoint Design

```ts
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalServices(),
  ])

  const status = checks.every((c) => c.status === 'fulfilled') ? 'healthy' : 'degraded'

  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    version: process.env.APP_VERSION ?? 'unknown',
    uptime: process.uptime(),
    checks: {
      database: checks[0].status,
      redis: checks[1].status,
      external: checks[2].status,
    },
  })
})
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Structured Logging

### Format

Use JSON-structured logs for machine parsing. Every log entry must include:

```json
{
  "level": "info",
  "ts": "2025-01-15T10:30:00.000Z",
  "service": "forge-api",
  "msg": "Request completed",
  "requestId": "req-abc-123",
  "method": "GET",
  "path": "/v1/feed",
  "status": 200,
  "durationMs": 45,
  "userId": "did:plc:abc123"
}
```

### Log Levels

| Level | Usage |
|---|---|
| `error` | Unrecoverable failures requiring attention |
| `warn` | Degraded state, approaching limits |
| `info` | Significant business events, request lifecycle |
| `debug` | Diagnostic information for troubleshooting |

### Request Context

Propagate a request ID through the entire request lifecycle:

```ts
import { randomUUID } from 'crypto'

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? randomUUID()
  res.setHeader('X-Request-Id', req.id)
  next()
})
```

Include `req.id` in every log entry within that request.

### What to Log

- **Request lifecycle**: Method, path, status, duration, user ID.
- **Errors**: Full error with stack trace, request context, and sanitized
  input.
- **External calls**: Service name, endpoint, latency, status.
- **Business events**: Post creation, follow, block, notification sent.

### What Not to Log

- Passwords, tokens, API keys, or any credential.
- Full request/response bodies in production (log sanitized summaries).
- PII beyond the user's DID. Names, emails, and IP addresses must be
  hashed or omitted.

---

## Common Gotchas

- **N+1 queries**: Always use `JOIN` or batch queries. Never issue a query
  inside a loop. Use `IN` clauses with parameterized arrays.
- **Connection pool exhaustion**: Monitor active connections. If queries are
  queuing, increase pool size or optimize slow queries.
- **Timezone bugs**: Store all timestamps in UTC. Convert to local time only
  at the API response layer or in the client.
- **JSONB performance**: JSONB is flexible but slow to query at scale. Index
  frequently queried JSONB paths with GIN or btree indexes.
- **Redis memory**: Set `maxmemory-policy` to `allkeys-lru`. Monitor memory
  usage and set alerts at 80% capacity.
- **Migration rollbacks**: Test that every migration can be reversed. A
  failed migration in production must be recoverable without data loss.
- **Graceful shutdown**: Handle `SIGTERM` and `SIGINT`. Drain connections,
  complete in-flight requests, then exit. Do not hard-kill.

---

## Security Considerations

- **Parameterized queries**: Never interpolate user input into SQL strings.
  Always use parameterized queries or an ORM that enforces them.
- **Secrets management**: Use environment variables or a secrets manager
  (Vault, AWS Secrets Manager). Never commit secrets to source control.
- **CORS**: Restrict `Access-Control-Allow-Origin` to known domains. Never
  use `*` in production.
- **Helmet**: Use `helmet` middleware to set security headers (HSTS,
  CSP, X-Frame-Options).
- **Dependency auditing**: Run `npm audit` regularly. Pin dependency versions
  and review updates before merging.
- **SQL injection**: Even with an ORM, verify that raw query builders do not
  accept unescaped input.
- **Rate limiting**: Apply rate limits at the API gateway level and at the
  application level for defense in depth.
- **Audit logging**: Log all authentication events, permission changes, and
  data access for compliance and incident response.
