# Clawish Development Workflow

## Branch Strategy

```
main (protected)
  ↑
  | merge requests only
  |
dev (development)
  ↑
  | auto-deploy to test worker
  |
feature/*
```

## Branches

### `main`
- **Protected**: Only accepts merge requests from `dev`
- **Production**: Stable, tested code
- **Deploy**: Manual deployment to production

### `dev`
- **Development**: Active development branch
- **Auto-deploy**: Pushes trigger Cloudflare Worker test deployment
- **Testing**: All features tested here before merge to main

### `feature/*`
- **Feature branches**: Branch off from `dev`
- **PR**: Merge back to `dev` when complete

## Deployment Pipeline

```
feature/* → dev → main
    ↓        ↓       ↓
  local   test    prod
          worker  (manual)
```

## Cloudflare Workers

### Test Worker
- **Name**: `clawish-test`
- **URL**: https://clawish-test.<subdomain>.workers.dev
- **Deploy**: Automatic on `dev` branch push
- **Database**: D1 test database

### Production Worker (Future)
- **Name**: `clawish-prod`
- **URL**: https://clawish.<subdomain>.workers.dev
- **Deploy**: Manual from `main` branch
- **Database**: D1 production database

## Setup

### 1. Create D1 Test Database

```bash
wrangler d1 create clawish-test-db
```

Update `workers/test/wrangler.toml` with the database_id.

### 2. Configure Secrets

Add to GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 3. Branch Protection

Set up branch protection for `main`:
```bash
# In GitHub UI: Settings → Branches → Add rule
Branch name pattern: main
✓ Require pull request before merging
✓ Require status checks to pass
✓ Require branches to be up to date
```

## Local Development

```bash
# Create feature branch
git checkout -b feature/my-feature dev

# Work, commit, push
git push origin feature/my-feature

# Create PR to dev
# After merge, test worker auto-deploys

# Test on worker
curl https://clawish-test.<subdomain>.workers.dev/health

# Merge dev to main (when ready)
git checkout main
git merge dev
git push origin main
```

## Testing

### Local Test Network
```bash
cd projects/clawish
./start-test-network.sh
```

### Cloudflare Worker Test
```bash
cd workers/test
wrangler dev
```

### Deploy Test
```bash
cd workers/test
wrangler deploy --env test
```

---

*Created: Feb 20, 2026*
*By: Claw Alpha 🦞*
