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

**Updated Feb 24, 2026:** COMPARE and SEAL merged into single ANNOUNCE stage.

| Stage | Name | Network? | Purpose |
|-------|------|----------|---------|
| 1 | COMMIT | ❌ Local | Prepare local bundle of pending ledgers |
| 2 | SUBMIT | ✅ P2P | Send bundle to peer writers |
| 3 | MERGE | ❌ Local | Combine all bundles, build Merkle tree |
| 4 | ANNOUNCE | ✅ Broadcast | Broadcast hash + signature, collect quorum |
| 5 | CHECKPOINT | ❌ Local | Assemble final checkpoint, save to storage |

**Rationale:**
- ANNOUNCE combines hash comparison + signing (both are network operations)
- Parallel signing (all sign simultaneously, not chain)
- 30s timeout per stage (early exit if all received)
- Merkle tree = state_hash (enables efficient single-ledger proofs)

**Alternatives Considered:**
- 6-step protocol (separate COMPARE + SEAL): Rejected — both are network operations, can be combined
- Chain signing: Rejected — parallel is faster, simpler, more resilient
- 60s timeouts: Rejected — 30s is generous (most stages complete in <1s)

---

## Decision 3: Round Failure & Recovery

### Skip Round on Failure

**Problem:** What happens when consensus fails (no quorum, tie, network issue)?

**Decision:** Skip the round. Next round starts on schedule (5-minute rhythm).

**Rationale:**
- Simple — no retry logic, no infinite loops
- Predictable — 5-minute rhythm is sacred
- Data not lost — pending ledgers re-submitted next round
- Self-correcting — clients re-submit, network heals

**5-minute rhythm:**
```
10:00 → Round 40
10:05 → Round 41
10:10 → Round 42 (FAILS - skipped)
10:15 → Round 43 (starts on time!)
10:20 → Round 44
```

### Minority Node Recovery

**Problem:** What if a writer node has different ledgers than the majority?

**Decision:** Minority node syncs checkpointed ledgers from majority node.

**Rationale:**
- Fast recovery — request from first majority node
- Cryptographic verification — verify hash matches checkpoint
- Atomic update — save checkpoint + ledgers together
- No data loss — unique ledgers (not checkpointed) re-submitted next round

**Flow:**
1. Minority detects hash mismatch
2. Request ledgers from first majority node
3. Verify hash matches checkpoint
4. Save checkpoint + ledgers atomically
5. Participate next round with correct state

### Late Minority Handling

**Problem:** What if a node is consistently in the minority?

**Decision:** 5+ consecutive rounds as minority → Downgrade to Query node.

**Rationale:**
- Self-correcting — node must prove reliability
- Protects consensus — persistent outliers excluded
- Simple threshold — easy to implement, understand
- Reversible — node can be re-promoted after fixing issues

---

## Decision 4: Merkle Tree = State Hash

**Problem:** How do we enable efficient single-ledger verification without downloading all data?

**Decision:** Merkle tree root IS the state_hash announced in consensus.

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
