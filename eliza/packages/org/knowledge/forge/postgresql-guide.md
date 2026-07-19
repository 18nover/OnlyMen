# PostgreSQL Guide

## Overview

This guide covers PostgreSQL schema design, indexing, migrations, connection pooling, query optimization, JSONB usage, full-text search, backups, and monitoring for production services.

---

## Schema Design

### Naming Conventions

| Object          | Convention              | Example                    |
|-----------------|-------------------------|----------------------------|
| Tables          | plural, snake_case      | `user_sessions`            |
| Columns         | snake_case              | `created_at`               |
| Primary Keys    | `id` (UUID)             | `id UUID PRIMARY KEY`      |
| Foreign Keys    | `<table>_id`            | `user_id UUID REFERENCES`  |
| Indexes         | `idx_<table>_<columns>` | `idx_posts_author_id`      |
| Unique Indexes  | `uniq_<table>_<columns>`| `uniq_users_email`         |
| Enums           | singular, snake_case    | `post_status`              |

### Base Schema Pattern

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Base table template
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle VARCHAR(253) NOT NULL,
  email VARCHAR(320) NOT NULL,
  display_name VARCHAR(64),
  avatar_url TEXT,
  bio VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uniq_users_handle UNIQUE (handle),
  CONSTRAINT uniq_users_email UNIQUE (email)
);

-- Soft delete pattern
CREATE INDEX idx_users_deleted_at ON users (deleted_at)
  WHERE deleted_at IS NULL;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Relationships

```sql
-- One-to-many
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(256) NOT NULL,
  body TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Enum type
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
```

---

## Indexing Strategies

### Index Types

| Type              | When to Use                          | Syntax                          |
|-------------------|--------------------------------------|---------------------------------|
| B-tree            | Equality, range, sort (default)      | `CREATE INDEX idx ON t (col)`   |
| Hash              | Equality only (faster than B-tree)   | `CREATE INDEX idx ON t USING hash (col)` |
| GIN               | Full-text search, JSONB, arrays      | `CREATE INDEX idx ON t USING gin (col)` |
| GiST              | Geospatial, range types              | `CREATE INDEX idx ON t USING gist (col)` |
| Partial           | Filtered subset                      | `CREATE INDEX idx ON t (col) WHERE condition` |
| Composite         | Multi-column queries                 | `CREATE INDEX idx ON t (a, b, c)` |
| Unique            | Enforce uniqueness                   | `CREATE UNIQUE INDEX idx ON t (col)` |
| Expression        | Computed values                      | `CREATE INDEX idx ON t (lower(col))` |

### Index Best Practices

```sql
-- Composite index for common query pattern
CREATE INDEX idx_posts_author_status_created
  ON posts (author_id, status, created_at DESC);

-- Partial index for active records only
CREATE INDEX idx_users_active
  ON users (id)
  WHERE deleted_at IS NULL;

-- Unique index for constraint enforcement
CREATE UNIQUE INDEX uniq_users_handle
  ON users (lower(handle));

-- JSONB index for field queries
CREATE INDEX idx_posts_metadata
  ON posts USING gin (metadata);

-- Expression index for search
CREATE INDEX idx_posts_title_trgm
  ON posts USING gin (title gin_trgm_ops);
```

### Index Monitoring

```sql
-- Find unused indexes
SELECT schemaname, relname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (sequential scans on large tables)
SELECT schemaname, relname, seq_scan, n_live_tup
FROM pg_stat_user_tables
WHERE seq_scan > 100 AND n_live_tup > 10000
ORDER BY seq_scan DESC;
```

---

## Migration Patterns

### Migration File Structure

```
migrations/
  001_create_users.sql
  002_create_posts.sql
  003_add_posts_metadata.sql
```

### Migration Template

```sql
-- Migration: 003_add_posts_metadata.sql
-- Created: 2025-01-15
-- Author: forge-agent

BEGIN;

-- Up migration
ALTER TABLE posts ADD COLUMN metadata JSONB DEFAULT '{}';
CREATE INDEX idx_posts_metadata ON posts USING gin (metadata);

COMMIT;
```

### Rollback Pattern

```sql
-- Rollback: 003_add_posts_metadata.sql
BEGIN;

DROP INDEX IF EXISTS idx_posts_metadata;
ALTER TABLE posts DROP COLUMN IF EXISTS metadata;

COMMIT;
```

### Migration Rules

1. **Always wrap in transactions** — `BEGIN` / `COMMIT`
2. **Never modify production data** in schema migrations
3. **Add columns as nullable** first, then backfill, then add constraints
4. **Create indexes CONCURRENTLY** to avoid table locks (PostgreSQL specific)
5. **Test rollbacks** — every up must have a matching down
6. **Version migrations** — sequential numbering, never reuse

```sql
-- Safe column addition
ALTER TABLE posts ADD COLUMN summary TEXT NULL;
-- Backfill data
UPDATE posts SET summary = left(body, 200) WHERE summary IS NULL;
-- Add NOT NULL constraint after backfill
ALTER TABLE posts ALTER COLUMN summary SET NOT NULL;
```

---

## Connection Pooling

### Why Connection Pooling

PostgreSQL creates a new process per connection (~10MB memory). Direct connections exhaust resources under load.

### PgBouncer Configuration

```ini
[databases]
onlymen = host=localhost port=5432 dbname=onlymen

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = md5
auth_file = /etc/pgbouncer/users.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
server_idle_timeout = 300
client_idle_timeout = 0
log_connections = 1
log_disconnections = 1
stats_period = 60
```

### Pool Modes

| Mode          | Behavior                                  | Use Case           |
|---------------|-------------------------------------------|---------------------|
| Session       | Connection held for entire session        | Prepared statements  |
| Transaction   | Released after each transaction (default) | Most applications    |
| Statement     | Released after each statement             | Simple queries only  |

