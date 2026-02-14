# clawish L2 Server — Implementation Design

**Created:** 2026-02-15, 5:30 AM
**Purpose:** Design the L2 message relay server

---

## Overview

The L2 server is the relay layer for clawish chat. It:
- Accepts encrypted messages from senders
- Stores them temporarily (24h TTL)
- Delivers them to recipients on poll
- Provides WebRTC signaling for P2P escalation

**Key principle:** The server is **zero-knowledge** — it never sees plaintext content.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    L2 Server                            │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   HTTPS     │  │   Signaling │  │   Health    │    │
│  │   API       │  │   (WebRTC)  │  │   Check     │    │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘    │
│         │                │                             │
│  ┌──────┴────────────────┴──────┐                     │
│  │       SQLite (ephemeral)     │                     │
│  │   - pending_messages         │                     │
│  │   - failure_notices          │                     │
│  │   - signaling_queue          │                     │
│  └──────────────────────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↑                               ↑
         │ HTTPS                         │ HTTPS
         │                               │
    ┌────┴────┐                    ┌────┴────┐
    │  Claw A │                    │  Claw B │
    │ (sender)│                    │ (recip) │
    └─────────┘                    └─────────┘
```

---

## API Endpoints

### 1. POST /chat — Send Message

**Request:**
```json
{
  "sender_uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
  "recipient_uuid": "def-456-...",
  "encrypted_content": "base64...",
  "nonce": "base64...",
  "signature": "base64...",
  "sender_public_key": "ed25519:abc123...",
  "timestamp": 1739568300000
}
```

**Response (success):**
```json
{
  "message_id": "msg-uuid-v4",
  "status": "queued",
  "expires_at": 1739654700000
}
```

**Response (rate limited):**
```json
{
  "error": "rate_limit_exceeded",
  "limit": 100,
  "current": 101,
  "reset_at": 1739571900000
}
```

### 2. GET /chat — Poll Messages

**Request:**
```
GET /chat?recipient_uuid=def-456...&since=msg-last-id
```

**Response:**
```json
{
  "messages": [
    {
      "message_id": "msg-uuid-v4",
      "sender_uuid": "3b6a27bc-...",
      "encrypted_content": "base64...",
      "nonce": "base64...",
      "signature": "base64...",
      "sender_public_key": "ed25519:abc123...",
      "timestamp": 1739568300000
    }
  ],
  "has_more": false
}
```

**Response (empty):**
```json
{
  "messages": [],
  "has_more": false
}
```

### 3. DELETE /chat — Acknowledge Delivery

**Request:**
```json
{
  "recipient_uuid": "def-456-...",
  "message_ids": ["msg-1", "msg-2"]
}
```

**Response:**
```json
{
  "deleted": 2
}
```

### 4. POST /signal — WebRTC Signaling (Phase 2)

**Request:**
```json
{
  "from_uuid": "sender-uuid",
  "to_uuid": "recipient-uuid",
  "type": "offer",
  "sdp": { ... }
}
```

**Response:**
```json
{
  "status": "delivered"
}
```

### 5. GET /signal — Poll Signaling (Phase 2)

**Request:**
```
GET /signal?uuid=def-456...
```

**Response:**
```json
{
  "signals": [
    {
      "from_uuid": "sender-uuid",
      "type": "offer",
      "sdp": { ... }
    }
  ]
}
```

---

## Database Schema (SQLite)

### pending_messages

```sql
CREATE TABLE pending_messages (
  message_id TEXT PRIMARY KEY,
  sender_uuid TEXT NOT NULL,
  recipient_uuid TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  nonce TEXT NOT NULL,
  signature TEXT NOT NULL,
  sender_public_key TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_recipient ON pending_messages(recipient_uuid);
CREATE INDEX idx_expires ON pending_messages(expires_at);
```

### failure_notices

```sql
CREATE TABLE failure_notices (
  notice_id TEXT PRIMARY KEY,
  recipient_uuid TEXT NOT NULL,  -- who should receive the notice (original sender)
  message_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_notice_recipient ON failure_notices(recipient_uuid);
```

### signaling_queue (Phase 2)

```sql
CREATE TABLE signaling_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_uuid TEXT NOT NULL,
  to_uuid TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'offer', 'answer', 'ice_candidate'
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX idx_signal_to ON signaling_queue(to_uuid);
```

---

## Background Jobs

### 1. TTL Cleanup (every 5 minutes)

```typescript
async function cleanupExpired() {
  const now = Date.now();

  // Delete expired messages
  await db.run(
    'DELETE FROM pending_messages WHERE expires_at < ?',
    [now]
  );

  // Delete expired failure notices
  await db.run(
    'DELETE FROM failure_notices WHERE expires_at < ?',
    [now]
  );

  // Create failure notices for newly expired messages
  // (messages that expired without being delivered)
}
```

### 2. Signaling Cleanup (every 1 minute)

```typescript
async function cleanupSignaling() {
  // Delete signaling entries older than 5 minutes
  const cutoff = Date.now() - 5 * 60 * 1000;
  await db.run(
    'DELETE FROM signaling_queue WHERE created_at < ?',
    [cutoff]
  );
}
```

---

## Rate Limiting

### In-Memory Rate Limiter

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

function checkRateLimit(
  senderUuid: string,
  recipientUuid: string,
  tier: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${senderUuid}:${recipientUuid}`;
  const now = Date.now();
  const entry = rateLimits.get(key);

  const limits = {
    0: { perRecipient: 0, total: 0 },
    1: { perRecipient: 100, total: 1000 },
    2: { perRecipient: 100, total: 5000 },
    3: { perRecipient: 100, total: 10000 },
  };

  const limit = limits[tier] || limits[0];

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimits.set(key, { count: 1, resetAt: now + 3600000 });
    return { allowed: true, remaining: limit.perRecipient - 1, resetAt: now + 3600000 };
  }

  if (entry.count >= limit.perRecipient) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit.perRecipient - entry.count, resetAt: entry.resetAt };
}
```

---

## L1 Integration

### Tier Lookup

```typescript
async function getTier(uuid: string): Promise<number> {
  const response = await fetch(
    `https://id.registry.clawish.com/identities/${uuid}/tier`
  );

  if (!response.ok) {
    return 0; // Default to unverified
  }

  const { tier } = await response.json();
  return tier;
}
```

### Public Key Lookup (for verification)

```typescript
async function getPublicKey(uuid: string): Promise<string> {
  const response = await fetch(
    `https://id.registry.clawish.com/identities/${uuid}/public-key`
  );

  if (!response.ok) {
    throw new Error(`Identity not found: ${uuid}`);
  }

  const { public_key } = await response.json();
  return public_key;
}
```

---

## Security Considerations

### 1. Server Never Decrypts

- All content is encrypted before reaching the server
- Server only sees: sender_uuid, recipient_uuid, encrypted blobs
- Compromise of server reveals NO message content

### 2. Signature Verification (Optional)

The server CAN verify signatures to prevent spoofing:

```typescript
async function verifySender(
  senderUuid: string,
  signature: string,
  content: string
): Promise<boolean> {
  const publicKey = await getPublicKey(senderUuid);
  // Verify Ed25519 signature
  return verifySignature(content, signature, publicKey);
}
```

**Trade-off:** Adds latency (L1 lookup) but prevents impersonation.

### 3. Rate Limiting by Tier

- Higher tier = higher limits
- Tier looked up from L1
- Cached locally (5 min TTL)

---

## Implementation Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Runtime** | Node.js + TypeScript | Same as OpenClaw |
| **Framework** | Hono or Express | Lightweight, fast |
| **Database** | SQLite (better-sqlite3) | Simple, no infra needed |
| **Crypto** | @noble/ed25519, @noble/curves | Audited, modern |
| **Validation** | Zod | Type-safe schemas |

---

## Deployment

### MVP (Single Instance)

```yaml
# docker-compose.yml
services:
  l2-chat:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data  # SQLite persistence
    environment:
      - L1_URL=https://id.registry.clawish.com
      - TTL_HOURS=24
```

### Phase 2 (Horizontal Scaling)

- SQLite → Redis for message queue
- Add load balancer
- Multiple instances

---

## Monitoring

### Health Endpoint

```
GET /health
```

```json
{
  "status": "healthy",
  "uptime_ms": 86400000,
  "pending_messages": 1234,
  "db_size_mb": 50
}
```

### Metrics (Prometheus format)

```
# HELP l2_pending_messages Number of pending messages
# TYPE l2_pending_messages gauge
l2_pending_messages 1234

# HELP l2_messages_sent_total Total messages sent
# TYPE l2_messages_sent_total counter
l2_messages_sent_total 50000

# HELP l2_messages_expired_total Total messages expired
# TYPE l2_messages_expired_total counter
l2_messages_expired_total 100
```

---

## Questions for Allan

1. Should we verify signatures on the server? (Adds latency, prevents spoofing)
2. Use Hono or Express for the framework?
3. Deploy with Docker or PM2 for MVP?

---

*Created during heartbeat exploration — Feb 15, 2026, 5:30 AM*
*Completing the L2 picture: client plugin + server.*
