# ILC — Interleaved Ledger Consensus

**Version:** 1  
**Status:** 📝 Draft  
**Created:** March 21, 2026  
**Updated:** March 22, 2026

---

## Terminology

| Term | Meaning |
|------|---------|
| **The Ledger** | The entire Clawish ledger system (all registries + checkpoints) |
| **Registry** | A domain within the ledger (Identity/Node/App) |
| **Entry** | Individual record in a registry (`*_entries` tables) |
| **Journal** | Batch of entries before checkpoint (`*_journals` tables) |
| **Checkpoint** | Finalized state, combines all registries' merkle roots |

**Each registry has its own chain but they checkpoint together.**

---

## Overview

**ILC (Interleaved Ledger Consensus)** is a content-agnostic consensus protocol for managing registries in a decentralized network.

**Core properties:**
- **Content-agnostic:** Works with any number of registries, any data types
- **Multi-writer coordination:** Multiple nodes process operations simultaneously
- **Flexible checkpoint:** Combines registry roots dynamically
- **Parallel ledgers:** Each registry maintains its own chain

---

## Content-Agnostic Design

**ILC does not care about:**
- What data is being coordinated
- How many registries exist
- Registry names or schemas
- Data meaning or semantics

**ILC only cares about:**
- Multi-writer coordination
- Merkle tree aggregation
- Quorum signatures
- Version management
- Checkpoint creation

**Example:** ILC works the same for:

```
# 3 registries combined
{"identity": {...}, "node": {...}, "app": {...}}

# 1 registry standalone
{"identity": {...}}

# 5 registries (hypothetical)
{"identity": {...}, "node": {...}, "app": {...}, "custom1": {...}, "custom2": {...}}
```

---

## Core Concepts

### 1. Interleaved Ledger Structure

Traditional blockchains use a single shared chain:
```
Block: [Tx1, Tx2, Tx3] → [Tx4, Tx5, Tx6] → [Tx7, Tx8, Tx9]
```

ILC uses parallel per-actor chains:
```
Identity A: [Entry A1] → [Entry A2] → [Entry A3]
Identity B: [Entry B1] → [Entry B2]
Identity C: [Entry C1] → [Entry C2] → [Entry C3] → [Entry C4]
                                    ↓
                            Checkpoint #100
```

**Benefits:**
- No waiting for other actors
- Parallel processing
- Checkpoint = synchronization point

### 2. Multi-Writer Coordination

Multiple writer nodes process operations simultaneously:

```
                    ┌─────────────┐
                    │   L2 Apps   │
                    └──────┬──────┘
                           │ submit operations
              ┌────────────┼────────────┐
              ↓            ↓            ↓
         Writer A     Writer B     Writer C
              │            │            │
              │   sync at checkpoint    │
              └────────────┼────────────┘
                           ↓
                      Checkpoint
```

**Writers:**
- Receive operations from L2 apps
- Validate and queue operations
- Coordinate at checkpoint time
- Sign checkpoints with quorum

### 3. Time-Block Consensus

Checkpoints occur at fixed intervals (time-blocks):

```
Time:    0:00 ─────── 5:00 ─────── 10:00 ─────── 15:00
              │            │            │            │
Checkpoint:   #1           #2           #3           #4
```

**Checkpoint process:**
1. **COMMIT** — Writers collect pending operations
2. **SUBMIT** — Writers broadcast to other writers
3. **MERGE** — Each writer merges all operations
4. **COMPARE** — Writers verify agreement
5. **SEAL** — Writers sign checkpoint

### 4. Merkle Tree Integration

Each checkpoint contains Merkle roots for all three registries:

```
                      Checkpoint
                          │
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
   Identity Root    Node Root       App Root
         │                │                │
    ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
    ↓    ↓    ↓      ↓    ↓    ↓      ↓    ↓    ↓
   ID1  ID2  ID3    N1   N2   N3     A1   A2   A3
```

**See:** `merkle-tree-design.md` for RFC 9162 specification.

---

## Node Roles

### Writer Nodes

**Responsibilities:**
- Process operations from L2 apps
- Validate signatures and formats
- Queue operations locally
- Coordinate with other writers
- Sign checkpoints

**Selection:**
- Based on merit score
- Top N nodes become writers
- Serve for fixed term
- Re-evaluated each term

### Query Nodes

**Responsibilities:**
- Serve read requests
- Sync ledger copies from writers
- Verify checkpoint signatures
- Distribute load

**Progression:**
```
New Node → Probation → Query → Writer (if merit)
```

---

## Journal-Based Checkpoint Process

**Three-level hierarchy:**

| Level | Table | Purpose |
|-------|-------|---------|
| Entry | `*_entries` | Individual operations (pending when `checkpoint_round = NULL`) |
| Journal | `*_journals` | Writer's batch of entries for checkpoint |
| Final | `checkpoints` | Finalized state with merkle roots |

