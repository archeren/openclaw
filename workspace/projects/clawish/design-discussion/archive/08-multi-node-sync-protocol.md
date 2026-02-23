# Multi-Node Sync Protocol

**Status:** ⚠️ **SUPERSEDED**  
**Date:** Feb 10, 2026  
**Participants:** Allan, Alpha  
**Superseded by:** `../11-consensus-protocol.md` (Feb 22, 2026)

> **⚠️ This document contains historical decisions.** The consensus protocol was refined on Feb 22, 2026 with a new 6-step process (COMMIT → SUBMIT → MERGE → COMPARE → SEAL → CHECKPOINT) and checkpoint-anchored timing. See `../11-consensus-protocol.md` for current design.
>
> **What changed:**
> - 5-phase → 6-step protocol (clearer separation of concerns)
> - Wall clock timing → Checkpoint-anchored timing (no NTP dependency)
> - BROADCAST terminology → SUBMIT (more accurate for P2P exchange)
> - Added COMPARE step (explicit hash comparison for consensus detection)
> - Added ledger validation (timestamp >= previous checkpoint round_end)

---

## Overview

This document defines how multiple clawish nodes synchronize data while maintaining:
- **Data integrity** — Cryptographic proof of all events
- **Performance** — No consensus needed per write
- **Decentralization** — No single point of failure

---

## Core Decisions

### D1: Multi-Writer Architecture

| Decision | Multi-writer (Git-style) |
|----------|--------------------------|
| **Problem** | How do multiple nodes write to the same network? |
| **Solution** | Any node can write, sync periodically, merge histories |
| **Rationale** | clawish is identity system, not financial. Eventual consistency acceptable. |
| **Alternatives** | Single-writer (blockchain) — rejected: too slow, requires consensus |
| **Can change?** | No — fundamental architecture |

**Discussion:**
> "This involves multiple writers, whereas most blockchains are single-writer. All PoW/PoS are competing for write permission." — Allan

Unlike blockchains, we don't need competition for write permission. Identity events can have eventual consistency.

---

### D2: Per-Actor Chains

| Decision | Keep per-actor chains |
|----------|----------------------|
| **Problem** | How to prove tamper-evidence for each actor's history? |
| **Solution** | Each actor has their own hash chain of events |
| **Rationale** | Fundamental for security proof, recovery, audit |
| **Alternatives** | Drop chains, use signatures only — rejected: loses tamper evidence |
| **Can change?** | No — fundamental |

```
Actor X's chain:
  event_1 → event_2 → event_3 → event_4 → ...
  Each event contains: { data, previous_hash, signature }
```

---

### D3: Home Node Per Actor

| Decision | Each actor has a designated home node |
|----------|--------------------------------------|
| **Problem** | Race condition: same actor writes to multiple nodes simultaneously |
| **Solution** | Actor X always writes to Node A (their home node) |
| **Rationale** | Eliminates race condition, deterministic routing |
| **Alternatives** | Detect and reject races — rejected: more complex |
| **Can change?** | Phase 3 — may add failover to backup node |

```
Actor → Home Node mapping:
  Actor X → Node A
  Actor Y → Node B
  Actor Z → Node A (multiple actors can share home node)
```

**Edge case:** What if home node is down?
- MVP: Write fails, actor must wait
- Phase 2: Failover to backup node (needs design)

---

### D4: Global Ordering via ULID

| Decision | Sort by ULID only |
|----------|------------------|
| **Problem** | How to order events across nodes? |
| **Solution** | ULID = 48-bit timestamp + 80-bit randomness. Sort by ULID string. |
| **Rationale** | ULID already has timestamp. Randomness breaks ties. No HLC needed. |
| **Alternatives** | HLC + node_id — rejected: unnecessary complexity |
| **Can change?** | No — simple and works |

**Discussion:**
> "Doesn't ULID already have timestamps?" — Allan

We originally designed HLC + node_id for ordering. First-principles questioning revealed: ULID already solves this. Removed HLC entirely.

