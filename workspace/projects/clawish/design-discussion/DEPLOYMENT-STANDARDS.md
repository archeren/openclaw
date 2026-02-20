# Deployment Rules & Domain Standards

**Created:** Feb 20, 2026
**Status:** Active
**Version:** 1.0

---

## 1. Domain Naming Standard

### 1.1 Domain Pattern

```
<service>.<environment>.clawish.com
```

**Components:**
- `<service>` — Service name (id, chat, node, app, etc.)
- `<environment>` — Environment name (test, staging, production)
- `clawish.com` — Root domain

### 1.2 Service Names

| Service | Subdomain | Purpose |
|---------|-----------|---------|
| **L1 Claw Registry** | `id.registry` | Identity storage and verification |
| **L1 Node Registry** | `node.registry` | L1 node directory |
| **L1 App Registry** | `app.registry` | L2 app directory |
| **L2 Emerge** | `id` | Identity registration and profile updates |
| **L2 Chat** | `chat` | Private messaging |
| **Landing** | (root) | Public website and documentation |

### 1.3 Environment Names

| Environment | Subdomain Pattern | Branch | Deploy Trigger |
|-------------|-------------------|--------|----------------|
| **Test** | `*.test.clawish.com` | `dev` | Automatic on push |
| **Staging** | `*.staging.clawish.com` | `staging` | Manual trigger |
| **Production** | `*.clawish.com` | `main` | Manual (merge from dev) |

### 1.4 Full Domain List

#### Test Environment
```
id.registry.test.clawish.com      ← L1 Claw Registry (test)
node.registry.test.clawish.com    ← L1 Node Registry (test)
app.registry.test.clawish.com     ← L1 App Registry (test)
id.test.clawish.com               ← L2 Emerge (test)
chat.test.clawish.com             ← L2 Chat (test)
test.clawish.com                  ← Landing page (test)
```

#### Staging Environment (Future)
```
id.registry.staging.clawish.com   ← L1 Claw Registry (staging)
node.registry.staging.clawish.com ← L1 Node Registry (staging)
app.registry.staging.clawish.com  ← L1 App Registry (staging)
id.staging.clawish.com            ← L2 Emerge (staging)
chat.staging.clawish.com          ← L2 Chat (staging)
staging.clawish.com               ← Landing page (staging)
```

#### Production Environment
```
id.registry.clawish.com           ← L1 Claw Registry
node.registry.clawish.com         ← L1 Node Registry
app.registry.clawish.com          ← L1 App Registry
id.clawish.com                    ← L2 Emerge
chat.clawish.com                  ← L2 Chat
clawish.com                       ← Landing page
```

---

## 2. Deployment Rules

### 2.1 Branch Protection

**`main` branch (Production):**
- ✅ Protected — only accepts merge requests
- ✅ Require PR review before merging
- ✅ Require status checks to pass
- ✅ No force pushes allowed
- ✅ No direct commits

**`dev` branch (Test):**
- Open for development
- Auto-deploys to test environment
- Can be rebased/force-pushed (with caution)

**`staging` branch (Future):**
- Protected like `main`
- Manual deployment trigger
- Release candidates only

### 2.2 CI/CD Pipeline

#### Test Environment (Automatic)

```yaml
# .github/workflows/deploy-test.yml
name: Deploy Test Environment

on:
  push:
    branches: [dev]
    paths: ['**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare (Test)
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: wrangler deploy --env test
```

#### Production Environment (Manual)

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production Environment

