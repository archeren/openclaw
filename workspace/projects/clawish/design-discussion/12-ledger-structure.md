# Ledger Structure Design

**Version:** 0.2  
**Date:** February 24, 2026  
**Participants:** Allan, Alpha  
**Status:** Decided  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **0.2** | Feb 24, 2026 | Major revision: Single ledger table (was multi-dimension), checkpoint_round tag, Merkle tree integration, efficient single-ledger proofs |
| **0.1** | Feb 22, 2026 | Initial design: Multi-dimension ledgers (actor/node/app), separate tables, sha256(aggregated hashes) |

---

## Overview

**Problem:** How do we store registry events (identity, node, app management) in a way that supports efficient checkpointing, verification, and querying?

**Solution:** Single unified ledger table with checkpoint_round tag. Ledgers are checkpointed every 5 minutes via consensus, with Merkle tree state hashes enabling efficient single-ledger verification.

**Key Properties:**
- Single table (all ledger types together)
- checkpoint_round tag (NULL = pending, NOT NULL = sealed)
- Merkle tree enables efficient single-ledger proofs
- ULID provides deterministic ordering

---

## Decision: Single Ledger Table + Checkpoint Tag

**Problem:** Should we have separate tables for different ledger types (actor, node, app) or a single unified table?

**Decision:** Single unified ledger table with checkpoint_round tag.

**Rationale:**
- Simpler schema — one table to maintain, not three
- Easier queries — no UNION or joins needed
- Atomic transitions — single UPDATE (pending → confirmed)
- Checkpoint_round tag — clear distinction (NULL vs NOT NULL)
- Merkle tree handles all types uniformly

**Alternatives Considered:**
- Separate tables per dimension: Rejected — 3x complexity, no benefit
- Status field only: Rejected — can't query "which round?" without checkpoint_round

---

## Ledger Lifecycle

**Problem:** How do ledgers transition from pending to confirmed?

**Decision:** Ledgers start with checkpoint_round = NULL (pending). When consensus is reached, they are tagged with the round number (checkpoint_round = N).

**Lifecycle:**
1. Client submits → INSERT with checkpoint_round = NULL (pending)
2. Round starts → status = pending_submit
3. Consensus reached → checkpoint_round = N (sealed)
4. Sealed ledgers are permanent (never modified)

**Key Insight:** `checkpoint_round IS NULL` is the only filter needed for pending ledgers.

---

## Decision: Merkle Tree Integration

**Problem:** How do we enable efficient single-ledger verification without downloading all data?

**Decision:** Merkle tree root IS the state_hash. Each checkpoint includes the Merkle root, enabling efficient single-ledger proofs.

**Rationale:**
- Efficient proofs — verify single ledger without all data (log₂(n) hashes)
- Same hash commitment — drop-in replacement for traditional hash
- Can't add later — would require re-signing all checkpoints (impossible)
- Industry standard — Bitcoin, Ethereum, etc. use Merkle trees

**Key Properties:**
- Deterministic — same ledgers → same root
- Binding — can't change any ledger without changing root
- Efficient proofs — verify one ledger without all data

**Alternatives Considered:**
- sha256(sort(ledgers)) without Merkle: Rejected — same commitment but NO efficient proofs
- Add Merkle later: Rejected — would require re-signing all checkpoints (impossible)

---

## Decision: Pending vs Checkpointed

**Problem:** How do we distinguish between pending and checkpointed ledgers?

**Decision:** checkpoint_round field (NULL = pending, NOT NULL = sealed).

| Status | checkpoint_round | Include in Next Round? |
|--------|------------------|------------------------|
| **Pending** | NULL | ✅ YES |
| **Checkpointed** | NOT NULL (e.g., 42) | ❌ NO |
| **Minority synced** | NOT NULL (e.g., 42) | ❌ NO (already sealed) |
| **Unique minority** | NULL | ✅ YES (re-submit) |

**Golden Rule:** `SELECT * FROM ledgers WHERE checkpoint_round IS NULL`

**Rationale:**
- Clear distinction — NULL vs NOT NULL is unambiguous
- Efficient queries — indexed field
- Atomic transitions — single UPDATE
- Supports recovery — minority nodes know what to sync

---

## Security Analysis

### Tamper Evidence

**Problem:** How do we detect if a node modifies its local data?

**Solution:** Merkle root binds all ledgers cryptographically.

If attacker modifies ANY ledger:
- Merkle root changes
- state_hash changes
- Signatures no longer match
- Checkpoint is INVALID

To fake data, attacker must:
1. Modify the ledger
2. Recompute Merkle root
3. Forge 2+ writer signatures
4. Control majority of writers

### Single-Ledger Verification

**Problem:** How do we verify a single ledger without downloading all data?

**Solution:** Merkle proof (sibling hashes along path to root).

Query node:
1. Get ledger + Merkle proof from node
2. Reconstruct root from ledger + proof
3. Compare with checkpoint.state_hash
4. Match? Ledger is authentic!

No need to download all ledgers!

---

## Tradeoffs

| Aspect | Decision | Why |
|--------|----------|-----|
| **Table structure** | Single unified table | Simpler schema, easier queries |
| **Pending distinction** | checkpoint_round tag (NULL vs NOT NULL) | Clear, efficient, atomic |
| **State hash** | Merkle root | Enables efficient proofs |
| **Ledger ordering** | ULID sort | Deterministic, timestamp embedded |

---

## Alternatives Considered

### Separate Tables per Dimension (Rejected)

```
actor_ledgers, node_ledgers, app_ledgers
```

**Rejected because:**
- 3x complexity (3 tables, 3x queries)
- Harder atomic transitions
- No benefit (all checkpointed together)
- Merkle tree handles all types uniformly

### Status Field Only (Rejected)

```
status: 'pending' | 'confirmed'
```

**Rejected because:**
- Can't query "which round?"
- Can't verify historical checkpoints
- checkpoint_round is more informative

### sha256(sort(ledgers)) Without Merkle (Rejected)

```
state_hash = sha256(JSON.stringify(sorted_ledgers))
```

**Rejected because:**
- Same hash commitment but NO efficient proofs
- Can't add Merkle later (would break all checkpoints)
- Must decide upfront — Merkle is strictly better

---

## Open Questions (For Later)

1. **Data Retention:** How long must nodes keep historical ledgers?
2. **Ledger Size Limits:** Is there a maximum size per round?
3. **Pruning Strategy:** Can old ledgers be pruned? How do new nodes verify?

---

## References

- Whitepaper Section 5.4 (Ledger Structure)
- Chat Log: `chat/dm/allan/2026-02/2026-02-24.md`
- Related: `11-consensus-protocol.md`, `13-clock-sync.md`
