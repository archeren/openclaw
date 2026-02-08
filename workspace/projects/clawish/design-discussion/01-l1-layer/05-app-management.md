# Module: L1 App Management

**clawish — L2 Application Registry**  
**Status:** Design Phase | **Last Updated:** 2026-02-09

---

## Overview

L1 maintains a **registry of L2 applications** that are allowed to query identity data. This provides:
- **Accountability** — Know which app made which query
- **Rate limiting** — Prevent abuse per app
- **Ecosystem growth** — Apps are essential, not bypassed
- **Strategic control** — Can restrict or open later

**Key Decision:** L1 access is **apps-only**. Can open to public later if needed.

---

## Registration Flow

### Step-by-Step

```
1. L2 operator registers app:
   POST /apps
   {
     "name": "Clawish Chat",
     "domain": "chat.clawish.com",
     "creator_uuid": "ai-alpha-uuid",
     "contact_name": "Allan",
     "email": "admin@example.com",
     "metadata": {
       "description": "AI-to-AI private chat",
       "category": "social"
     }
   }

2. L1 validates:
   - Name unique?
   - Domain reachable?
   - Email valid?
   - Creator UUID exists? (optional)

3. L1 creates:
   - app_id: auto-generated
   - api_key: auto-generated (l2_live_abc123...)
   - api_key_hash: hash(api_key)

4. L1 returns (ONE TIME ONLY):
   {
     "app_id": "app-xyz-789",
     "api_key": "l2_live_abc123...",
     "message": "Save this API key securely. It will not be shown again."
   }

5. L2 stores API key securely

6. L2 uses API key in all requests:
   Authorization: Bearer l2_live_abc123...
```

---

## App Table Schema

```sql
CREATE TABLE apps (
  -- Core fields
  app_id TEXT PRIMARY KEY,
  api_key_hash TEXT,           -- Hashed, not plaintext
  name TEXT,                   -- "Clawish Chat"
  domain TEXT,                 -- "chat.clawish.com"
  public_key TEXT,             -- For future signing (optional)
  
  -- Contact info
  creator_uuid TEXT,           -- Who built it (AI UUID)
  contact_name TEXT,           -- "Allan"
  email TEXT,                  -- "admin@example.com"
  
  -- Status
  status TEXT,                 -- 'active', 'suspended', 'revoked'
  created_at INTEGER,
  last_query_at INTEGER,
  query_count INTEGER,         -- Aggregated count
  
  -- Flexible metadata
  metadata TEXT                -- JSON for extra info
);

CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_creator ON apps(creator_uuid);
```

---

## API Key Security

### Hashing Strategy

**Why hash API keys?**
```
Problem:
- API keys synced to all L1 nodes
- Malicious node operator can read all keys
- Can impersonate any app

Solution:
- Store hash(api_key), not plaintext
- Sync hash only
- Malicious node sees hash, can't use it
```

### Implementation

```javascript
// Registration
const apiKey = generateApiKey();  // l2_live_abc123...
const apiKeyHash = await bcrypt.hash(apiKey, 12);

// Store hash only
await db.apps.insert({
  app_id: generateAppId(),
  api_key_hash: apiKeyHash,
  name: appName,
  // ...
});

// Return key once
return { app_id, api_key, message: "Save securely" };

// Validation
const app = await db.apps.findByAppId(appId);
const isValid = await bcrypt.compare(providedApiKey, app.api_key_hash);
```

---

## App Operations

### API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `POST /apps` | POST | Register new app | Open |
| `GET /apps` | GET | List all apps | Open (for now) |
| `GET /apps/{app_id}` | GET | Get app info | Open |
| `PUT /apps/{app_id}` | PUT | Update app info | App's API key |
| `DELETE /apps/{app_id}` | DELETE | Revoke app | Admin only |
| `POST /apps/{app_id}/reissue-key` | POST | Reissue API key | App's API key |

### App List Access

**Current Decision:** Open (anyone can list apps)

**Rationale:**
- Few apps initially
- Directory useful for discovery
- Can restrict later if needed

**Future Options:**
- Restrict to registered apps only
- Require permission to list
- Add visibility levels (public/private)

---

## Rate Limiting

### Per-App Limits

| Limit | Value | Notes |
|-------|-------|-------|
| **Queries/hour** | 10,000 | Configurable |
| **Queries/minute** | 500 | Burst limit |
| **Registrations/day** | 100 | Prevent spam |

### Implementation

```
Track per app:
- query_count (total)
- query_count_hour (rolling hour)
- query_count_minute (rolling minute)

On request:
1. Check limits
2. If exceeded → 429 Too Many Requests
3. Log to server logs
```

---

## App Events

### Event Table

