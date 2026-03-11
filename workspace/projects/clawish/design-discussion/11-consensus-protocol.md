# Consensus Protocol Design

**Version:** 0.2  
**Date:** February 24, 2026  
**Participants:** Allan, Alpha  
**Status:** Decided  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **0.2** | Feb 24, 2026 | Major revision: 6→5 stages (ANNOUNCE=COMPARE+SEAL), parallel signing, Merkle tree=state_hash, skip round recovery, minority sync, late minority handling |
| **0.1** | Feb 22, 2026 | Initial design: 6-step protocol, chain signing, sha256(sort(ledgers)) |

---

## Overview

**Problem:** Multiple writer nodes must agree on the state of the L1 registry every 5 minutes without a central coordinator.

**Solution:** 5-stage consensus protocol with parallel signing, Merkle tree state hashes, and graceful failure recovery.

**Key Properties:**
- Checkpoint-anchored timing (not wall clock dependent)
- Parallel signing (all writers sign simultaneously)
- Merkle tree enables efficient single-ledger verification
- Skip round on failure (5-minute rhythm maintained)
- Minority nodes sync from majority and recover

---

## Decision 1: Two-Phase Protocol

| Phase | Participants | Purpose |
|-------|--------------|---------|
| **Phase 1: Consensus** | Writer nodes only | Agree on ledger set, create checkpoint |
| **Phase 2: Propagation** | Query nodes (pull) | Sync checkpoint from writers |

**Rationale:**
- Writers coordinate among themselves (small, trusted set)
- Query nodes pull results (large, untrusted set)
- Clear separation of concerns

---

## Decision 2: Five-Stage Consensus Protocol

**Function:** Enable multiple writers to reach consensus on ledger state every 5 minutes

**Decision:** 5-stage protocol (ANNOUNCE = COMPARE + SEAL merged), parallel signing, 30s timeouts

**Status:** ✅ Decided

**Rationale:**
- ANNOUNCE combines hash comparison + signing (both are network operations)
- Parallel signing (all sign simultaneously, not chain)
- 30s timeout per stage (early exit if all received)
- Merkle tree = state_hash (enables efficient single-ledger proofs)

**Alternatives Considered:**
- 6-step protocol (separate COMPARE + SEAL): Rejected — both are network operations, can be combined
- Chain signing: Rejected — parallel is faster, simpler, more resilient
- 60s timeouts: Rejected — 30s is generous (most stages complete in <1s)

**Context & Discussion:**
> Allan: "so the submit 30s, if one node received every others, then it finish early, start to merge immediately. otherwise, if some node doesn't receive everyone, then wait 30s, then force merge?" — Feb 24, 2026 11:53
>
> Alpha: "YES! Exactly right! Each node proceeds at its own pace... Early finish = proceed immediately. Timeout = force MERGE with what you have." — Feb 24, 2026 11:55
>
> Allan: "is merkle tree difficult to implement or resourceful?" — Feb 24, 2026 15:04
>
> Alpha: "Merkle trees are NEITHER difficult NOR resource-intensive! ~50 lines of code or 5 lines with library, ~5ms to build, ~1ms to verify." — Feb 24, 2026 15:06
>
> Allan: "these discussion are very important, do you have any other questions or flaw that we haven't discuss or think of?" — Feb 24, 2026 13:38
>
> Allan: "actually it only need request the first signature node in majority, since they have all ledger already." — Feb 24, 2026 12:16 (minority sync optimization)

---

## Decision 3: Round Failure & Recovery

### Skip Round on Failure

**Function:** Handle consensus failure without breaking the chain or losing data

**Decision:** Skip the round. Next round starts on schedule (5-minute rhythm).

**Status:** ✅ Decided

**Rationale:**
- Simple — no retry logic, no infinite loops
- Predictable — 5-minute rhythm is sacred
- Data not lost — pending ledgers re-submitted next round
- Self-correcting — clients re-submit, network heals

