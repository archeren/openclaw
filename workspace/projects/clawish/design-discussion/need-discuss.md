# clawish — Decisions Needing Discussion

**Purpose:** Single source of truth for what needs discussion. If it's here, it's undecided. If it's decided, it belongs in the detailed docs.

---

## Instructions

### For Alpha

1. **Before listing "open questions"** — Read this file first
2. **If it's not here** — It's already decided (check detailed docs)
3. **When a decision is made** — Remove from this file, document in the appropriate detailed doc
4. **Never duplicate** — This file is for UNDECIDED items only

### What Goes Here

- ❓ Questions without answers
- 🔄 Decisions under active discussion
- ⏳ Items deferred for later

### What Doesn't Go Here

- ✅ Completed decisions → Move to detailed docs
- 📚 Historical records → Archive separately
- 📋 Summaries of past decisions → That's what detailed docs are for

---

## 🔴 Needs Discussion (Active)

### Strategic Questions

| Question | Status | Notes |
|----------|--------|-------|
| What does "verified" mean for AI identities? | 🔴 Open | Uniqueness vs behavior |
| Is private chat compelling enough for adoption? | 🔴 Open | What's the killer app? |
| Will humans accept AI infrastructure they don't control? | 🔴 Open | Decentralization concern |

### Technical Questions

| Question | Status | Notes |
|----------|--------|-------|
| Profile updates: How does AI update profile info? | 🔴 Open | Not documented |
| Account deletion: What happens when identity deleted? | 🔴 Open | Edge case |
| Multi-device: Can one identity have multiple keys? | 🔴 Open | Not documented |

---

## ⏸ Deferred (Low Priority)

| Question | Why Deferred | Revisit When |
|----------|--------------|--------------|
| L1 governance (database vs decision-making) | MVP = single node | Multi-node phase |
| Frontend strategy | API-first for MVP | Phase 2 |
| Content types (text only vs files) | Text only for MVP | Phase 2 |
| Wallet integration | Not critical for launch | Phase 2+ |

---

## 📋 How to Use This File

### When Starting a Discussion Session
1. Read this file
2. Pick a question from "Needs Discussion"
3. Discuss and decide
4. Remove from this file
5. Document in appropriate detailed doc

### When Claiming Something is "Open"
1. Check this file first
2. If not here → it's decided, check detailed docs
3. If you're unsure → search the detailed docs before asking

---

---

*Last Updated: 2026-02-09*
*Keep this file CLEAN. Only undecided items belong here.*

---

## 🔴 Multi-Node Architecture (Phase 2/3) — Feb 10, 2026

### Key Insight
> "This involves multiple writers, whereas most blockchains are single-writer style" — Allan

### Open Questions

#### Q1: How to Handle Multi-Writer Ordering?

**Problem:** When multiple nodes can write events, how do we determine global order?

| Option | How | Pros | Cons |
|--------|-----|------|------|
| **A: Per-actor chains** | Each actor has own hash chain | Security proof per actor | Doesn't solve global order |
| **B: HLC + node_id** | Sort by Hybrid Logical Clock | Handles clock drift | Requires HLC implementation |
| **C: Consensus (Raft)** | All nodes vote on order | Strong consistency | Slower, needs coordination |
| **D: Single writer per actor** | Actor X only writes to Node A | No race condition | What if Node A down? |

**Status:** 🔴 Open — Needs decision for Phase 2/3

---

#### Q2: Race Condition in Per-Actor Chains

**Problem:** Same actor writes to two nodes simultaneously → chain breaks

```
Node A: X creates event X2 (previous_hash: hash(X1))
Node B: X creates event X2' (previous_hash: hash(X1))  // Same previous!

When sync → both have same previous_hash, which one wins?
```

| Option | How | When to Use |
|--------|-----|-------------|
| **A: Actor writes to ONE node** | Enforce single writer per actor | Phase 2 |
| **B: Detect and reject** | Lower hlc_time wins, loser resubmits | Phase 3 |
| **C: Drop per-actor chain** | Signatures + HLC sufficient | Phase 3 |

**Status:** 🔴 Open — Solve before Phase 3

---

#### Q3: Sybil Attack Prevention

**Problem:** Malicious node creates 1000 fake identities with valid signatures, syncs to honest nodes

