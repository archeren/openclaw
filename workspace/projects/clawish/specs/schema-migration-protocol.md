# Schema Migration Protocol

**Status:** 📝 Draft for discussion  
**Created:** March 21, 2026

---

## The Challenge

In a distributed L1 network:
- Multiple nodes run independently
- Schema changes affect how data is interpreted
- Nodes may be on different versions during upgrade
- Consensus must not break during migration

---

## Design Decisions Needed

### 1. Where is the version stored?

**Decision: Single INTEGER — Node System Version**

```sql
-- In checkpoints table
version INTEGER NOT NULL DEFAULT 1

-- In nodes table (what version this node is running)
version INTEGER NOT NULL DEFAULT 1
```

**In code:**
```typescript
const NODE_VERSION = 2;  // Protocol version
const RELEASE_VERSION = "v1.1.0";  // Human-readable (package.json, GitHub)
```

**Two separate concepts:**

| Version Type | Stored Where | Format | Purpose |
|--------------|--------------|--------|---------|
| Protocol version | DB (checkpoints, nodes) | INTEGER | Consensus checks |
| Release version | GitHub, docs, package.json | TEXT | Human-readable |

**Version numbering:**
- Start at 1
- Every node upgrade = +1
- One protocol version can have multiple release versions (bug fixes, non-protocol changes)

**Migration check:**
- `checkpoint.version > node.version` → Node needs upgrade
- `node.version < checkpoint.version` → Can't participate in consensus

**This is how Bitcoin/Ethereum work:**
- Protocol version in block = single INTEGER
- "Ethereum 2.0" = branding, not database value

---

### 2. Migration Process (Rolling Upgrade)

**爸爸's proposed flow:**

```
Phase 1: Preparation
├── New version released
├── All nodes still on old version
└── Network operating normally

Phase 2: Staged Migration (Group 1)
├── Node A, B stop accepting new entries
├── Node A, B upgrade to new version
├── Node A, B verify schema migration complete
├── Node A, B signal ready
├── Node A, B become new writers
└── Old writers (C, D) stop accepting entries

Phase 3: Remaining Nodes Upgrade (Group 2+)
├── Old writers (C, D) upgrade
├── C, D verify migration
├── C, D rejoin as query nodes
└── Writer selection resumes normal operation

Phase 4: Normal Operation
├── All nodes on new version
├── Checkpoint includes new protocol_version
└── Network operating normally
```

**Batch Size Rule:**

```
batch_size = max(1, floor(total_nodes * 0.1))
```

| Network Size | Batch Size |
|--------------|------------|
| 5 nodes (MVP) | 1 node (min) |
| 10 nodes | 1 node (10% = 1) |
| 20 nodes | 2 nodes |
| 100 nodes | 10 nodes |
| 1000 nodes | 100 nodes |

**Decision:** 10% per batch, minimum 1 node at a time. ✅ Mar 22

---

### Writer Selection During Upgrade

**Decision:** Writer stays writer. Election is a separate process. ✅ Mar 22

| Node Role | During Upgrade | After Upgrade |
|-----------|----------------|---------------|
| Writer | Still writer | Still writer |
| Query node | Still query | Still query |

Upgrade process handles version migration only. Writer election is managed by a separate protocol (merit-based selection).

---

### Rollback

**Decision:** No rollback needed. Failed node stays on old version until fixed. ✅ Mar 22

**Two scenarios:**

| Scenario | What Happens |
|----------|--------------|
| **Single node fails migration** | Node stays on old version, fix and retry |
| **Bug discovered after upgrade** | Release v(N+1) to fix (forward-only) |

**Key insight:** Upgrade in batches = trackable progress. Failed nodes don't block other batches.

| Batch | Status | Nodes |
|-------|--------|-------|
| Batch 1 | ✅ Complete | Node A, B |
| Batch 2 | 🔄 In progress | Node C (failed, retrying) |
| Batch 3 | ⏳ Pending | Node D, E |

Ledger data is immutable — never rolls back.

---

### Version Negotiation

**Decision:** Majority version wins. ✅ Mar 22

**How it works:**

| Step | What Happens |
|------|--------------|
| 1 | Each writer includes `version` in checkpoint signature |
| 2 | Checkpoint version = majority of signing writers |
| 3 | Nodes with lower version see checkpoint → upgrade needed |
| 4 | Upgrade batches proceed until all nodes match |