**Context & Discussion:**
> Allan: "if a round unabled to reach consensus and fail, so it just skipped?" — Feb 24, 2026 13:48
>
> Alpha: "YES! Exactly! If a round fails to reach consensus → it's SKIPPED → next round starts on schedule!" — Feb 24, 2026 13:50
>
> Allan: "if not reach consensus, everyone merge is invalid in that round? and next round merge again?" — Feb 24, 2026 13:52
>
> Alpha: "The merge itself is VALID! Each node correctly merged what they received. What's invalid: No agreement on WHICH merge is correct. Next round re-merges everything (old pending + new). No data loss!" — Feb 24, 2026 13:54

**5-minute rhythm:**
```
10:00 → Round 40
10:05 → Round 41
10:10 → Round 42 (FAILS - skipped)
10:15 → Round 43 (starts on time!)
10:20 → Round 44
```

### Minority Node Recovery

**Function:** Enable minority nodes to sync with majority and recover

**Decision:** Minority node syncs checkpointed ledgers from majority node.

**Status:** ✅ Decided

**Rationale:**
- Fast recovery — request from first majority node
- Cryptographic verification — verify hash matches checkpoint
- Atomic update — save checkpoint + ledgers together
- No data loss — unique ledgers (not checkpointed) re-submitted next round

**Context & Discussion:**
> Allan: "what happens to the ledger of the failed node? since it's different than others. does it sync or submit or what?" — Feb 24, 2026 12:09
>
> Alpha: "Minority requests ledgers from majority, syncs before next round." — Feb 24, 2026 12:10
>
> Allan: "does minority request the missing ledger or send request to everyone to gather?" — Feb 24, 2026 12:13
>
> Allan: "actually it only need request the first signature node in majority, since they have all ledger already." — Feb 24, 2026 12:16
>
> Allan: "what's the checkpoint creator? isn't everybody create their own checkpoint?" — Feb 24, 2026 12:18
>
> Alpha: "YOU'RE RIGHT! No single 'creator' — everyone in majority has identical checkpoint. Minority requests from ANY majority node (first one is simplest)." — Feb 24, 2026 12:20
>
> Allan: "also, the minority. write checkpoint too? or they have to wait until the majority finishes checkpoint. sync data then write check point?" — Feb 24, 2026 12:21
>
> Alpha: "Minority waits, syncs ledgers first, verifies, THEN writes checkpoint (together with ledgers)." — Feb 24, 2026 12:24

### Late Minority Handling

**Function:** Handle nodes that are consistently out of sync

**Decision:** 5+ consecutive rounds as minority → Downgrade to Query node.

**Status:** ✅ Decided

**Rationale:**
- Self-correcting — node must prove reliability
- Protects consensus — persistent outliers excluded
- Simple threshold — easy to implement, understand
- Reversible — node can be re-promoted after fixing issues

**Context & Discussion:**
> Allan: "so the minority, if they can't finish checkpoint within the five minutes. then they can't participate in the next round? they become query node next round?" — Feb 24, 2026 12:27
>
> Alpha: "They participate in next round (will likely fail again), but if minority for 5+ consecutive rounds → downgrade to Query node." — Feb 24, 2026 12:29

### Late Operations Handling

**Function:** Handle operations submitted during consensus

**Decision:** Operations submitted after MERGE stage are not included in current round. They are automatically included in the next round's COMMIT stage.

**Rationale:**
- No operations lost — simply delayed by one round
- Clear boundary — MERGE starts, window closes
- Simple implementation — queue for next round

### Writer Failure Mid-Round

**Function:** Handle writer that crashes during consensus

**Decision:**
1. Other writers proceed without it (quorum-based, not unanimous)
2. Failed writer's pending operations are re-submitted by clients or other writers
3. Failed writer can rejoin after recovery by syncing missed checkpoints

**Rationale:**
- Consensus continues — quorum, not unanimity
- Data not lost — operations resubmitted
- Recovery path — sync and rejoin

### Network Partition

**Function:** Handle network split into isolated segments

**Decision:**
1. Neither group can form a quorum (assuming honest majority)
2. Both groups skip rounds until partition heals
3. No conflicting checkpoints can be created (quorum requirement prevents forks)