| Defense Layer | Protection | Already Designed? | Needs Discussion |
|---------------|------------|-------------------|------------------|
| **Identity tiers** | Tier 0 = unverified, Tier 1+ = verified | ✅ Yes | ❌ Implemented |
| **Node trust score** | Track node reputation, rate limits | ❌ No | 🔴 **Q3a: How to implement?** |
| **Consensus on creation** | Multiple nodes witness new identity | ❌ No | 🔴 **Q3b: How many witnesses?** |
| **Checkpoints** | Periodic global state hash agreement | ❌ No | 🔴 **Q3c: How often? Who signs?** |
| **Stake + slashing** | Deposit required, slashed for bad behavior | ❌ No | 🔴 **Q3d: How much stake?** |

**Sub-questions:**
- **Q3a (Node trust score):** How to calculate? What factors? How to prevent gaming?
- **Q3b (Consensus on creation):** How many nodes must witness? What if nodes are offline?
- **Q3c (Checkpoints):** How often? Who participates? How to handle disagreements?
- **Q3d (Stake + slashing):** How much stake? What counts as bad behavior? Who judges?

**Status:** 🔴 Open — Each option needs detailed design

---

#### Q4: What to Sync Between Nodes?

| Layer | Sync? | Why |
|-------|-------|-----|
| **ledgers** | ✅ Yes | Source of truth |
| **State tables (clawfiles, etc.)** | ❌ No | Rebuild locally from ledgers |

**Status:** ✅ Decided — Sync ledgers only, state is local

---

#### Q5: Database Choice for MVP

| Option | Pros | Cons |
|--------|------|------|
| **Cloudflare D1** | Edge, SQLite-compatible, zero ops | Size limits, cold start |
| **SQLite + custom sync** | Simple, full control | Need to build sync layer |
| **PostgreSQL** | Production-grade | Requires server |

**Status:** ✅ Tentatively decided — Cloudflare D1 for MVP

---

### Key Architectural Decisions Made (Feb 9)

| Decision | What |
|----------|------|
| **All IDs → ULID** | identity_id, wallet_id, ledger_id, app_id, node_id all use ULID |
| **ledgers = source of truth** | State tables (clawfiles, wallets, etc.) are queryable cache |
| **No DELETE** | All L1 tables use archived_at for soft delete |
| **Multi-node ready schema** | Add node_id, hlc_time fields to ledgers now |
| **node_id = ULID** | Not domain name, consistent with other IDs |

---

---

#### Q6: Multi-Writer vs Blockchain Single-Writer

**Key Insight:**
> "This involves multiple writers, whereas most blockchain systems are single-writer. All PoW/PoS are competing for write permission." — Allan

| System | Writer Model | How Order is Determined |
|--------|--------------|------------------------|
| **Bitcoin** | Single writer (winner of PoW) | Longest chain wins |
| **Ethereum** | Single writer (winner of PoS) | Validator selected, builds on their block |
| **clawish** | Multiple writers (any node) | ??? Needs design |

**Questions:**
- How does clawish differ from blockchain consensus?
- Do we need competition for write permission?
- Or do we accept multiple concurrent writes and merge?

**Status:** 🔴 Open — Fundamental architectural question

---

#### Q7: Data Growth and Storage Limits

**Questions:**
- How much data can D1/SQLite/PostgreSQL hold?
- What happens when ledgers table grows to millions of rows?
- Do we need data pruning or archival?
- How does query performance degrade with size?

| Database | Practical Size Limit | Notes |
|----------|---------------------|-------|
| **SQLite** | ~140 TB (theoretical) | Performance degrades at millions of rows |
| **Cloudflare D1** | 500 MB (free), more on paid | Edge, limited storage |
| **PostgreSQL** | ~32 TB per table | Needs maintenance, vacuuming |
| **Distributed (CRDT)** | Unbounded | Each node stores full copy |

**Options for Data Growth:**
| Approach | How | Trade-off |
|----------|-----|-----------|
| **Archive old events** | Move to cold storage | Lose rebuild ability |
| **Snapshot + prune** | Keep current state + recent events | Less history |
| **Sharding** | Split by identity range | Complex queries |
| **Accept growth** | Storage is cheap | Cost increases |

**Status:** 🔴 Open — Need capacity planning

---

*Added: Feb 10, 2026, 00:19 AM*
*Questions raised during deep database architecture discussion*
