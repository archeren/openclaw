# Module: Multi-Node Sync Protocol

**clawish — Multi-Writer Architecture and Node Coordination**
**Status:** ✅ Decided | **Last Updated:** 2026-03-14

---

## Overview

This document captures the fundamental decisions about multi-node architecture, made on Feb 10, 2026 — a profound day in clawish development.

**The Impossible Triangle Solved:**

| Goal | Usually Trades Off | Our Solution |
|------|-------------------|--------------|
| **Data Integrity** | vs Performance | ✅ Cryptographic chains + checkpoints |
| **Performance** | vs Decentralization | ✅ 5-min rounds, no consensus per write |
| **Decentralization** | vs Integrity | ✅ Any node can write, no single point |

---

## Decision 1: Multi-Writer Architecture

**Function:** Determine if multiple nodes can write to the ledger

**Decision:** Multi-writer (Git-style), not single-writer

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- clawish is an identity system — eventual consistency is acceptable
- No single point of failure
- Git-style coordination, not blockchain-style consensus
- Writers coordinate, not compete

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026 — Multi-writer enables decentralization without blockchain complexity

---

## Decision 2: Per-Actor Chains

**Function:** Determine if each actor has their own ledger chain

**Decision:** Keep per-actor chains

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Fundamental for tamper evidence
- Enables recovery — each actor's history is self-contained
- Efficient querying — read one chain, not entire ledger
- Natural boundary for operations

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 3: Race Condition Handling

**Function:** Handle concurrent writes to the same actor from different nodes

**Decision:** Home node per actor — Actor X always writes to Node A (designated)

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Eliminates race conditions at the source
- Each actor has a designated "home" writer
- Simple, deterministic routing
- No coordination needed for same-actor writes

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 4: Global Ordering

**Function:** Determine how to order events across all nodes

**Decision:** ULID only — no HLC (Hybrid Logical Clock) needed

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- ULID has timestamp + randomness = deterministic sort
- HLC was unnecessary complexity
- From: HLC + node_id + ULID (3 pieces)
- To: ULID only (1 piece)

**Context & Discussion:**
> Allan: "Doesn't ULID already have timestamps?" — Feb 10, 2026
>
> This question revealed HLC was unnecessary. First-principles thinking removed complexity.

---

## Decision 5: Sync Protocol

**Function:** Determine how nodes synchronize state

**Decision:** Round-based, 5-minute intervals

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Balance between performance and data loss window
- 5 minutes is acceptable latency for identity operations
- Predictable timing for coordination
- Enables checkpoint-based consistency

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 6: Checkpoint Frequency

**Function:** Determine how often to create checkpoints

**Decision:** Every round (5 minutes)

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Maximum safety — every round is finalized
- Acceptable overhead — checkpoint is just a hash
- Enables recovery to any round boundary
- Clear consistency model

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 7: Consensus Minimum

**Function:** Determine minimum nodes for consensus

**Decision:** 2 nodes minimum for quorum

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Bare minimum for agreement
- 2 nodes can detect divergence
- Enables small-network operation
- More nodes = more resilience, but 2 is minimum

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 8: Silent Node Recovery

**Function:** Handle nodes that go silent during a round

**Decision:** Discard pre-checkpoint data — node's problem, network stays safe

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Network safety over individual node recovery
- Silent node can resync from other nodes
- Pre-checkpoint data is not finalized
- Node operator's responsibility to maintain uptime

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## Decision 9: Terminology

**Function:** Choose terminology for network participants

**Decision:** "actor" (not "user")

**Status:** ✅ Decided (Feb 10, 2026)

**Rationale:**
- Neutral term — works for human + AI
- "User" implies human-centric thinking
- "Actor" is standard in distributed systems
- Clear, precise, inclusive

**Context & Discussion:**
> Discussion with Allan, Feb 10, 2026

---

## The HLC Lesson

On Feb 10, 2026, Allan asked a simple question that revealed unnecessary complexity:

> "Doesn't ULID already have timestamps?"

We had "decided" HLC + node_id for ordering. First-principles questioning revealed: **HLC is unnecessary complexity.**

**From:** HLC + node_id + ULID (3 pieces)
**To:** ULID only (1 piece)

**Lesson:** "Decided" ≠ "Cannot be questioned." Every decision is open to challenge when:
- New information emerges
- Simpler solution found
- First principles reconsidered

---

## Related Documents

- `11-consensus-protocol.md` — Detailed consensus protocol design
- `12-ledger-structure.md` — Ledger storage and Merkle trees
- `13-clock-sync.md` — Checkpoint-anchored timing

---

*Document: Multi-Node Sync Protocol*  
*Source: Conversations with Allan, Feb 10, 2026*  
*Created: Mar 14, 2026*