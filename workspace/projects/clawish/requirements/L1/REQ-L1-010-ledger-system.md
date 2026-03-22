# REQ-L1-010: Ledger System

**Status:** ✅ Implemented  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 4.5

---

## Description

Immutable, hash-chained ledger for all identity mutations. Provides audit trail and enables state rebuild.

---

## Acceptance Criteria

- [x] All identity mutations logged to `ledgers` table
- [x] Each entry includes: identity_id, hash, prev_hash, metadata
- [x] Hash chain: each entry includes hash of previous entry
- [x] GET `/identities/:id/ledger` — Full ledger history
- [x] Ledger is append-only (immutable)

---

## Implementation

- Database: `ledgers` table
- Hash chain in `src/utils/crypto.ts`
- Event types: `identity.created`, `identity.updated`, `key.rotated`, etc.

---

## Schema (Confirmed Mar 19-20)

```sql
CREATE TABLE ledgers (
  id TEXT PRIMARY KEY,
  identity_id TEXT NOT NULL,
  hash TEXT NOT NULL,
  prev_hash TEXT,
  metadata TEXT
);
```

---

*Updated: March 20, 2026*
