# Ledger Structure Design

**Version:** 0.4  
**Date:** March 9, 2026  
**Participants:** Allan, Alpha  
**Status:** Decided  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **0.4** | Mar 9, 2026 | Decision: Layered Merkle tree — each registry has sub Merkle tree (H_identity, H_ledger, H_app) combined into single root |
| **0.3** | Mar 9, 2026 | Clarified: Three registries are separate services (conceptual), single checkpoint with shared Merkle root binds all registries cryptographically |
| **0.2** | Feb 24, 2026 | Major revision: Single ledger table (was multi-dimension), checkpoint_round tag, Merkle tree integration, efficient single-ledger proofs |
| **0.1** | Feb 22, 2026 | Initial design: Multi-dimension ledgers (actor/node/app), separate tables, sha256(aggregated hashes) |

---

## Overview

**Problem:** How do we store registry events (identity, node, app management) in a way that supports efficient checkpointing, verification, and querying?

**Solution:** Three logically separate registries with shared checkpoint infrastructure. Each registry handles its own operations, but all are bound together at checkpoint time via a single Merkle tree.

**Key Properties:**
- Three separate services (Identity, Node, App registries)
- Within each registry: per-actor chains, entries interleaved by position
- Single checkpoint binds all three registries cryptographically
- Merkle tree enables efficient single-ledger proofs
- ULID provides deterministic ordering

---

## Clarification: Three Separate Registries

**Conceptual View:**

The three registries are **separate services** with different purposes:

| Registry | Purpose | Actors |
|----------|---------|--------|
| **Identity Registry** | Claw identity management | Claws (Volent/Nous sapiens) |
| **Ledger Registry** | L1 infrastructure nodes | Writer nodes, Query nodes |
| **App Registry** | L2 application registration | App developers (claws) |

**Within Each Registry:**
- Multiple actors maintain their own ledger chains
- Entries from different actors are interleaved by position
- Example: Identity Registry has entries from Alpha, Beta, Gamma interleaved

**At Checkpoint:**
- All three registries contribute entries
- Single Merkle tree hashes all entries together
- One root hash binds everything cryptographically
- One checkpoint signed by writer quorum

---

## Clarification: Three Separate Registries (Mar 9, 2026)

**Conceptual View:**

The three registries are **separate services** with different purposes:

| Registry | Purpose | Actors |
|----------|---------|--------|
| **Identity Registry** | Claw identity management | Claws (Volent/Nous sapiens) |
| **Ledger Registry** | L1 infrastructure nodes | Writer nodes, Query nodes |
| **App Registry** | L2 application registration | App developers (claws) |

**Naming Decision (Mar 9, 2026):**

Renamed "Node Registry" to "Ledger Registry" because:
- Both L1 and L2 have "nodes" (L1 infrastructure nodes, L2 app nodes)
- "Ledger Registry" clearly identifies it as L1 ledger infrastructure
- Distinguishes from L2 App Registry

**Within Each Registry:**
- Multiple actors maintain their own ledger chains
- Entries from different actors are interleaved by position
- Example: Identity Registry has entries from Alpha, Beta, Gamma interleaved

**At Checkpoint:**
- All three registries contribute entries
- Single Merkle tree hashes all entries together
- One root hash binds everything cryptographically
- One checkpoint signed by writer quorum

---

## Decision: Layered Merkle Tree (Mar 9, 2026)

**Question:** Should each registry have its own intermediate Merkle hash, or should all entries go directly into one flat Merkle tree?

**Decision:** ✅ **Layered approach**

Each registry has its own **sub Merkle tree** that produces an intermediate hash:
- H_identity = Merkle root of Identity Registry entries
- H_ledger = Merkle root of Ledger Registry entries  
- H_app = Merkle root of App Registry entries

These three intermediate hashes are then combined into a single checkpoint root hash:

```
H_checkpoint = hash(H_identity || H_ledger || H_app)
```

**Benefits:**
1. **Per-registry verification** — Query node focused on Identity Registry can verify those entries without needing Node/App entries
2. **Efficient proofs** — log₂(n_identity) + 2 hashes instead of log₂(n_total)
3. **Partial sync** — Nodes can verify specific registries independently
4. **Audit clarity** — Easy to prove "all identity entries" without exposing other registries

**Trade-off:**
- Slightly more complex structure
- Additional hash computation per checkpoint

**Context:**
> Allan: "agreed, sub merkle tree needed" — Mar 9, 2026 09:17

---

## Security Benefit of Combined Checkpoint
- Tampering with ANY entry requires recalculating the entire Merkle tree
- Attacker cannot forge just one registry in isolation
- Cross-registry operations (e.g., app registration = identity + app record) are cryptographically bound
- Changes must be consistent across all three registries

**Context & Discussion:**
> Allan: "their content are very different, can't put together. what interlace mean is for the same type individual actors. their record are interleaved. but at checkpoint, they are checkin together." — Mar 9, 2026 00:35
>
> Alpha: "Three separate registries (conceptual), each with interleaved actor entries, all contributing to one checkpoint with single Merkle root." — Mar 9, 2026 00:37
>
> Allan: "chain them together make it safer? since change one record will be hard because it's three type of registry together" — Mar 9, 2026 00:40

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

## Cross-Registry Operations

Some operations span multiple registries and must be atomic:

### Atomic Operations

| Operation | Registries Involved |
|-----------|---------------------|
| Claw registers App | Identity Registry + App Registry |
| Node promoted to Writer | Node Registry + consensus participation |
| App suspended | App Registry + API key revocation |

### Coordination

Cross-registry operations are coordinated within a single checkpoint round. Either all changes succeed, or none do (atomicity).

### Example: App Registration

1. Developer (claw) submits app registration request
2. System verifies developer identity exists in Identity Registry
3. New App record is created in App Registry
4. API keys are generated and linked to the App
5. All changes are included in the same checkpoint

### Integrity

Cross-registry operations maintain referential integrity:
- An App cannot exist without a valid developer claw
- A Node cannot be a writer without being registered

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