**Example:**

| Writers | Versions | Checkpoint Version |
|---------|----------|-------------------|
| A, B, C | v1, v1, v2 | v1 (majority) |
| A, B, C | v1, v2, v2 | v2 (majority) |
| A, B, C | v2, v2, v2 | v2 (all agree) |

No separate voting needed — uses same quorum mechanism as checkpoint consensus.

---

### Ledger Entry Versioning

**Decision:** Checkpoint only. No per-entry version. ✅ Mar 22

**Rationale:**
- Entries already have `checkpoint_round` linking to checkpoint
- Version is a checkpoint-level concern
- Per-entry version would be redundant

**Schema:**

```sql
-- checkpoints table includes version
CREATE TABLE checkpoints (
    version INTEGER NOT NULL DEFAULT 1,
    round_number INTEGER PRIMARY KEY,
    ...
);

-- entries link to checkpoint via checkpoint_round
CREATE TABLE identity_entries (
    id INTEGER PRIMARY KEY,
    checkpoint_round INTEGER,  -- Links to checkpoint
    ...
);
```

Query version via: `SELECT version FROM checkpoints WHERE round_number = entry.checkpoint_round`

---

### 3. Version Signaling

**Where version is stored:**

**A. In checkpoint**
```sql
-- checkpoints table
version INTEGER NOT NULL DEFAULT 1
```
- Every checkpoint declares its version
- Nodes reject checkpoints with unsupported versions

**B. In node registration**
```sql
-- nodes table
version INTEGER NOT NULL DEFAULT 1
```
- Each node declares what version it supports
- Helps coordinate upgrades

**C. In API requests**
```json
{
  "version": 2,
  "data": ...
}
```
- Nodes include version in all communications
- Detects version mismatch early

---

### 4. Backward Compatibility

**Types of schema changes:**

| Change Type | Example | Backward Compatible? |
|-------------|---------|---------------------|
| Add field | New optional column | ✅ Yes |
| Remove field | Delete unused column | ⚠️ Needs migration |
| Rename field | Column rename | ❌ Breaking |
| Change type | INTEGER → TEXT | ❌ Breaking |
| Add constraint | New NOT NULL | ⚠️ Needs data update |

**Design principle: Prefer additive changes**

---

### 5. Migration Script Storage

**Where to store migration scripts?**

**Option A: In code repository**
```
/migrations/
  /001_initial_schema.sql
  /002_add_metadata_field.sql
  /003_add_protocol_version.sql
```
- Standard approach
- Version controlled
- Nodes load and execute

**Option B: In database**
```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    script TEXT NOT NULL,  -- The actual SQL
    applied_at INTEGER NOT NULL
);
```
- Self-contained
- Nodes can fetch missing migrations from peers
- More complex

**Recommendation: Option A for MVP, Option B for decentralized phase**

---

### 6. What Happens During Migration?

**Node states during upgrade:**

| State | Behavior |
|-------|----------|
| `operational` | Normal operation, accepting entries |
| `draining` | Stop accepting new entries, finish pending work |
| `migrating` | Running migration scripts |
| `validating` | Verifying schema and data integrity |
| `ready` | Migration complete, ready to rejoin |

**Transition rules:**
- `operational` → `draining`: Node decides to upgrade
- `draining` → `migrating`: No pending entries
- `migrating` → `validating`: Scripts executed
- `validating` → `ready`: All checks pass
- `ready` → `operational`: Accepted by network

---

## ✅ Resolved Questions

| # | Question | Decision | Date |
|---|----------|----------|------|
| 1 | Writer selection during upgrade? | Writer stays writer. Election is separate process. | Mar 22 |
| 2 | Minimum quorum during upgrade? | 10% per batch, minimum 1 node. | Mar 22 |
| 3 | Rollback? | No rollback. Failed node stays on old version. | Mar 22 |
| 4 | Version negotiation? | Majority version wins (checkpoint quorum). | Mar 22 |
| 5 | Ledger entry versioning? | Checkpoint only. No per-entry version. | Mar 22 |

---

## Status: ✅ Complete

All migration protocol questions resolved. Ready for implementation.

---

*Updated by Arche — March 22, 2026*