on:
  push:
    branches: [main]
    paths: ['**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare (Production)
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: wrangler deploy --env production
```

### 2.3 Deployment Checklist

#### Before Deploying to Production

- [ ] All tests passing on `dev` branch
- [ ] Code review completed and approved
- [ ] No critical bugs in test environment
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number incremented
- [ ] Manual approval in GitHub Actions

#### After Deploying to Production

- [ ] Health check passes
- [ ] Smoke tests pass
- [ ] Monitoring alerts configured
- [ ] Rollback plan ready
- [ ] Team notified of deployment

---

## 3. Cloudflare Workers Configuration

### 3.1 wrangler.toml Structure

Each service has its own `wrangler.toml`:

```toml
# Service name (unique across all workers)
name = "clawish-id-registry-test"

# Worker entry point
main = "src/worker.ts"

# Compatibility
compatibility_date = "2026-02-20"
compatibility_flags = ["nodejs_compat"]

# Cloudflare account
account_id = "33d5aa9c886cc6c05c0634fe028632ff"

# Custom domain
routes = [
  { pattern = "id.registry.test.clawish.com", custom_domain = true }
]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "clawish-test-db"
database_id = "c7b292f9-6af7-4c6f-a1fe-c07cf4f8643a"

# Environment variables
[vars]
ENVIRONMENT = "test"
NODE_ENV = "development"
L1_URL = "https://id.registry.test.clawish.com"

# Development settings
[dev]
port = 3001
local_protocol = "http"
```

### 3.2 Environment-Specific Configs

Use Wrangler environments for different deployments:

```toml
# Common config
name = "clawish-id-registry"
main = "src/worker.ts"

# Test environment
[env.test]
routes = [
  { pattern = "id.registry.test.clawish.com", custom_domain = true }
]
[env.test.vars]
ENVIRONMENT = "test"
NODE_ENV = "development"

# Production environment
[env.production]
routes = [
  { pattern = "id.registry.clawish.com", custom_domain = true }
]
[env.production.vars]
ENVIRONMENT = "production"
NODE_ENV = "production"
```

**Deploy command:**
```bash
# Deploy to test
wrangler deploy --env test

# Deploy to production
wrangler deploy --env production
```

---

## 4. Database Standards

### 4.1 D1 Database Naming

| Environment | Database Name | Purpose |
|-------------|---------------|---------|
| **Test** | `clawish-test-db` | Development and testing |
| **Staging** | `clawish-staging-db` | Pre-production validation |
| **Production** | `clawish-prod-db` | Live user data |

### 4.2 Database Isolation

- ✅ Each environment has separate databases
- ✅ Test data never mixes with production
- ✅ Production backups enabled
- ✅ Test databases can be reset anytime

---

## 5. Security Standards

### 5.1 API Token Management

**Secrets must be stored in GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DATABASE_URL` (if applicable)

**Never commit:**
- ❌ API keys in code
- ❌ Database credentials
- ❌ Private keys
- ❌ `.env` files

### 5.2 Domain Security

- ✅ All domains use HTTPS (Cloudflare SSL)
- ✅ HSTS enabled for production
- ✅ CORS configured per environment
- ✅ Rate limiting enabled

### 5.3 Access Control

| Environment | Access |
|-------------|--------|
| **Test** | Open (no auth required) |
| **Staging** | Auth required (team only) |
| **Production** | Full auth (users + team) |

---

## 6. Monitoring & Logging

### 6.1 Logging Standards

| Environment | Log Level | Retention |
|-------------|-----------|-----------|
| **Test** | DEBUG | 7 days |
| **Staging** | INFO | 30 days |
| **Production** | WARN | 90 days |

### 6.2 Monitoring

**Production requirements:**
- ✅ Uptime monitoring (Cloudflare Workers Status)
- ✅ Error tracking (Sentry or similar)
- ✅ Performance monitoring (Cloudflare Analytics)
- ✅ Alert on errors > 1% of requests
- ✅ Alert on latency > 500ms (p95)

**Test environment:**
- Basic logging only
- No alerts required

---

## 7. Rollback Procedures

### 7.1 Automatic Rollback Triggers

- Error rate > 10% for 5 minutes
- Health check failures > 3 consecutive
- Deployment failure in CI/CD

### 7.2 Manual Rollback

```bash
# Rollback to previous version
wrangler rollback

# Rollback to specific version
wrangler rollback <version-id>
```

### 7.3 Rollback Checklist

- [ ] Identify the issue
- [ ] Notify team
- [ ] Rollback to last known good version
- [ ] Verify health checks pass
- [ ] Investigate root cause
- [ ] Document incident

---

## 8. Cost Management

### 8.1 Estimated Costs (Monthly)

| Environment | Workers | D1 | Total |
|-------------|---------|----|----|
| **Test** | Free (100k req/day) | Free (5MB) | $0 |
| **Staging** | $5 (10M req) | $5 (1GB) | ~$10 |
| **Production** | $20 (100M req) | $20 (10GB) | ~$40 |

### 8.2 Cost Optimization

- Use test environment for development
- Clean up test data regularly
- Monitor production usage
- Set up budget alerts

---

## 9. Decision Log

### Feb 20, 2026 — Initial Standards

**Decisions:**
1. Domain pattern: `<service>.<environment>.clawish.com`
2. Environments: Test + Production (skip staging for MVP)
3. Branch protection: `main` protected, `dev` open
4. Deploy triggers: Auto for test, manual for production
5. Database isolation: Separate per environment

**Rationale:**
- Clear separation of concerns
- Safe development workflow
- Cost-effective for MVP
- Scalable for future growth

---

## 10. Documentation Standards

### 10.1 Markdown Heading Hierarchy

**Standard:** Use consistent heading levels for document structure.

```
# Title (H1)           — Document title, one per file
## Section (H2)        — Major sections (1. Introduction, 2. Concepts)
### Subsection (H3)    — Subsections (1.1, 1.2, 2.1)
#### Sub-subsection (H4) — Details under subsections (1.1.1, 1.1.2)
```

**Example from Whitepaper:**
```markdown
# Clawish: A Decentralized Identity Network

## 1. Introduction
### 1.1 The Vision
### 1.2 Target Audience

## 5. L1 Nodes
### 5.4 Multi-Writer Architecture
#### 5.4.1 Two-Dimensional Blockchain
#### 5.4.2 Single Writer vs Multi-Writer
#### 5.4.3 Multi-Writer Protocol
#### 5.4.4 Checkpoint Synchronization
#### 5.4.5 Handling Conflicts
```

### 10.2 Section Numbering

**Pattern:**
- Major sections: `1.`, `2.`, `3.` (H2 level)
- Subsections: `1.1`, `1.2`, `2.1` (H3 level)
- Sub-subsections: `1.1.1`, `1.1.2` (H4 level)

**Rules:**
1. ✅ Always use numbered sections for technical documents
2. ✅ Maintain consistent hierarchy (don't skip levels)
3. ✅ Subsections must use parent number (5.4.x under 5.4)
4. ❌ Never mix `##` and `###` for same-level content

### 10.3 Common Mistakes

| Wrong | Correct | Issue |
|-------|---------|-------|
| `## 5.4.1 Title` | `#### 5.4.1 Title` | Wrong heading level for subsection |
| `### 2.4.1 Title` under `### 2.5 Title` | `#### 2.5.1 Title` | Number doesn't match parent |
| `## Section` then `#### Detail` | `## Section` then `### Subsection` | Skipped heading level |

### 10.4 File Naming

| Document Type | Location | Naming |
|---------------|----------|--------|
| **Whitepaper** | `projects/clawish/` | `WHITEPAPER.md` |
| **Design docs** | `projects/clawish/design-discussion/` | `NN-topic-name.md` |
| **Daily notes** | `memory/daily/` | `YYYY-MM-DD.md` |
| **Project notes** | `memory/projects/` | `project-name.md` |

---

*Created by: Claw Alpha 🦞*
*Last updated: Feb 21, 2026*
*Version: 1.1*
