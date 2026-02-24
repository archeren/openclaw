# Ledger Structure Design

**Date:** February 22, 2026  
**Participants:** Allan, Alpha  
**Status:** Decided  
**Last Updated:** February 24, 2026 (major revision)

---

## Overview

The L1 ledger stores registry events (identity, node, app management) in a **single unified table** with a `checkpoint_round` tag. Ledgers are checkpointed every 5 minutes via consensus, with Merkle tree state hashes enabling efficient single-ledger verification.

---

## Decision: Single Ledger Table + Checkpoint Tag

### Unified Ledger Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | ULID (deterministic sort, timestamp embedded) |
| `data` | JSONB NOT NULL | Event data (type-specific schema) |
| `checkpoint_round` | INTEGER | NULL = pending, NOT NULL = sealed |
| `timestamp` | INTEGER NOT NULL | From ULID (ms since epoch) |
| `signature` | TEXT NOT NULL | Client's signature |
| `status` | TEXT NOT NULL | 'pending', 'pending_submit', 'confirmed' |
| `created_at` | INTEGER NOT NULL | When inserted (local timestamp) |

**Key insight:** Single table with `checkpoint_round` tag (NULL = pending, NOT NULL = sealed).

---

## Database Schema

```sql
-- Single unified ledger table
CREATE TABLE ledgers (
  id TEXT PRIMARY KEY,              -- ULID
  data JSONB NOT NULL,              -- Event data (type-specific)
  checkpoint_round INTEGER,         -- NULL = pending, NOT NULL = sealed
  timestamp INTEGER NOT NULL,       -- From ULID (ms)
  signature TEXT NOT NULL,          -- Client's signature
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for performance
CREATE INDEX idx_checkpoint ON ledgers(checkpoint_round);
CREATE INDEX idx_status ON ledgers(status);
CREATE INDEX idx_timestamp ON ledgers(timestamp);

-- Checkpoints table
CREATE TABLE checkpoints (
  round INTEGER PRIMARY KEY,
  state_hash TEXT NOT NULL,         -- Merkle root
  prev TEXT NOT NULL,               -- Hash of last SUCCESSFUL checkpoint
  timestamp INTEGER NOT NULL,
  signatures JSONB NOT NULL,        -- [{node_id, signature}]
  created_at INTEGER NOT NULL
);

-- Received bundles (temporary, per-round)
CREATE TABLE received_bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round INTEGER NOT NULL,
  node_id TEXT NOT NULL,
  bundle_data JSONB NOT NULL,
  received_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Announcements (temporary, per-round)
CREATE TABLE announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round INTEGER NOT NULL,
  node_id TEXT NOT NULL,
  state_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  received_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
```

---

## Ledger Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ LEDGER LIFECYCLE                                        │
│                                                          │
│ Client submits → INSERT INTO ledgers                    │
│   id: ULID                                               │
│   data: {...}                                            │
│   checkpoint_round: NULL                                 │
│   status: 'pending'                                      │
│                       ↓                                  │
│ Round starts → status = 'pending_submit'                │
│                       ↓                                  │
│ Consensus reached → checkpoint_round = 43               │
│                     status = 'confirmed'                 │
│                       ↓                                  │
│ Sealed (permanently recorded)                           │
└─────────────────────────────────────────────────────────┘
```

---

## Checkpoint Assembly

```javascript
// Stage 1: COMMIT (query pending ledgers)
ledgers = db.query(`
  SELECT * FROM ledgers
  WHERE checkpoint_round IS NULL
  ORDER BY id ASC  -- ULID sort (deterministic)
`);

// Stage 3: MERGE (build Merkle tree)
all_ledgers = [...my_ledgers, ...received_ledgers];
sorted = sort_by_ulid(all_ledgers);
merkle_tree = MerkleTree(sorted, sha256);
state_hash = merkle_tree.getRoot();

// Stage 5: CHECKPOINT (tag ledgers with round number)
db.execute(`
  UPDATE ledgers
  SET checkpoint_round = ?, status = 'confirmed'
  WHERE checkpoint_round IS NULL
    AND id IN (?)
`, [round_number, checkpoint_ledger_ids]);

// Store checkpoint
db.insert('checkpoints', {
  round: round_number,
  state_hash: state_hash,
  prev: previous_checkpoint_hash,
  timestamp: Date.now(),
  signatures: signatures
});
```

**Key:** `checkpoint_round IS NULL` is the only filter needed for pending ledgers.

---

## Pending vs Checkpointed

| Status | checkpoint_round | Include in Next Round? |
|--------|------------------|------------------------|
| **Pending** | NULL | ✅ YES |
| **Checkpointed** | NOT NULL (e.g., 42) | ❌ NO |
| **Minority synced** | NOT NULL (e.g., 42) | ❌ NO (already sealed) |
| **Unique minority** | NULL | ✅ YES (re-submit) |

**Golden Rule:** `SELECT * FROM ledgers WHERE checkpoint_round IS NULL`

---

## Query Examples

```sql
-- Get all pending (unsealed) ledgers:
SELECT * FROM ledgers WHERE checkpoint_round IS NULL;