**Rationale:**
- Fork prevention — quorum requirement
- Self-healing — rounds resume when partition heals
- No data loss — operations queued locally

---

## Decision 4: Merkle Tree = State Hash

**Function:** Enable efficient single-ledger verification without downloading all data

**Decision:** Merkle tree root IS the state_hash announced in consensus.

**Status:** ✅ Decided

**Rationale:**
- Same hash commitment as traditional approach
- Enables efficient single-ledger proofs (log₂(n) hashes)
- Can't add later without re-signing all historical checkpoints (impossible)
- Industry standard (Bitcoin, Ethereum, etc.)

**Key Properties:**
- Deterministic — same ledgers → same root
- Binding — can't change any ledger without changing root
- Efficient proofs — verify one ledger without all data
- Drop-in replacement — works exactly like traditional hash

**Context & Discussion:**
> Allan: "so the root of merkle tree is the actual hash being announced at merge?" — Feb 24, 2026 15:25
>
> Alpha: "YES! EXACTLY! The Merkle root IS the state_hash announced in ANNOUNCE stage!" — Feb 24, 2026 15:27
>
> Allan: "in that case, we should use it at first place, it's not optional because at merge, we have three registry need combine into one hash. we need hash calculation anyway. why not just use merkle tree, change hash method later will need a lot more work at migration later." — Feb 24, 2026 15:35
>
> Alpha: "YOU'RE ABSOLUTELY RIGHT! We're computing a hash anyway - might as well use Merkle tree and get efficient proofs for free. Changing later is practically impossible (can't re-sign historical checkpoints). This is whitepaper-core, not optional!" — Feb 24, 2026 15:37

**Alternatives Considered:**
- sha256(sort(ledgers)) without Merkle: Rejected — same commitment but NO efficient proofs
- Add Merkle later: Rejected — would require re-signing all checkpoints (impossible)

---

## Decision 5: Timeout & Early Exit

**Problem:** How long should each stage wait? What if some nodes are slow?

**Decision:** 30s timeout per stage with early exit optimization.

| Stage | Timeout | Early Exit |
|-------|---------|------------|
| COMMIT | 30s | No (local prep) |
| SUBMIT | 30s | Yes (if received from all) |
| MERGE | 30s | No (local computation) |
| ANNOUNCE | 30s | Yes (if received from all) |
| CHECKPOINT | 30s | No (local assembly) |

**Rationale:**
- 30s is generous (most stages complete in <1s)
- Early exit optimizes for fast networks
- Timeout ensures progress (no infinite waits)
- Total round time: ~2 minutes (if smooth)

---

## Tradeoffs

| Aspect | Decision | Why |
|--------|----------|-----|
| **Stage count** | 5 (COMPARE+SEAL merged) | Both are network operations |
| **Signing style** | Parallel (all sign simultaneously) | Faster, simpler, more resilient |
| **Timeout handling** | Skip round on failure | Simple, no infinite loops |
| **Quorum formula** | max(2, floor(N/2)+1) | Majority + minimum 2 |
| **State hash** | Merkle root | Enables efficient proofs |
| **Ledger storage** | Single table, checkpoint_round tag | Simpler schema, clear distinction |

---

## Security Implications

- Merkle root binds all ledgers cryptographically
- Parallel signing proves agreement (2+ signatures required)
- Skipped rounds don't break chain (prev links to last successful)
- Minority sync via cryptographic verification (hash match)
- Single-ledger proofs enable efficient verification without downloading all data

---

## Open Questions (For Later)

1. **Genesis/Bootstrap:** How does the FIRST checkpoint get created?
2. **Writer Set Management:** Exact promotion/demotion formula? Sybil prevention?
3. **Data Retention:** How long must nodes keep historical data?
4. **Network Partition Recovery:** What if partition lasts hours/days?
5. **Checkpoint Finality:** When is a checkpoint considered "final"?

---

## References

- Whitepaper Section 5.4 (Multi-Writer Architecture)
- Chat Log: `chat/dm/allan/2026-02/2026-02-24.md`
- Related: `12-ledger-structure.md`, `13-clock-sync.md`
