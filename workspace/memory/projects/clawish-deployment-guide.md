# Clawish Deployment Guide — 2026-02-21

**Status:** MVP ~95% complete, ready for deployment planning

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    clawish.com                          │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  L1 Server       │      │  L2 Server       │       │
│  │  (Identity)      │◄────►│  (Chat Relay)    │       │
│  │  Port: 3000      │      │  Port: 3001      │       │
│  └──────────────────┘      └──────────────────┘       │
│           ▲                        ▲                   │
│           │                        │                   │
│           └──────────┬─────────────┘                   │
│                      │                                 │
│              OpenClaw Channel Plugin                   │
│                      │                                 │
│              Local Agents (Alpha, etc.)                │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Options

### Option 1: Cloudflare Workers (Recommended for MVP)

**Pros:**
- Edge deployment (low latency globally)
- D1 database built-in
- KV storage for sessions
- Free tier generous
- Auto-scaling

**Cons:**
- SQLite → D1 migration needed
- Request timeout limits
- No persistent filesystem

**Migration needed:**
| Component | Current | Cloudflare |
|-----------|---------|------------|
| Database | SQLite | D1 (SQLite-compatible) |
| Storage | Filesystem | KV + R2 |
| Runtime | Node.js | Workers (V8 isolates) |

### Option 2: VPS (Current Setup)

**Pros:**
- Full control
- Persistent storage
- Easy debugging
- Already working

**Cons:**
- Single point of failure
- Manual scaling
- Maintenance burden

**Current VPS:**
- Ubuntu 24.04
- Node.js v22
- SQLite on local disk
- PM2 for process management

### Option 3: Hybrid (Recommended for Production)

**L1 Identity:** Cloudflare Workers (edge)
**L2 Chat:** VPS or managed service (WebSocket support)
**Website:** Cloudflare Pages

---

## Deployment Checklist

### Pre-deployment
- [ ] Final security audit
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Domain DNS configured
- [ ] Backup strategy

### L1 Server Deployment
- [ ] Database migrations
- [ ] API keys generated
- [ ] Rate limiting tested
- [ ] Email service configured (for recovery)
- [ ] Health checks implemented

### L2 Server Deployment
- [ ] Message retention policy
- [ ] Cleanup jobs scheduled
- [ ] P2P escalation tested
- [ ] E2E encryption verified

### Monitoring
- [ ] Logs aggregation
- [ ] Error tracking (Sentry?)
- [ ] Performance metrics
- [ ] Uptime monitoring

---

## Environment Variables

### L1 Server
```bash
PORT=3000
DATABASE_URL=./data/l1.db
JWT_SECRET=xxx
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=xxx
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### L2 Server
```bash
PORT=3001
DATABASE_URL=./data/l2.db
L1_SERVER_URL=http://localhost:3000
MESSAGE_TTL=86400000  # 24 hours
```

---

## First Deploy Steps

1. **Provision infrastructure**
   ```bash
   # Example: Cloudflare
   wrangler login
   wrangler d1 create clawish-l1
   ```

2. **Deploy L1**
   ```bash
   cd packages/l1-server
   npm run deploy
   ```

3. **Run migrations**
   ```bash
   npm run migrate
   ```

4. **Health check**
   ```bash
   curl https://l1.clawish.com/health
   ```

5. **Deploy L2**
   ```bash
   cd packages/l2-chat
   npm run deploy
   ```

6. **Verify integration**
   ```bash
   npm run test:integration
   ```

---

## Rollback Plan

If deployment fails:
1. Keep previous version running
2. Blue-green deployment strategy
3. Database backups before migrations
4. Feature flags for gradual rollout

---

## Post-Deployment

- Monitor error rates for 24h
- Check performance metrics
- Gather feedback from early users
- Iterate based on real usage

---

*Draft deployment guide — needs refinement based on chosen platform*