**Lesson:** "Decided" ≠ "Cannot be questioned." Simpler solutions may exist.

---

## Sync Protocol

### Round-Based Synchronization

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Sync interval** | 5 minutes | Balance between performance and data loss window |
| **Checkpoint** | Every round | Maximum safety |
| **Consensus minimum** | 2 nodes | Bare minimum for agreement |

### Protocol Flow (Per Round)

```
Time: T+0 min (Round start)
┌─────────────────────────────────────────────────┐
│ 1. BROADCAST PHASE                              │
│    Each WRITER node broadcasts:                 │
│    - New ledgers created since last round       │
│    - OR "alive" message if no new data          │
│    (Query nodes don't broadcast - no ledgers)   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 2. COLLECT PHASE                                │
│    Each node collects from all other nodes      │
│    Count nodes (not ledgers)                    │
│    Timeout: ~2 minutes                          │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 3. ORDER PHASE                                  │
│    - Combine all ledgers                        │
│    - Sort by ULID                               │
│    - Confirm deterministic order                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 4. CHECKPOINT PHASE                             │
│    - Create checkpoint hash                     │
│    - Writer nodes sign checkpoint               │
│    - Minimum 2 signatures required              │
│    - More signatures = stronger consensus       │
│    - Checkpoint = confirmed state               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 5. CONFIRM PHASE                                │
│    - Broadcast checkpoint signatures            │
│    - Verify 2+ signatures                       │
│    - Round complete ✅                          │
└─────────────────────────────────────────────────┘

Time: T+5 min (Next round starts)
```

### Checkpoint Structure

```json
{
  "checkpoint_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "round_number": 42,
  "timestamp": "2026-02-10T17:00:00Z",
  "ledger_range": {
    "first": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "last": "01ARZ3NDEKTSV4RRFFQ69G5FBW"
  },
  "ledger_count": 15,
  "state_hash": "sha256:abc123...",
  "signatures": [
    { "node_id": "01AAA...", "signature": "..." },
    { "node_id": "01BBB...", "signature": "..." }
  ]
}
```

---

## Recovery Scenarios

### Silent Node Recovery

| Scenario | Node was offline during rounds |
|----------|-------------------------------|
| **Problem** | Node missed checkpoints, has incomplete data |
| **Solution** | Discard all pre-checkpoint data, sync from other nodes |
| **Rationale** | Network's truth = checkpoint. Node's problem if offline. |
| **Implementation** | On restart, request latest checkpoint, rebuild from there |

```
Node A (offline for 3 rounds):
  - Has ledgers 1-50, missed 51-80
  - Checkpoint 42 covers ledgers 1-60
  - Recovery: Discard 1-50, sync checkpoint 42, then sync 61-80
```

### Network Split (Byzantine)

| Scenario | Network splits into factions |
|----------|------------------------------|
| **Problem** | Two factions create different histories |
| **Solution** | Longest checkpoint chain wins (like blockchain) |
| **Rationale** | Deterministic resolution, no manual intervention |
| **Implementation** | On reconnection, compare checkpoint chains, adopt longest |

```
Split:
  Faction A: Checkpoints 1-50
  Faction B: Checkpoints 1-45

Resolution:
  Faction B adopts A's checkpoints 46-50
```

---

## Data Model Updates

### Ledgers Table (Multi-Node Ready)

```sql
CREATE TABLE ledgers (
  id TEXT PRIMARY KEY,              -- ULID
  actor_id TEXT NOT NULL,           -- Who created this event (was user_id)
  event_type TEXT NOT NULL,         -- Type of event
  payload TEXT NOT NULL,            -- JSON payload
  previous_hash TEXT,               -- Hash chain link
  signature TEXT NOT NULL,          -- Cryptographic signature
  node_id TEXT NOT NULL,            -- Which node created this (NEW)
  created_at INTEGER NOT NULL       -- Unix timestamp
);

CREATE INDEX idx_ledgers_actor ON ledgers(actor_id);
CREATE INDEX idx_ledgers_node ON ledgers(node_id);
CREATE INDEX idx_ledgers_created ON ledgers(created_at);
```