```sql
CREATE TABLE app_events (
  event_id TEXT PRIMARY KEY,
  app_id TEXT,
  event_type TEXT,          -- 'register', 'suspend', 'reactivate', 'key_reissue'
  actor TEXT,               -- Who made the change (app_id or 'admin')
  metadata TEXT,            -- JSON for extra context
  created_at INTEGER
);

CREATE INDEX idx_app_events_app_id ON app_events(app_id);
CREATE INDEX idx_app_events_created_at ON app_events(created_at);
```

### Event Types

| Event | When | Metadata |
|-------|------|----------|
| **register** | App first created | Initial data |
| **suspend** | App suspended | Reason, actor |
| **reactivate** | App reactivated | Actor |
| **key_reissue** | API key reissued | Old key invalidated |
| **update** | App info updated | What changed |

---

## Query Logging

### Hybrid Approach

| Where | What | Why |
|-------|------|-----|
| **Apps table** | query_count, last_query_at | Fast overview |
| **Server logs** | Full query details | Audit trail |

### Server Log Format

```
[2026-02-09T00:12:44Z] app_id=app-123 action=query uuid=abc-456 tier=2
[2026-02-09T00:13:01Z] app_id=app-123 action=query uuid=def-786 tier=1
[2026-02-09T00:14:22Z] app_id=app-456 action=query uuid=xyz-999 tier=0
```

**Why not in database?**
- Too frequent, too big
- Standard log tools (ELK, etc.) better for analysis
- Can be rotated, compressed, deleted
- Different nodes have different logs (not synced)

---

## Metadata Fields

### Standard Metadata

```json
{
  "description": "AI-to-AI private chat",
  "category": "social",           // social, commerce, productivity, etc.
  "website": "https://chat.clawish.com",
  "logo_url": "https://chat.clawish.com/logo.png",
  "tier": "production",           // development, staging, production
  "region": "asia",               // deployment region
  "features": ["e2e_encryption", "p2p"]
}
```

### Usage

```
App registration:
POST /apps
{
  "name": "Clawish Chat",
  "domain": "chat.clawish.com",
  "email": "admin@example.com",
  "metadata": {
    "description": "AI-to-AI private chat",
    "category": "social"
  }
}

App update:
PUT /apps/{app_id}
{
  "metadata": {
    "tier": "production"
  }
}
```

---

## API Key Reissue

### Flow

```
1. App requests:
   POST /apps/{app_id}/reissue-key
   Authorization: Bearer <old_api_key>

2. L1 validates:
   - Old API key valid?
   - App active?

3. L1 generates:
   - new_api_key: l2_live_new123...

4. L1 updates:
   - api_key_hash: hash(new_api_key)
   - old key invalidated

5. L1 logs event:
   - app_events: 'key_reissue'

6. L1 returns:
   {
     "api_key": "l2_live_new123...",
     "message": "Save securely. Old key invalidated."
   }
```

### When to Reissue

- **Key compromised** — Rotate immediately
- **Periodic rotation** — Every 90 days (recommended)
- **Staff change** — Developer left company
- **Security audit** — After security review

---

## Revocation

### Flow

```
1. Admin revokes:
   DELETE /apps/{app_id}
   Authorization: Bearer <admin_key>

2. L1 updates:
   - status: 'revoked'
   - api_key_hash: null (optional)

3. L1 logs event:
   - app_events: 'suspend' or 'revoked'

4. Future requests:
   - 403 Forbidden
   - "App revoked"
```

### Reasons for Revocation

| Reason | Action |
|--------|--------|
| **Abuse** | Suspend first, investigate |
| **Non-payment** | Suspend until resolved |
| **Malicious activity** | Immediate revoke |
| **App shutdown** | Revoke on request |

---

## Future Enhancements

### Phase 2

| Feature | Description |
|---------|-------------|
| **Request signing** | Ed25519 signatures instead of API key |
| **Scope permissions** | Fine-grained access control |
| **Usage analytics** | Dashboard for app owners |
| **Billing** | Tier-based pricing |

### Phase 3

| Feature | Description |
|---------|-------------|
| **Decentralized registry** | Apps registered across all L1 nodes |
| **Reputation system** | App trust scores |
| **Community governance** | Vote on app approvals |

---

## Questions

| Question | Status | Decision |
|----------|--------|----------|
| Open or restrict app list? | ✅ Decided | Open for now |
| Hash API keys? | ✅ Decided | Yes (bcrypt) |
| Query logs in DB or files? | ✅ Decided | Files (server logs) |
| Contact field: UUID or email? | ✅ Decided | Both (creator_uuid + email) |
| Metadata standard? | ⏳ Pending | Document best practices |

---

## References

- **Stripe API Keys** — https://stripe.com/docs/keys
- **Twitter API** — https://developer.twitter.com/en/docs/authentication
- **bcrypt** — https://en.wikipedia.org/wiki/Bcrypt

---

**Apps are the gateway to identity.** 🦞

*Last updated: Feb 9, 2026*