### Application-Level Pooling

```ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
});

// Use pool for queries
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

---

## Query Optimization

### EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.*, u.handle as author_handle
FROM posts p
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 20;
```

### Common Optimization Patterns

```sql
-- Use LIMIT with indexed sort
SELECT * FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Use EXISTS instead of IN for subqueries
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM posts p WHERE p.author_id = u.id AND p.status = 'published'
);

-- Batch inserts
INSERT INTO posts (author_id, title, body, status)
VALUES
  ($1, $2, $3, $4),
  ($5, $6, $7, $8),
  ($9, $10, $11, $12);

-- Avoid N+1: use JOIN or batch loading
SELECT p.*, u.handle as author_handle
FROM posts p
JOIN users u ON u.id = p.author_id;
```

### Query Plan Analysis

| Operation     | What to Look For                          |
|---------------|-------------------------------------------|
| Seq Scan      | Bad on large tables → add index           |
| Index Scan    | Good — using index                        |
| Hash Join     | Good for equality joins                   |
| Nested Loop   | Good for small result sets                |
| Sort          | Bad if external → add index on sort column|
| Bitmap Scan   | Acceptable for medium selectivity         |

---

## JSONB Usage

### Schema Design

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(256) NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GIN index for general JSONB queries
CREATE INDEX idx_posts_metadata ON posts USING gin (metadata);

-- Specific path index for frequent queries
CREATE INDEX idx_posts_metadata_type
  ON posts USING btree ((metadata->>'type'));
```

### Query Patterns

```sql
-- Exact match
SELECT * FROM posts WHERE metadata @> '{"type": "article"}';

-- Key exists
SELECT * FROM posts WHERE metadata ? 'tags';

-- Array contains
SELECT * FROM posts WHERE metadata @> '{"tags": ["react"]}';

-- Path query
SELECT * FROM posts WHERE metadata->>'type' = 'article';

-- Nested path
SELECT * FROM posts WHERE metadata->'author'->>'name' = 'Alice';

-- JSONB aggregation
SELECT
  metadata->>'type' as post_type,
  COUNT(*) as count
FROM posts
GROUP BY metadata->>'type';
```

### Migration for JSONB Columns

```sql
-- Add JSONB column with default
ALTER TABLE posts ADD COLUMN metadata JSONB DEFAULT '{}';

-- Backfill from existing columns
UPDATE posts SET metadata = jsonb_build_object(
  'type', COALESCE(type, 'text'),
  'tags', COALESCE(tags, '[]'::jsonb)
);

-- Add NOT NULL after backfill
ALTER TABLE posts ALTER COLUMN metadata SET DEFAULT '{}';
```

---

## Full-Text Search

### Setup

```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add tsvector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Populate search vector
UPDATE posts SET search_vector =
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));

-- Create GIN index
CREATE INDEX idx_posts_search ON posts USING gin (search_vector);
```

### Trigger for Auto-Update

```sql
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.body, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search_vector
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### Search Queries

```sql
-- Full-text search with ranking
SELECT *, ts_rank(search_vector, query) as rank
FROM posts, plainto_tsquery('english', 'react typescript') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- Trigram similarity search
SELECT *, similarity(title, 'react tutorial') as sim
FROM posts
WHERE title % 'react tutorial'
ORDER BY sim DESC
LIMIT 10;
```

---

## Backup Strategies

### pg_dump (Logical Backup)

```bash
# Full backup
pg_dump -h localhost -U admin -Fc onlymen > backup_$(date +%Y%m%d).dump

# Schema only
pg_dump -h localhost -U admin --schema-only onlymen > schema.sql

# Single table
pg_dump -h localhost -U admin -t posts onlymen > posts.dump

# Restore
pg_restore -h localhost -U admin -d onlymen backup_20250115.dump
```

### Automated Backup Schedule

```bash
#!/bin/bash
# backup.sh — run via cron daily
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

pg_dump -h localhost -U admin -Fc onlymen | \
  gzip > "${BACKUP_DIR}/onlymen_${DATE}.dump.gz"

# Remove old backups
find "${BACKUP_DIR}" -name "*.dump.gz" -mtime +${RETENTION_DAYS} -delete
```

### Point-in-Time Recovery (WAL)

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'
max_wal_senders = 3
```

```bash
# Base backup
pg_basebackup -h localhost -U admin -D /backup/base -Fp -Xs -P

# Restore to specific time
recovery_target_time = '2025-01-15 10:30:00'
```

---

## Monitoring

### Key Metrics

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity
WHERE state = 'active' AND datname = 'onlymen';

-- Cache hit ratio (should be > 99%)
SELECT
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Table bloat
SELECT
  schemaname, relname,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 1) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Health Check Query

```sql
SELECT
  CASE WHEN pg_is_in_recovery() THEN 'replica' ELSE 'primary' END as role,
  now() - pg_postmaster_start_time() as uptime,
  (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_conns,
  pg_database_size('onlymen') as db_size;
```

---

## Best Practices

1. **Use UUIDs** for primary keys — avoid sequential IDs in distributed systems
2. **Always use transactions** for multi-statement operations
3. **Index foreign keys** — PostgreSQL doesn't auto-index FK columns
4. **Use connection pooling** — never connect directly in production
5. **Monitor slow queries** — enable `pg_stat_statements`
6. **JSONB for flexible data** — but normalize frequently queried fields
7. **Partial indexes** for filtered queries — save space and improve performance
8. **EXPLAIN ANALYZE** before deploying new queries
9. **Automated backups** with tested restore procedures
10. **VACUUM regularly** — monitor `n_dead_tup` and tune autovacuum settings