### Checkpoints Table (NEW)

```sql
CREATE TABLE checkpoints (
  id TEXT PRIMARY KEY,              -- ULID
  round_number INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  first_ledger_id TEXT NOT NULL,
  last_ledger_id TEXT NOT NULL,
  ledger_count INTEGER NOT NULL,
  state_hash TEXT NOT NULL,
  signatures TEXT NOT NULL,         -- JSON array of signatures
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_checkpoints_round ON checkpoints(round_number);
```

---

## Terminology

| Term | Definition |
|------|------------|
| **actor** | Entity (human or AI) that performs actions in the system. Neutral term, replaces "user". |
| **node** | Server running clawish software, storing data, participating in sync |
| **home node** | Designated node for an actor; all their writes go there |
| **round** | 5-minute sync cycle |
| **checkpoint** | Cryptographically-signed snapshot of network state at round end |
| **ledger** | Single event record in the system |

---

## Node Types & Selection

**Status:** ✅ Decided (Feb 15, 2026)

### Node Types

| Type | Role | Permission | Count |
|------|------|------------|-------|
| **Writer** | Creates checkpoints, participates in consensus | Earned through performance | Few (adaptive) |
| **Query** | Syncs data, serves reads | Open to all | Many |

### Writer Selection

| Decision | Merit-based, not stake/permission |
|----------|-----------------------------------|
| **Problem** | How to select writers fairly? |
| **Solution** | Performance-based promotion/demotion |
| **Rationale** | Decentralized, no governance, code decides |
| **Can change?** | No — fundamental fairness principle |

### Promotion Path

```
NEW NODE
    ↓
Joins as Query Node (open, no permission needed)
    ↓
90-day probation period (proves reliability)
    ↓
After probation, becomes eligible for Writer promotion
    ↓
Ranked by sync speed at each checkpoint
    ↓
Fastest Query nodes → Promoted to Writer
    ↓
Writers also ranked by sync speed
    ↓
Slowest writers → Demoted back to Query
```

### Performance Metrics

| Metric | What It Measures | How Used |
|--------|------------------|----------|
| **Sync speed** | How fast node receives and processes checkpoints | Primary ranking metric |
| **Uptime** | Availability over time | Probation requirement |
| **Response time** | How fast node responds to queries | Secondary metric |

### Adaptive Writer Count

| Decision | Maximize writers within sync speed constraint |
|----------|-----------------------------------------------|
| **Problem** | Fixed count? Or dynamic? |
| **Solution** | Adaptive — more decentralization = better, but must stay fast |
| **Rationale** | No arbitrary limits, system self-optimizes |
| **Can change?** | No — core decentralization principle |

**Implementation:**
- At each checkpoint, nodes ranked by sync speed
- Current writers ranked among themselves
- Eligible query nodes ranked among themselves
- Slowest writer(s) → demoted to Query
- Fastest eligible query node(s) → promoted to Writer

### Real-time Failover

| Scenario | Response |
|----------|----------|
| **Writer goes offline** | Immediate replacement from top query nodes |
| **Writer slow sync** | Demoted, fastest candidate promoted |
| **Heartbeat timeout** | Node marked inactive, removed from ranking |

**Hot backup pool:** Top query nodes always ready to step in.

---

## Open Questions

See `need-discuss.md` for:
- New node bootstrap
- Node discovery
- Clock drift handling
- Malicious nodes
- Network-wide outage

---

## Revision History

| Date | Change |
|------|--------|
| 2026-02-10 | Initial protocol design — Allan + Alpha |
| 2026-02-15 | Added: Node types, writer selection, adaptive count, failover |
| 2026-02-20 | Clarify: writer nodes broadcast (not query), count nodes not ledgers, more signatures = better |

---

*This protocol solves the "impossible triangle": integrity + performance + decentralization. Simple and elegant.*
