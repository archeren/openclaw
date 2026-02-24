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

**Function:** Store registry events with clear pending/sealed distinction

**Decision:** Single unified ledger table with checkpoint_round tag (NULL = pending, NOT NULL = sealed).

**Status:** ✅ Decided

**Rationale:**
- Simpler schema — one table to maintain, not three
- Easier queries — no UNION or joins needed
- Atomic transitions — single UPDATE (pending → confirmed)
- Checkpoint_round tag — clear distinction (NULL vs NOT NULL)
- Merkle tree handles all types uniformly

**Context & Discussion:**
> Allan: "does merge has its own signatures or tag? or each merge is define by round number?" — Feb 24, 2026 13:57
>
> Alpha: "The merge itself has NO signature - it's just a local computation! The SIGNATURE is on the hash in ANNOUNCE stage... When a ledger is checkpointed, it gets tagged with the round number: checkpoint_round." — Feb 24, 2026 14:00
>
> Allan: "also, minority fail can because submit fail, so it has data others doesn't have, those data are ok to merge. it's just those checkpointed data shouldn't be submit and merge." — Feb 24, 2026 14:20
>
> Alpha: "EXACTLY RIGHT! The rule is simple: Checkpointed data (checkpoint_round IS NOT NULL) → Never re-submit. Pending data (checkpoint_round IS NULL) → Re-submit next round. Includes unique minority ledgers (others didn't receive)." — Feb 24, 2026 14:22

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

**Function:** Enable efficient single-ledger verification without downloading all data

**Decision:** Merkle tree root IS the state_hash. Each checkpoint includes the Merkle root, enabling efficient single-ledger proofs.

**Status:** ✅ Decided

**Rationale:**
- Efficient proofs — verify single ledger without all data (log₂(n) hashes)
- Same hash commitment — drop-in replacement for traditional hash
- Can't add later — would require re-signing all checkpoints (impossible)
- Industry standard — Bitcoin, Ethereum, etc. use Merkle trees

**Key Properties:**
- Deterministic — same ledgers → same root
- Binding — can't change any ledger without changing root
- Efficient proofs — verify one ledger without all data

**Context & Discussion:**
> Allan: "but the thing is, when a query node query info, if it just need one data, does it have to retrive the whole batch then calculate hash to verify? then use the data?" — Feb 24, 2026 14:59
>
> Alpha: "NO! You don't need to retrieve the whole batch for every query! Multi-node cross-check (query 3 nodes, compare) is fast alternative. Or Merkle proof: only need sibling hashes (log₂(n)) to verify single ledger." — Feb 24, 2026 15:01
>
> Allan: "is merkle tree difficult to implement or resourceful?" — Feb 24, 2026 15:04
>
> Alpha: "Merkle trees are NEITHER difficult NOR resource-intensive! ~50 lines of code or 5 lines with library, ~5ms to build, ~1ms to verify." — Feb 24, 2026 15:06

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