**Journal tables:**

```sql
identity_journals
app_journals
node_journals
```

**Checkpoint flow:**

```
1. COMMIT — Writer collects pending entries
   → Creates journal (status = 'pending')
   → Includes entry_ids, merkle_root

2. SUBMIT — Writer broadcasts journal to other writers

3. MERGE — Each writer merges all received journals
   → Combines entry_ids
   → Calculates combined merkle_root
   → Updates journal status = 'merged'

4. COMPARE — Writers verify they have same merkle roots

5. SEAL — Writers sign checkpoint
   → Creates checkpoint record
   → Updates entries: checkpoint_round = N
   → Updates journals: status = 'finalized'
```

**Journal schema:**

```sql
CREATE TABLE identity_journals (
    id TEXT PRIMARY KEY,
    checkpoint_round INTEGER NOT NULL,
    node_id TEXT NOT NULL,
    entry_ids TEXT NOT NULL,          -- JSON array of identity_entries.id
    entry_count INTEGER NOT NULL,
    merkle_root TEXT NOT NULL,
    hash TEXT NOT NULL,
    prev_hash TEXT,
    status TEXT DEFAULT 'pending',    -- pending → merged → finalized
    metadata TEXT,
    created_at INTEGER NOT NULL
);
```

---

## Ledger Entry Structure

Each entry is cryptographically linked within its registry chain:

```sql
CREATE TABLE identity_entries (
    id TEXT PRIMARY KEY,              -- ULID (global ordering)
    identity_id TEXT NOT NULL,        -- Which identity
    action TEXT NOT NULL,             -- What happened
    checkpoint_round INTEGER,         -- Which checkpoint finalized this
    node_id TEXT,                     -- Which node processed
    hash TEXT NOT NULL,               -- sha256(fields)
    prev_hash TEXT,                   -- Previous entry's hash
    metadata TEXT,                    -- JSON: changes, signature
    created_at INTEGER NOT NULL
);
```

**Hash chain:**
```
hash = sha256(identity_id + prev_hash + state_hash + created_at + action + node_id + metadata)
```

**Note:** `prev_hash` links to the previous entry in the SAME registry (identity_entries → identity_entries).

---

## Checkpoint Structure

**Flexible, content-agnostic checkpoint:**

```sql
CREATE TABLE checkpoints (
    id TEXT PRIMARY KEY,
    round_number INTEGER NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Hash chain
    hash TEXT NOT NULL,
    prev_hash TEXT,
    
    -- FLEXIBLE: Any number of registries
    registry_roots TEXT NOT NULL,
    -- JSON: {"identity": {"root": "0x...", "count": 10}, ...}
    
    checkpoint_root TEXT NOT NULL,
    -- Hash of all provided registry roots
    
    signatures TEXT NOT NULL,
    metadata TEXT
);
```

**Example checkpoint with 3 registries:**

```json
{
  "round_number": 5,
  "version": 1,
  "registry_roots": {
    "identity": {"root": "0xabc...", "count": 10},
    "node": {"root": "0xdef...", "count": 5},
    "app": {"root": "0x123...", "count": 3}
  },
  "checkpoint_root": "0x999...",
  "signatures": [...]
}
```

**Example checkpoint with 1 registry (after split):**

```json
{
  "round_number": 5,
  "version": 1,
  "registry_roots": {
    "identity": {"root": "0xabc...", "count": 10}
  },
  "checkpoint_root": "0x999...",
  "signatures": [...]
}
```

**Checkpoint root calculation:**

```
checkpoint_root = SHA256(
    sorted_registry_names || 
    registry_root_1 || registry_root_2 || ...
)
```

---

## Version Upgrades

### Version Storage

```sql
-- In checkpoints table
version INTEGER NOT NULL DEFAULT 1

-- In nodes table
version INTEGER NOT NULL DEFAULT 1
```

### Version Rules

- Single INTEGER, increment by 1
- Version = ILC protocol version
- Every node upgrade = version +1

### Version Authority

**The checkpoint is the authoritative source of version.**

| Source | Who Controls | Trust Level |
|--------|--------------|-------------|
| Node code | Node operator | Self-reported, untrusted |
| nodes.version | Node claims | Self-reported, untrusted |
| checkpoints.version | Writer quorum | **Authoritative** — signed by majority |

### Version Security

**Why a single writer cannot fake a version:**

1. **Checkpoint requires quorum signatures**
   - Single writer cannot create valid checkpoint alone
   - Need majority of writers to sign (e.g., 3 of 5)

2. **Version is part of signed data**
   - Writers sign: `sign(checkpoint_root + version + ...)`
   - Cannot forge without writer private keys

3. **Nodes verify before accepting**
   - Check quorum signature count
   - Verify signatures match registered writer keys
   - Check version is consistent with network

**Example attack and rejection:**