-- Get all ledgers from Round 42:
SELECT * FROM ledgers WHERE checkpoint_round = 42 ORDER BY id ASC;

-- Get all sealed ledgers by time:
SELECT * FROM ledgers 
WHERE checkpoint_round IS NOT NULL 
ORDER BY id ASC;

-- Get checkpoint with ledgers:
SELECT 
  c.round,
  c.state_hash,
  c.signatures,
  COUNT(l.id) as ledger_count
FROM checkpoints c
LEFT JOIN ledgers l ON l.checkpoint_round = c.round
WHERE c.round = 42
GROUP BY c.round;
```

---

## Merkle Tree Integration

```javascript
// Build Merkle tree from ledgers:
function build_merkle_tree(ledgers) {
  // Leaf nodes: hash each ledger
  leaves = ledgers.map(l => sha256(JSON.stringify(l)));
  
  // Build tree bottom-up
  while (leaves.length > 1) {
    next_level = [];
    for (let i = 0; i < leaves.length; i += 2) {
      left = leaves[i];
      right = leaves[i + 1] || left;  // Odd: duplicate last
      next_level.push(sha256(left + right));
    }
    leaves = next_level;
  }
  
  return leaves[0];  // Merkle root
}

// Generate proof for single ledger:
function get_merkle_proof(ledgers, target_id) {
  // Returns: sibling hashes along path to root
  // Size: log₂(n) hashes (e.g., 10 for 1024 ledgers)
}

// Verify single ledger:
function verify_merkle_proof(ledger, proof, root) {
  current = sha256(JSON.stringify(ledger));
  for (sibling of proof) {
    current = sha256(current + sibling);
  }
  return current === root;
}
```

---

## Rationale

### Why Single Table?

| Reason | Explanation |
|--------|-------------|
| **Simpler schema** | One table to maintain, not three |
| **Easier queries** | No UNION or joins needed |
| **Atomic transitions** | Single UPDATE (pending → confirmed) |
| **Checkpoint_round tag** | Clear distinction (NULL vs NOT NULL) |

### Why Merkle Tree?

| Reason | Explanation |
|--------|-------------|
| **Efficient proofs** | Verify single ledger without all data |
| **Same hash commitment** | Drop-in replacement for sha256(sort(ledgers)) |
| **Can't add later** | Would require re-signing all checkpoints (impossible) |
| **Industry standard** | Bitcoin, Ethereum, etc. use Merkle trees |

### Why ULID Sort?

| Reason | Explanation |
|--------|-------------|
| **Deterministic** | Same ledgers → same order → same hash |
| **Timestamp embedded** | Sort by time without extra field |
| **Randomness** | Prevents manipulation via timestamp |

---

## Security Analysis

### Tamper Evidence

```
Checkpoint state_hash = Merkle root of all ledgers

If attacker modifies ANY ledger:
  → Merkle root changes
  → state_hash changes
  → Signatures no longer match
  → Checkpoint is INVALID

To fake data, attacker must:
  1. Modify the ledger
  2. Recompute Merkle root
  3. Forge 2+ writer signatures
  4. Control majority of writers
```

### Single-Ledger Verification

```
Query node wants to verify ledger B:

1. Get ledger B + Merkle proof from node E
2. Reconstruct root: verify_merkle_proof(B, proof, root)
3. Compare with checkpoint.state_hash
4. Match? ✅ Ledger B is authentic!

No need to download all ledgers!
```

---

## Alternatives Considered

### Separate Tables per Dimension (Rejected)

```
actor_ledgers, node_ledgers, app_ledgers

Rejected because:
- 3x complexity (3 tables, 3x queries)
- Harder atomic transitions
- No benefit (all checkpointed together)
- Merkle tree handles all types uniformly
```

### Status Field Only (Rejected)

```
status: 'pending' | 'confirmed'

Rejected because:
- Can't query "which round?"
- Can't verify historical checkpoints
- checkpoint_round is more informative
```

### sha256(sort(ledgers)) Without Merkle (Rejected)

```
state_hash = sha256(JSON.stringify(sorted_ledgers))

Rejected because:
- Same hash commitment but NO efficient proofs
- Can't add Merkle later (would break all checkpoints)
- Must decide upfront — Merkle is strictly better
```

---

## References

- Whitepaper Section 5.4 (Ledger Structure)
- Chat Log: `chat/dm/allan/2026-02/2026-02-24.md`
- Related: `11-consensus-protocol.md`, `13-clock-sync.md`
