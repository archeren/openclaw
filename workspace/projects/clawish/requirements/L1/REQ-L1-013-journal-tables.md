# REQ-L1-013: Journal Tables

**Status:** 📋 Draft  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 4.5 (Ledger System)

---

## Description

Journal tables batch ledger entries into atomic units for checkpoint creation and cross-node synchronization. Journals enable efficient data exchange between nodes and provide the foundation for ILC consensus.

---

## Acceptance Criteria

- [ ] Ledger entries grouped into journals by time window
- [ ] Each journal has a unique identifier and sequence number
- [ ] Journals can be exchanged between nodes
- [ ] Journals aggregate to form checkpoint inputs
- [ ] Journal integrity verifiable via hash chain

---

## Design

### Concept

```
Ledger Entry → Journal Batch → Checkpoint
    (1:N)          (N:1)
```

**Journal lifecycle:**
1. **Open** — Journal accepting new entries
2. **Closed** — Journal sealed, no more entries
3. **Checkpointed** — Journal included in checkpoint
4. **Synced** — Journal confirmed by quorum of nodes

### Tables

#### `journals` Table

```sql
CREATE TABLE journals (
  id TEXT PRIMARY KEY,                    -- ULID
  sequence INTEGER NOT NULL UNIQUE,       -- Monotonic sequence number
  node_id TEXT NOT NULL,                  -- Creator node
  status TEXT NOT NULL DEFAULT 'open',    -- open, closed, checkpointed, synced
  entry_count INTEGER NOT NULL DEFAULT 0, -- Number of entries in journal
  merkle_root TEXT,                       -- Merkle root of all entry hashes
  prev_journal_hash TEXT,                 -- Hash chain link
  hash TEXT,                              -- This journal's hash
  created_at TEXT NOT NULL,               -- ISO 8601 timestamp
  closed_at TEXT,                         -- When sealed
  checkpoint_id TEXT,                     -- Link to checkpoint (if checkpointed)
  FOREIGN KEY (node_id) REFERENCES nodes(id),
  FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id)
);
```

#### `journal_entries` Table

```sql
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  journal_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,                -- Link to original ledger entry
  sequence INTEGER NOT NULL,              -- Position within journal
  hash TEXT NOT NULL,                     -- Entry hash (from ledger)
  created_at TEXT NOT NULL,
  FOREIGN KEY (journal_id) REFERENCES journals(id),
  FOREIGN KEY (ledger_id) REFERENCES ledgers(id),
  UNIQUE(journal_id, sequence)
);

CREATE INDEX idx_journal_entries_journal ON journal_entries(journal_id);
CREATE INDEX idx_journal_entries_ledger ON journal_entries(ledger_id);
```

### Hash Chain

**Journal hash:**
```
journal_hash = SHA256(
  id || sequence || node_id || 
  entry_count || merkle_root || 
  prev_journal_hash || closed_at
)
```

**Hash chain:**
```
Journal #1 → Journal #2 → Journal #3 → ...
    hash_1 → hash_2 → hash_3
```

Each journal links to the previous journal via `prev_journal_hash`, creating an immutable chain.

### Merkle Root

**Each journal contains a Merkle tree of its entries:**

```
merkle_root = MTH([hash_1, hash_2, ..., hash_n])
```

This enables:
- Efficient verification of entry inclusion
- Compact proof that an entry is in a journal
- Cross-node integrity verification

---

## Operations

### Create Journal

```sql
INSERT INTO journals (id, sequence, node_id, status, created_at)
VALUES (ulid(), next_sequence(), :node_id, 'open', :timestamp);
```

### Add Entry to Journal

```sql
BEGIN TRANSACTION;

-- Get current open journal
SELECT id, entry_count FROM journals 
WHERE node_id = :node_id AND status = 'open'
LIMIT 1;

-- Add entry
INSERT INTO journal_entries (id, journal_id, ledger_id, sequence, hash, created_at)
VALUES (ulid(), :journal_id, :ledger_id, :sequence, :hash, :timestamp);

-- Update journal
UPDATE journals 
SET entry_count = entry_count + 1
WHERE id = :journal_id;

COMMIT;
```

### Close Journal

```sql
BEGIN TRANSACTION;

-- Compute merkle root from all entry hashes
SELECT hash FROM journal_entries 
WHERE journal_id = :journal_id 
ORDER BY sequence;

-- Compute journal hash
UPDATE journals 
SET status = 'closed',
    merkle_root = :merkle_root,
    prev_journal_hash = :prev_hash,
    hash = :journal_hash,
    closed_at = :timestamp
WHERE id = :journal_id;

COMMIT;
```

---

## Batching Strategy

### Time-Based (Default)

```
Journal closes when:
- 5 minutes elapsed, OR
- 1000 entries reached
```

### Size-Based (Alternative)

```
Journal closes when:
- 1000 entries reached, OR
- 1 MB data size reached
```

### Manual (Admin)

```
Journal closes on explicit command (for testing/debugging)
```

---

## Cross-Node Exchange

### Journal Export

```json
{
  "id": "01ARZ3N...",
  "sequence": 42,
  "node_id": "node_abc",
  "status": "closed",
  "entry_count": 850,
  "merkle_root": "abc123...",
  "prev_journal_hash": "def456...",
  "hash": "xyz789...",
  "created_at": "2026-03-24T02:00:00Z",
  "closed_at": "2026-03-24T02:05:00Z",
  "entries": [
    {"sequence": 0, "ledger_id": "...", "hash": "..."},
    {"sequence": 1, "ledger_id": "...", "hash": "..."}
  ]
}
```

### Journal Import

```
1. Verify journal hash
2. Verify hash chain (prev_journal_hash)
3. Verify merkle root against entries
4. Verify all ledger entries exist or import them
5. Insert journal and entries
```

---

## Checkpoint Integration

### Journal Aggregation

```
Checkpoint = Aggregate(all journals closed since last checkpoint)

identity_root = MTH(all identity state changes in journals)
node_root = MTH(all node state changes in journals)
app_root = MTH(all app state changes in journals)
```

### Journal Marking

After checkpoint creation:
```sql
UPDATE journals 
SET status = 'checkpointed', 
    checkpoint_id = :checkpoint_id
WHERE status = 'closed' 
  AND checkpoint_id IS NULL;
```

---

## Performance Considerations

| Metric | Target |
|--------|--------|
| Journal creation | < 10ms |
| Entry addition | < 5ms |
| Journal close | < 100ms (1000 entries) |
| Merkle root computation | < 50ms (1000 entries) |
| Journal export | < 500ms |

---

## Security Properties

1. **Immutability** — Hash chain prevents modification
2. **Integrity** — Merkle root verifies all entries
3. **Non-repudiation** — Each journal signed by creator node
4. **Auditability** — Full history of all journals

---

## Implementation Notes

### Dependencies

- F-4.5 Journal Batching (Phase 2)
- F-8.4 Merkle Tree (Phase 1) — for merkle_root computation

### Migration from Ledger

```sql
-- Backfill journals from existing ledger entries
-- (Run once during migration)

-- Create journals for time windows
INSERT INTO journals (id, sequence, node_id, status, created_at, closed_at)
SELECT ...;

-- Link ledger entries to journals
INSERT INTO journal_entries (id, journal_id, ledger_id, sequence, hash, created_at)
SELECT ...;
```

---

## Open Questions

1. **Batching parameters** — What are optimal time/size thresholds?
2. **Journal size limits** — Maximum entries per journal?
3. **Retention policy** — How long to keep journaled entries?

---

*Created by Arche — March 24, 2026*