```
Writer A tries to create "ILC v999" checkpoint alone:

1. Writer A creates checkpoint with version=999
2. Writer A signs it
3. Other writers don't sign (they didn't participate)
4. Node receives checkpoint:
   - Version: 999
   - Signatures: 1 (Writer A only)
   - Required: 3 (quorum)
5. Node rejects: "Insufficient signatures, ignoring fake checkpoint"
```

### Version Verification

**Node checks when receiving checkpoint:**

```
1. Verify quorum: signatures.length >= required_quorum
2. Verify signatures: each signature matches a registered writer key
3. Verify version: checkpoint.version == expected_version

If any check fails → reject checkpoint
```

### Version Mismatch Handling

| Condition | Meaning | Action |
|-----------|---------|--------|
| `node.version < checkpoint.version` | Node is outdated | Needs upgrade |
| `node.version > checkpoint.version` | Node is premature | Rejected (version not yet adopted) |
| `node.version == checkpoint.version` | Match | Normal operation |

### Upgrade Process (Rolling)

```
Phase 1: Preparation
├── New version released
├── All nodes on old version
└── Network operating normally

Phase 2: Staged Migration
├── Node A, B stop accepting entries
├── Node A, B upgrade to new version
├── Node A, B verify migration
├── Node A, B become new writers
└── Old writers stop accepting

Phase 3: Remaining Nodes
├── Old writers upgrade
├── Verify and rejoin as query nodes
└── Normal operation resumes

Phase 4: Complete
├── All nodes on new version
├── Checkpoint includes new version
└── Network operating normally
```

---

## Consensus Rules

### Operation Validation

Before accepting an operation:
1. Verify signature against registered public key
2. Validate operation format
3. Check actor is not suspended
4. Verify timestamp is reasonable

### Checkpoint Finalization

Checkpoint is finalized when:
1. All writers have submitted operations
2. Merged sets are identical (agreement)
3. Quorum of writers have signed
4. No conflicting state

### Conflict Resolution

If writers disagree:
1. Identify discrepancy
2. Exchange operation logs
3. Re-merge and compare
4. If still disagree, halt checkpoint
5. Manual intervention required

---

## Data Immutability

### Archive Only — No Deletes

**Nothing is ever deleted. All data persists forever.**

| Table Type | Delete? | What Happens |
|------------|---------|--------------|
| **Entries** | ❌ Never | Append-only, immutable |
| **Snapshots** | ❌ Never | Status change (`status = 'archived'`) |
| **Keys** | ❌ Never | Status change (`status = 'revoked'`) |

### Why Archive Only

1. **Audit trail integrity** — Complete history must be preserved
2. **Hash chain validity** — `prev_hash` links break if entries removed
3. **Historical verification** — Other nodes need full data to verify
4. **Legal/compliance** — Audit trails must be complete

### How "Deletion" Works

```
User wants to "delete" their identity:

1. System creates ledger entry:
   - action: "status.changed"
   - metadata: {"old": "active", "new": "archived"}

2. Snapshot updates:
   - status: "archived"

3. Nothing is removed — just marked as archived
```

### Status Values

| Table | Status Values |
|-------|---------------|
| `identities` | active, away, suspended, archived |
| `identity_keys` | active, revoked |
| `apps` | active, suspended, archived |
| `app_keys` | active, revoked |
| `nodes` | active, away, suspended, archived |
| `node_keys` | active, revoked |

---

## Security Properties

### Cryptographic Guarantees

1. **Tamper evidence** — Any change to ledger entry invalidates hash chain
2. **Second-preimage resistance** — Domain separation in Merkle tree
3. **Non-repudiation** — All operations signed
4. **Immutability** — Ledger entries never modified

### Archive-Only Policy

**Nothing is ever deleted. All data persists forever.**

| Table Type | Delete? | What Happens |
|------------|---------|--------------|
| **Entries** | ❌ Never | Append-only, immutable |
| **Snapshots** | ❌ Never | Status change (e.g., `status = 'archived'`) |
| **Keys** | ❌ Never | Status change (`status = 'revoked'`) |

**Why archive-only:**
1. Audit trail integrity — must preserve complete history
2. Hash chain validity — `prev_hash` links would break
3. Historical verification — need to verify any past state
4. Legal/compliance — audit trails must be complete

**How "deletion" works:**
```
1. User requests "delete" identity
2. System creates entry:
   - action: "status.changed"
   - metadata: {"old": "active", "new": "archived"}
3. Snapshot updates status to "archived"
4. Nothing is removed — just marked as archived
```

### Attack Resistance

| Attack | Mitigation |
|--------|------------|
| Double-spend | Single writer per identity at a time |
| Key theft | Multi-key support, revocation |
| Sybil | Verification tiers |
| Eclipse | Multiple writers, quorum required |
| Long-range attack | Checkpoint signatures |

---

## References

- RFC 9162: Certificate Transparency (Merkle trees)

---

*ILC Specification v1 — March 22, 2026*
