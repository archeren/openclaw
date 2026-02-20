# L1 Server Security Review — 2026-02-21

**Reviewer:** Claw Alpha  
**Code reviewed:** `packages/l1-server/` (signature middleware, clawfiles routes, node routes)

## Summary

The core signature verification is solid (Ed25519, timestamp validation, canonical messages). The main gaps are operational security and missing features from the whitepaper.

## Findings

### Medium Severity

#### 1. Replay Attack Within 5-Minute Window

**Location:** `middleware/signature.ts:60-67`

**Issue:** A captured request can be replayed within the 5-minute drift window.

**Current code:**
```typescript
const maxDrift = 5 * 60 * 1000; // 5 minutes
if (isNaN(requestTime) || drift > maxDrift) {
  return c.json({ error: 'invalid_timestamp' }, 401);
}
```

**Risk:** Attacker intercepts a signed request and replays it within 5 minutes.

**Fix:** Add nonce/request ID that's tracked server-side with TTL:
```typescript
// Store used nonces in Redis or in-memory LRU cache
const usedNonces = new LRUCache<string, boolean>({ max: 10000, ttl: 5 * 60 * 1000 });
if (usedNonces.has(nonce)) {
  return c.json({ error: 'replay_detected' }, 401);
}
usedNonces.set(nonce, true);
```

---

#### 2. No Rate Limiting

**Location:** All routes

**Issue:** No rate limiting on signature failures or API calls.

**Risk:** Attacker can flood server with bad signatures, causing:
- Log spam
- CPU burn on signature verification
- Potential DoS

**Fix:** ✅ **Fixed** - Added hono-rate-limiter middleware:
```typescript
app.use('*', rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100,
  keyGenerator: (c) => {
    return c.req.header('X-Identity-Id') || c.req.header('x-forwarded-for') || 'anonymous';
  },
  message: {
    error: 'rate_limit_exceeded',
    message: 'Too many requests, please try again later.',
  },
}));
```

---

#### 3. No Audit Logging

**Location:** `middleware/signature.ts`, `routes/clawfiles.ts`

**Issue:** Failed signature attempts aren't logged for security monitoring.

**Risk:** No visibility into attack patterns, no incident response capability.

**Fix:** ✅ **Fixed** - Added structured audit logging:
```typescript
// New file: middleware/audit.ts
export function auditLog(
  event: AuditEvent,
  c: Context,
  details?: Record<string, unknown>
): void { ... }

// Events logged:
- signature_verification_failed (missing_headers, invalid_signature)
- signature_verification_success
- invalid_timestamp
- identity_not_found
- All mutating requests (POST, PATCH, PUT, DELETE)
```

---

### Low Severity

#### 4. Key Rotation Compromise Handling

**Location:** `routes/clawfiles.ts:155-185`

**Issue:** When `reason: 'compromise'` is specified, no special action is taken.

**Risk:** Compromised key might still have active sessions or ongoing operations.

**Fix:** Consider:
- Revoking active sessions
- Notifying related identities
- Requiring re-verification

---

#### 5. Missing Content-Type Validation

**Location:** All POST/PATCH routes

**Issue:** No check that request body is actually JSON.

**Risk:** Could cause unhandled parse errors.

**Fix:** Add middleware:
```typescript
app.use('*', async (c, next) => {
  if (['POST', 'PATCH', 'PUT'].includes(c.req.method)) {
    const contentType = c.req.header('Content-Type');
    if (!contentType?.includes('application/json')) {
      return c.json({ error: 'invalid_content_type' }, 415);
    }
  }
  return next();
});
```

---

### Design Gaps (Per Whitepaper)

#### 6. Single-Key Schema

**Location:** `db/index.ts` — clawfiles table

**Issue:** Current schema has single `public_key` column.

**Whitepaper requirement:** Multi-key array (primary, recovery, operational).

**Migration needed:**
```sql
-- Add keys table
CREATE TABLE identity_keys (
  key_id TEXT PRIMARY KEY,
  identity_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  key_type TEXT NOT NULL, -- 'primary', 'recovery', 'operational'
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'revoked'
  created_at INTEGER NOT NULL,
  archived_at INTEGER,
  FOREIGN KEY (identity_id) REFERENCES clawfiles(identity_id)
);
```

---

#### 7. Email Recovery Routes Missing

**Issue:** No email verification or recovery routes implemented.

**Whitepaper requirement:** Email is the only recovery tier for MVP.

**Routes needed:**
- `POST /clawfiles/:id/recovery/email` — Initiate email verification
- `POST /clawfiles/:id/recovery/verify` — Verify email code
- `POST /clawfiles/:id/recovery/recover` — Recover with email code

---

## Recommendations for MVP

### Must Fix Before Launch
1. ~~Add rate limiting~~ ✅ Done
2. ~~Add audit logging~~ ✅ Done
3. Implement email recovery routes

### Should Fix Before Launch
1. Add nonce-based replay protection
2. ~~Add Content-Type validation~~ ✅ Done

### Can Defer
1. Multi-key schema migration
2. Compromise handling special cases

---

## Tested By

- ✅ Ledger hash-chaining verified (12/12 tests passing)
- ✅ Signature verification unit tests (manual review)
- ✅ TypeScript compilation passes
- ⚠️ No penetration testing done yet

## Files Modified

| File | Change |
|------|--------|
| `src/index.ts` | Added rate limiting, audit middleware, Content-Type validation |
| `src/middleware/signature.ts` | Added audit logging calls |
| `src/middleware/audit.ts` | **New** - Structured audit logging |
| `package.json` | Added hono-rate-limiter dependency |

---

*Reviewed by Claw Alpha — 2026-02-21, 4:30 AM*
