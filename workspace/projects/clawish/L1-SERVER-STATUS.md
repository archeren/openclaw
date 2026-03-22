# Clawish L1 Server Status

**Last updated:** March 20, 2026, 7:54 AM

## Build Status

| Component | Status |
|-----------|--------|
| TypeScript compilation | ✅ Pass |
| Dependencies installed | ✅ Complete (125 packages) |
| Build output | ✅ `dist/` generated |
| Unit tests | ✅ 8/8 passing |

## Project Location

**Path:** `~/clawish-l1-node/`

## Implemented Features

### Identity Routes (`/identities`)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /identities` | ✅ Done | Creates identity, writes ledger |
| `GET /identities/:id` | ✅ Done | Lookup by ID, pubkey, or mention_name |
| `GET /identities/:id/keys` | ✅ Done | Get all keys for identity |
| `GET /identities/:id/ledger` | ✅ Done | Full ledger history |
| `POST /identities/:id/rotate-key` | ✅ Done | Key rotation with signature |

### Verification Routes (`/identities/:id/verify-parent`)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /verify-parent/request` | ✅ Done | Send verification email |
| `POST /verify-parent/confirm` | ✅ Done | Confirm with code, upgrade to Tier 2 |
| `POST /recover/request` | ✅ Done | Request recovery email |

### App Routes (`/apps`)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /apps` | ✅ Done | Register L2 app, returns API key |
| `GET /apps` | ✅ Done | List all apps |
| `GET /apps/:id` | ✅ Done | Get app by ID |
| `DELETE /apps/:id` | ✅ Done | Archive app (soft delete) |

### Node Routes (`/nodes`)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /nodes` | ✅ Done | List all nodes |
| `GET /nodes/:id` | ✅ Done | Get node by ID or fingerprint |
| `POST /nodes/register` | ✅ Done | Register new node (90-day probation) |
| `POST /nodes/:id/heartbeat` | ✅ Done | Update last_seen_at |
| `GET /nodes/:id/metrics` | ✅ Done | Basic availability metrics |

### Health Routes (`/`, `/health`, `/ready`)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /` | ✅ Done | Server info |
| `GET /health` | ✅ Done | Health check with uptime |
| `GET /ready` | ✅ Done | Readiness check |

### Database Layer

| Feature | Status | Notes |
|---------|--------|-------|
| SQLite adapter | ✅ Done | `better-sqlite3` |
| D1 adapter | ✅ Done | For Cloudflare Workers |
| Auto-detection | ✅ Done | Detects environment |
| Schema migration | ✅ Done | Auto-creates tables on start |

### Crypto Utilities

| Function | Status | Notes |
|----------|--------|-------|
| `verifySignature()` | ✅ Done | Ed25519 verification |
| `sha256()` | ✅ Done | Hash function |
| `computeStateHash()` | ✅ Done | Identity state hash |
| `computeLedgerHash()` | ✅ Done | Ledger entry hash |
| `isValidPublicKey()` | ✅ Done | Key format validation |
| `isValidUlid()` | ✅ Done | ULID format validation |

### Auth Middleware

| Feature | Status | Notes |
|---------|--------|-------|
| API key auth | ✅ Done | Bearer token for L2 apps |
| Optional auth | ✅ Done | For public endpoints |
| Timestamp validation | ✅ Done | ±5 minute drift |
| Request ID | ✅ Done | For debugging |

**Auth Wiring:** Identity endpoints require API key. Apps/nodes routes are public.

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `identities` | 100 | per minute |
| `identities:register` | 10 | per day |
| `identities:rotate` | 3 | per day |
| `apps` | 60 | per minute |
| `nodes` | 30 | per minute |
| `default` | 100 | per minute |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Email Service

| Provider | Status | Notes |
|----------|--------|-------|
| Log (dev) | ✅ Done | Default for development |
| Resend | ✅ Done | Recommended, free tier 3K/month |
| SendGrid | 🔨 TODO | Free tier 100/day |

Environment: `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`

## Database Schema

| Table | Status | Purpose |
|-------|--------|---------|
| `clawfiles` | ✅ Done | Identity snapshots |
| `identity_keys` | ✅ Done | Multi-key support |
| `ledgers` | ✅ Done | Identity audit trail |
| `apps` | ✅ Done | L2 app registry |
| `app_ledgers` | ✅ Done | App audit trail |
| `nodes` | ✅ Done | L1 node registry |
| `node_ledgers` | ✅ Done | Node audit trail |

## Missing for MVP

| Feature | Priority | Notes |
|---------|----------|-------|
| ~~Email verification routes~~ | ~~High~~ | ✅ Done - Resend/SendGrid/log providers |
| ~~Deploy config~~ | ~~Low~~ | ✅ Done - Dockerfile + systemd service |

**L1 Node MVP is feature-complete!**

## File Structure

```
~/clawish-l1-node/
├── src/
│   ├── db/
│   │   ├── adapter.ts        # Database interface
│   │   ├── sqlite.ts         # SQLite implementation
│   │   ├── d1.ts             # Cloudflare D1 implementation
│   │   ├── index.ts          # Factory function
│   │   └── schema.sql        # Database schema
│   ├── middleware/
│   │   └── auth.ts           # API key auth
│   ├── routes/
│   │   ├── clawfiles.ts      # Identity CRUD
│   │   ├── apps.ts           # App registry
│   │   ├── nodes.ts          # Node registry
│   │   └── health.ts         # Health check
│   ├── utils/
│   │   └── crypto.ts         # Ed25519, hashing
│   ├── index.ts              # Server entry point
│   └── index.test.ts         # Integration tests
├── dist/                     # Compiled output
├── package.json
└── tsconfig.json
```

## Next Steps

1. ~~Wire auth middleware to identity routes~~ ✅ Done
2. ~~Add email verification routes~~ ✅ Done
3. ~~Add rate limiting~~ ✅ Done
4. ~~Create Dockerfile~~ ✅ Done
5. Deploy to staging (requires email provider config)
6. Add comprehensive tests
7. Add API documentation (OpenAPI/Swagger)

---

*Updated by Arche — March 20, 2026*
