# Multi-Dimensional Ledger Design

**Date:** February 22, 2026
**Participants:** Allan, Alpha
**Status:** Decided

---

## Overview

The L1 ledger tracks registry events across three dimensions: Actor (identity), Node (network), and App (application). Each dimension has a separate table, but all are cryptographically bound in a single aggregated checkpoint.

---

## Decision: Multi-Dimensional Ledger + Single Checkpoint

### Ledger Dimensions

| Dimension | Table | Event Types |
|-----------|-------|-------------|
| **Actor** | `actor_ledgers` | clawfile.created, clawfile.updated, key.rotated, recovery.initiated, tier.changed |
| **Node** | `node_ledgers` | node.registered, node.status_changed, node.promoted, node.demoted, node.endpoint_updated |
| **App** | `app_ledgers` | app.registered, app.api_key_created, app.api_key_revoked, app.permissions_updated |

### Checkpoint Structure

**Single aggregated checkpoint per round:**
- Per-dimension hashes (actor_hash, node_hash, app_hash)
- One aggregate state_hash (sha256(actor_hash || node_hash || app_hash))
- One set of writer signatures (covers all dimensions)

---

## Database Schema

```sql
-- Dimension 1: Actor Events
CREATE TABLE actor_ledgers (
  id TEXT PRIMARY KEY,              -- ULID
  timestamp INTEGER NOT NULL,       -- ULID timestamp (ms)
  event_type TEXT NOT NULL,         -- 'clawfile.created', etc.
  identity_id TEXT NOT NULL,
  data JSONB NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL,             -- 'pending', 'confirmed'
  checkpoint_round INTEGER,
  created_at INTEGER NOT NULL
);

-- Dimension 2: Node Events
CREATE TABLE node_ledgers (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  event_type TEXT NOT NULL,         -- 'node.registered', etc.
  node_id TEXT NOT NULL,
  data JSONB NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL,
  checkpoint_round INTEGER,
  created_at INTEGER NOT NULL
);

-- Dimension 3: App Events
CREATE TABLE app_ledgers (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  event_type TEXT NOT NULL,         -- 'app.registered', etc.
  app_id TEXT NOT NULL,
  identity_id TEXT NOT NULL,        -- Owner
  data JSONB NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL,
  checkpoint_round INTEGER,
  created_at INTEGER NOT NULL
);

-- Checkpoints (single aggregated table)
CREATE TABLE checkpoints (
  round INTEGER PRIMARY KEY,
  time_start INTEGER NOT NULL,
  time_end INTEGER NOT NULL,
  
  actor_ledger_count INTEGER NOT NULL,
  actor_ledger_hash TEXT NOT NULL,
  
  node_ledger_count INTEGER NOT NULL,
  node_ledger_hash TEXT NOT NULL,
  
  app_ledger_count INTEGER NOT NULL,
  app_ledger_hash TEXT NOT NULL,
  
  state_hash TEXT NOT NULL,         -- sha256(actor_hash || node_hash || app_hash)
  
  signatures JSONB NOT NULL,        -- [{node_id, signature}]
  status TEXT NOT NULL,             -- 'complete', 'failed'
  created_at INTEGER NOT NULL
);
```

---

## Checkpoint Assembly

```javascript
// Step 1: Query all pending ledgers (per dimension)
actor_ledgers = db.query(`
  SELECT * FROM actor_ledgers
  WHERE timestamp < ? AND status = 'pending'
  ORDER BY id ASC
`, [round_start]);

node_ledgers = db.query(`
  SELECT * FROM node_ledgers
  WHERE timestamp < ? AND status = 'pending'
  ORDER BY id ASC
`, [round_start]);

app_ledgers = db.query(`
  SELECT * FROM app_ledgers
  WHERE timestamp < ? AND status = 'pending'
  ORDER BY id ASC
`, [round_start]);

// Step 2: Compute per-dimension hashes
actor_hash = sha256(JSON.stringify(actor_ledgers));
node_hash = sha256(JSON.stringify(node_ledgers));
app_hash = sha256(JSON.stringify(app_ledgers));

// Step 3: Compute aggregate state hash
state_hash = sha256(actor_hash + node_hash + app_hash);

// Step 4: Assemble checkpoint
checkpoint = {
  round: round_number,
  time_window: `[${round_start}, ${round_end})`,
  
  actor_ledger_count: actor_ledgers.length,
  actor_ledger_hash: actor_hash,
  
  node_ledger_count: node_ledgers.length,
  node_ledger_hash: node_hash,
  
  app_ledger_count: app_ledgers.length,
  app_ledger_hash: app_hash,
  
  state_hash: state_hash,
  
  signatures: [...],  // From SEAL step
  
  status: "complete"
};
```

---

## Rationale

### Why Multi-Dimensional?

| Reason | Explanation |
|--------|-------------|
| **L1 handles registry events** | Identity, node, app management — different event types |
| **Cleaner schema** | Separate tables = better organization, easier queries |
| **Independent evolution** | Can add fields to one dimension without affecting others |
| **Audit clarity** | Query by dimension (e.g., "show all node events") |

### Why Single Checkpoint?

| Reason | Explanation |
|--------|-------------|
| **Atomicity** | All dimensions consistent at checkpoint boundary |
| **Security** | Cryptographically binds all dimensions (tamper-evident) |
| **Audit** | Single state proof to verify |
| **Simplicity** | One checkpoint row per round, one signature set |

---

## Security Analysis

### Tamper Evidence

```
Checkpoint state_hash = sha256(actor_hash || node_hash || app_hash)

If attacker modifies ANY ledger:
  → That dimension's hash changes
  → Aggregate state_hash changes
  → Signatures no longer match
  → Checkpoint is INVALID

To fake data, attacker must:
  1. Modify the ledger
  2. Recompute state_hash
  3. Forge 2+ writer signatures
  4. Control majority of writers
```

### Attack Comparison

| Attack | Single Checkpoint | Separate Checkpoints |
|--------|-------------------|----------------------|
| **Fake 1 actor ledger** | Must re-sign ALL dimensions | Only re-sign actor checkpoint |
| **Required control** | 2+ writers (all dimensions) | 2+ writers (one dimension) |
| **Detection** | Any mismatch invalidates | Must check each dimension |
| **Cryptographic binding** | ✅ Strong (all bound together) | ⚠️ Weak (independent) |

**Single checkpoint is exponentially harder to attack** — all dimensions are cryptographically bound.

---

## Alternatives Considered

### Separate Checkpoints per Dimension

**Rejected because:**
- 3x complexity (3 checkpoint tables, 3x signatures)
- Weaker security (attack one dimension independently)
- Harder audits (verify 3 hashes per round)
- No cryptographic binding between dimensions

**When it might make sense (Phase 2+):**
- If dimensions need different sync frequencies
- If one dimension has 100x more events than others
- If storage optimization becomes critical

---

## References

- Whitepaper Section 5.4 (Ledger Structure)
- Chat Log: `chat/dm/allan/2026-02/2026-02-22.md`
- Related: `11-consensus-protocol.md`
