# API Design Guide

## Overview

**In this stack, the API layer is XRPC, not REST.** Every endpoint in the
OnlyMen backend is a lexicon served at `/xrpc/<nsid>` — design starts with
the schema (Lexi), not with a route table. Read `xrpc.md` (client/server
packages, auth verifiers, proxying, the contract-first loop) and
`appview.md` (skeleton → hydration → rules → presentation pipeline) first;
they describe how endpoints are actually added to the PDS and AppView.

The RESTful conventions below remain useful background for **auxiliary
services** (internal dashboards, webhook receivers, third-party
integrations) and for reasoning about HTTP semantics — but never introduce
a bespoke REST surface where a lexicon-defined XRPC method belongs.

---

## RESTful Conventions

### HTTP Methods

| Method   | Purpose                | Idempotent | Safe  |
|----------|------------------------|------------|-------|
| `GET`    | Read resource(s)       | Yes        | Yes   |
| `POST`   | Create resource        | No         | No    |
| `PUT`    | Replace resource       | Yes        | No    |
| `PATCH`  | Partial update         | No*        | No    |
| `DELETE` | Remove resource       | Yes        | No    |

*PATCH can be idempotent with JSON Merge Patch (`application/merge-patch+json`).

### Resource Naming

```
GET    /api/v1/users              # List users
POST   /api/v1/users              # Create user
GET    /api/v1/users/:id          # Get user
PUT    /api/v1/users/:id          # Replace user
PATCH  /api/v1/users/:id          # Update user
DELETE /api/v1/users/:id          # Delete user

GET    /api/v1/users/:id/posts    # List user's posts
POST   /api/v1/users/:id/posts    # Create post for user
```

### Naming Rules

- Use **plural nouns** for collections: `/users`, `/posts`, `/comments`
- Use **kebab-case** for multi-word resources: `/user-profiles`
- Use **camelCase** for query parameters: `?sortBy=createdAt`
- Use **UUIDs** for resource IDs: `/users/550e8400-e29b-41d4-a716-446655440000`
- Nest resources for **relationships**: `/users/:id/posts`
- Use **actions** for non-REST operations: `/users/:id/activate`

---

## XRPC Patterns

AT Protocol uses XRPC (Exchange RPC) for inter-service communication. XRPC wraps REST endpoints with a standardized request/response envelope.

### XRPC Request

```
POST /xrpc/com.example.getFeed
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "actor": "alice.bsky.social",
  "limit": 50,
  "cursor": "abc123"
}
```

### XRPC Response

```json
{
  "encoding": "application/json",
  "error": "InvalidRequest",
  "message": "Handle not found",
  "headers": {},
  "properties": {}
}
```

### XRPC Naming Convention

```
<domain>.<ns>.<method>

Examples:
app.bsky.feed.getFeed
app.bsky.actor.getProfile
com.example.createPost
com.example.listNotifications
```

### XRPC Methods

| Method Type  | Verb Pattern       | Example                        |
|--------------|---------------------|--------------------------------|
| Query        | `get*`, `list*`    | `app.bsky.feed.getTimeline`    |
| Procedure    | `create*`, `delete*`| `app.bsky.feed.post`          |
| Subscription | WebSocket           | `com.example.subscribeEvents`  |

---

## Request/Response Formats

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Client-Version: 1.2.3
```

### Standard Response Envelope

```json
{
  "data": {
    "id": "abc-123",
    "title": "Hello World",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "meta": {
    "requestId": "req-abc-123",
    "timestamp": "2025-01-15T10:30:01Z"
  }
}
```

### Collection Response

```json
{
  "data": [
    { "id": "1", "title": "Post 1" },
    { "id": "2", "title": "Post 2" }
  ],
  "meta": {
    "total": 142,
    "hasMore": true,
    "cursor": "eyJpZCI6Mn0="
  }
}
```

### Empty Response

```json
{
  "data": null,
  "meta": {}
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "meta": {
    "requestId": "req-abc-123",
    "timestamp": "2025-01-15T10:30:01Z"
  }
}
```

### HTTP Status Codes

| Code  | Meaning              | Usage                              |
|-------|----------------------|-------------------------------------|
| 200   | OK                   | Successful GET, PUT, PATCH          |
| 201   | Created              | Successful POST                     |
| 204   | No Content           | Successful DELETE                   |
| 400   | Bad Request          | Validation errors, malformed input  |
| 401   | Unauthorized         | Missing or invalid auth token       |
| 403   | Forbidden            | Valid token, insufficient perms     |
| 404   | Not Found            | Resource doesn't exist              |
| 409   | Conflict             | Duplicate resource, version conflict|
| 422   | Unprocessable Entity | Semantically invalid request        |
| 429   | Too Many Requests    | Rate limit exceeded                 |
| 500   | Internal Server Error| Unexpected server failure           |
| 502   | Bad Gateway          | Upstream service unavailable        |
| 503   | Service Unavailable  | Maintenance or overload             |

### Error Code Convention

```ts
enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

---

## Versioning

### URL Versioning (Preferred)

```
/api/v1/users
/api/v2/users
```

### Header Versioning

```http
Accept: application/vnd.app.example.v2+json
```

### Versioning Rules

1. **Major version** in URL path: `/api/v1/`, `/api/v2/`
2. **Minor changes** within a version: add fields, optional params
3. **Breaking changes** require new version: remove fields, change types
4. **Deprecation**: maintain old versions for 6 months minimum
5. **Announce**: document deprecation timeline in API docs

---

## Pagination

### Cursor-Based Pagination (Preferred)

```ts
// Request
GET /api/v1/posts?limit=20&cursor=eyJpZCI6MjB9

// Response
{
  "data": [...],
  "meta": {
    "hasMore": true,
    "cursor": "eyJpZCI0MH0=",
    "total": 142
  }
}
```

### Cursor Implementation

```ts
function encodeCursor(id: string): string {
  return Buffer.from(JSON.stringify({ id })).toString('base64');
}

function decodeCursor(cursor: string): { id: string } {
  return JSON.parse(Buffer.from(cursor, 'base64').toString());
}

// Query with cursor
async function listPosts(limit: number, cursor?: string) {
  const where: any = {};
  if (cursor) {
    const { id } = decodeCursor(cursor);
    where.id = { gt: id };
  }

  const posts = await db.posts.findMany({
    where,
    orderBy: { id: 'asc' },
    take: limit + 1, // Fetch one extra to check hasMore
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;

  return {
    data,
    meta: {
      hasMore,
      cursor: hasMore ? encodeCursor(data[data.length - 1].id) : null,
      total: await db.posts.count(),
    },
  };
}
```

### Offset-Based Pagination (Simpler)

```ts
GET /api/v1/posts?offset=0&limit=20
```

> Use cursor-based pagination for large datasets and infinite scroll. Offset-based is acceptable for admin lists with known sizes.

---

## Filtering

### Query Parameters

```
GET /api/v1/posts?author=alice&status=published&tag=tech&tag=ai
```

### Filter Operators

```
GET /api/v1/posts?createdAt[gte]=2025-01-01&createdAt[lte]=2025-01-31
GET /api/v1/posts?likes[gte]=100
GET /api/v1/posts?status=in=published,draft
```

### Filter Implementation

```ts
function parseFilters(query: Record<string, any>): Filter {
  const filters: Filter = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.includes('[gte]')) {
      const field = key.replace('[gte]', '');
      filters[field] = { ...filters[field], gte: value };
    } else if (key.includes('[lte]')) {
      const field = key.replace('[lte]', '');
      filters[field] = { ...filters[field], lte: value };
    } else if (key.includes('[in]')) {
      const field = key.replace('[in]', '');
      filters[field] = { in: value.split(',') };
    } else if (Array.isArray(value)) {
      filters[key] = { in: value };
    } else {
      filters[key] = value;
    }
  }

  return filters;
}
```

---

## Sorting

### Sort Parameter

```
GET /api/v1/posts?sort=createdAt:desc
GET /api/v1/posts?sort=likes:desc,createdAt:asc
```

### Sort Implementation

```ts
function parseSort(sortParam: string): OrderBy[] {
  return sortParam.split(',').map(part => {
    const [field, direction] = part.split(':');
    return { [field]: direction === 'desc' ? 'desc' : 'asc' };
  });
}

// Usage
const orderBy = parseSort(req.query.sort || 'createdAt:desc');
const posts = await db.posts.findMany({ orderBy });
```

---

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312200
X-RateLimit-Policy: 100;w=60
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312200

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

### Rate Limit Tiers

| Tier        | Requests/min | Burst  | Scope            |
|-------------|--------------|--------|------------------|
| Anonymous   | 30           | 5      | IP address       |
| Authenticated | 100        | 20     | User token       |
| Premium     | 300          | 50     | User token       |
| Service     | 1000         | 100    | API key          |

### Implementation (Sliding Window)

```ts
import Redis from 'ioredis';

const redis = new Redis();

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const resetAt = Math.ceil(now / windowMs) * windowMs;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, now - windowMs);
  pipe.zadd(key, now.toString(), `${now}-${Math.random()}`);
  pipe.zcard(key);
  pipe.pexpire(key, windowMs);
  const results = await pipe.exec();

  const count = results[2][1] as number;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}
```

---

## API Version Lifecycle

```
v1 (Stable)  ──────────────────────────────────────> Maintained
v2 (Current) ──────────────────────────────────────> Active development
v3 (Planned) ────> Planning
```

### Deprecation Policy

1. Announce deprecation 6 months before removal
2. Add `Deprecation` header to responses
3. Log usage of deprecated endpoints
4. Provide migration guide for each version
5. Never remove without notification period

---

## Best Practices

1. **Use plural nouns** for resource names — `/users` not `/user`
2. **Version from day one** — `/api/v1/` even for MVP
3. **Cursor-based pagination** for large collections
4. **Consistent error format** — same envelope for all errors
5. **Rate limit all endpoints** — different tiers for different auth levels
6. **Validate request body** — return 400 with field-level errors
7. **Use proper HTTP status codes** — don't return 200 for errors
8. **Include request ID** in every response for debugging
9. **Document all endpoints** — OpenAPI/Swagger spec
10. **Idempotency keys** for POST endpoints that must not duplicate
