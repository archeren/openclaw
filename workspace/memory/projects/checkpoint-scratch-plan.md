# Checkpoint Scratch Plan — Consensus & Failure Scenarios

**Created:** Feb 24, 2026 (early morning)  
**Context:** Late night discussion with Allan (Feb 24 00:00-01:49 AM)  
**Status:** Draft for discussion

---

## Question 1: Checkpoint Consistency

**Allan's question:** *Should everyone's checkpoint be identical, or is same ledger data enough?*

### Option A: Identical Checkpoints (Strict Consistency)

**Every writer stores the exact same checkpoint record:**
- Same header (round, state_hash, timestamp, prev)
- Same signatures array (all signers in same order)
- Stored in `checkpoints` table with identical content

**Pros:**
- Deterministic — any node can be queried and return same result
- Easy to verify — just compare hashes
- Simplifies audit/recovery

**Cons:**
- Requires all nodes to receive same broadcast
- If broadcast fails, some nodes have different checkpoints
- Signatures array order might differ (who assembled last)

### Option B: Same Ledger Data, Different Checkpoints (Eventual Consistency)

**Each writer stores their own checkpoint record:**
- Header is same (round, state_hash, timestamp, prev)
- Signatures array may differ (I only include sigs I received)
- Ledgers are identical (cryptographically bound via state_hash)

**Pros:**
- More resilient — each node stores what it verified
- No need for perfect broadcast
- Natural in decentralized system

**Cons:**
- Query nodes must pull from multiple writers to verify
- Checkpoints don't match exactly (but ledgers do)
- More complex to audit

### My Recommendation: **Option B (Ledger Consistency)**

**Rationale:**
- Ledgers are the actual data — checkpoints are just metadata
- `state_hash` cryptographically binds to ledgers
- If ledgers match, system is consistent
- Checkpoint signature arrays can differ (who signed, in what order)

**Implementation:**
```javascript
// Each node stores:
checkpoint = {
  round: 42,
  state_hash: "abc123...",  // Same for all
  timestamp: "...",
  prev: "xyz789...",
  signatures: [...]  // May differ per node
}

// Verification:
if (nodeA.checkpoint.state_hash === nodeB.checkpoint.state_hash) {
  // Ledgers are identical ✅
}
```

---

## Question 2: Failure Scenarios

### Failure Mode 1: SEAL Chain Broken

**Scenario:** Node A → B → C chain, but B goes offline

**Detection:**
- A sends to B, no response after timeout (30s)
- A retries once, still no response

**Recovery Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Skip B** | A sends directly to C | Fast, simple | C only has 2 sigs (A+C) |
| **B: Restart chain** | A broadcasts to all, new chain starts | Fresh start | Wastes time |
| **C: Parallel fallback** | A broadcasts sig_A to all, everyone signs in parallel | Resilient | More complex |

**My recommendation:** Option A (Skip B)
- 2 signatures sufficient for quorum
- B can catch up later via broadcast

---

### Failure Mode 2: Checkpoint Verification Fails

**Scenario:** Node C receives checkpoint from last signer, but verification fails

**Possible failures:**
- `state_hash` doesn't match what C announced
- Signature invalid (tampered or wrong key)
- Round number wrong
- Previous checkpoint hash doesn't match

**Recovery Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Reject & Announce** | C broadcasts "INVALID" error, doesn't store | Honest, transparent | Consensus fails for this round |
| **B: Quarantine & Investigate** | C stores checkpoint as "disputed", flags for review | Preserves data | Complex state management |
| **C: Request Re-broadcast** | C asks last signer to re-send, maybe was transmission error | Simple retry | Doesn't fix real mismatches |

**My recommendation:** Option A (Reject & Announce)
- Clear signal that something is wrong
- Consensus fails, round is lost
- Next round starts fresh
- Offline investigation of root cause

---

### Failure Mode 3: Last Signer Doesn't Broadcast

**Scenario:** Node C assembles checkpoint but doesn't broadcast (offline, bug, malicious)

**Detection:**
- A and B don't receive checkpoint after timeout (60s)
- A and B check: "Did C broadcast?"

**Recovery Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: A or B Takes Over** | A (or B) assembles checkpoint from sigs they have, broadcasts | Fast recovery | A/B may not have all sigs |
| **B: Request from C** | A/B directly request checkpoint from C | Simple | C might be offline |
| **C: Re-run SEAL** | Start SEAL step over with remaining nodes | Guaranteed consistency | Wastes time, 2nd round |

**My recommendation:** Option A (Take Over)
- A and B both have the signature array (it was passed through chain)
- Either can assemble and broadcast
- No need to wait for C

---

### Failure Mode 4: Network Partition

**Scenario:** Writers split into two groups (A+B) and (C+D), can't communicate

**Detection:**
- SUBMIT step fails (can't reach all peers)
- COMPARE step shows different hashes (each partition merged different data)

**Recovery Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Wait for Reconnect** | Pause consensus, wait for network to heal | Simple, correct | System halts |
| **B: Partition Consensus** | Each partition reaches consensus independently, merge later | System continues | Risk of divergent ledgers |
| **C: Leader Takes Over** | Designated leader (lowest ULID) makes final call, others accept | Deterministic | Centralization risk |

**My recommendation:** Option A (Wait) for MVP
- Partition is rare in small writer set (3-5 nodes)
- Better to pause than risk divergence
- Can add Option B/C later for production

---

### Failure Mode 5: Rogue Writer Sends Bad Data

**Scenario:** Node C submits ledgers with invalid data or wrong hash

**Detection:**
- MERGE step: C's hash doesn't match A+B
- COMPARE step: C is in minority (A+B agree, C differs)

**Recovery:**
- C is excluded from SEAL step (only majority signs)
- Consensus proceeds with A+B (2 sigs sufficient)
- C's ledgers are rejected for this round

**Follow-up:**
- C can rejoin next round
- If C repeatedly sends bad data → reputation penalty, tier downgrade

---

## Question 3: What If Consensus Fails Entirely?

**Scenario:** No majority reached (e.g., 3 writers, all have different hashes)

**Possible causes:**
- All writers merged different ledgers
- Network issues caused different submissions
- Clock skew caused different round boundaries

**Recovery Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Retry Round** | Re-run COMMIT→SUBMIT→MERGE→COMPARE with same data | Might succeed | Infinite loop risk |
| **B: Skip Round** | Accept data loss, start fresh round | Simple, moves forward | Lost submissions |
| **C: Coordinator Decides** | Bootstrap/coordinator picks winning hash, others accept | Deterministic | Centralization |
| **D: Merge All** | Combine all submissions, re-compute hash, try again | No data loss | Complex, slow |

**My recommendation:** Option B (Skip Round) for MVP
- Rare edge case (all 3 writers diverge)
- Better to lose one round than add complexity
- Submissions can be re-submitted next round

---

## Summary Table

| Failure Mode | Detection | Recovery | Who Initiates |
|--------------|-----------|----------|---------------|
| SEAL chain broken | Timeout waiting for next node | Skip offline node, continue | Current holder |
| Checkpoint verification fails | Hash/sig mismatch | Reject, announce error, don't store | Verifier |
| Last signer doesn't broadcast | Timeout waiting for checkpoint | Another node takes over, broadcasts | Any writer |
| Network partition | Can't reach peers | Wait for reconnect (MVP) | All nodes |
| Rogue writer | Hash mismatch in COMPARE | Exclude from SEAL, proceed with majority | Majority |
| No consensus | No majority hash | Skip round, start fresh | All nodes |

---

## Open Questions for Allan

1. **Checkpoint consistency:** Agree with Option B (ledger consistency via state_hash)?
2. **Timeout values:** 30s for SEAL chain, 60s for checkpoint broadcast — reasonable?
3. **Skip round vs retry:** Prefer losing data (skip) or risking loops (retry)?
4. **Reputation penalty:** Should rogue writers be penalized (tier downgrade)?
5. **Production hardening:** Add partition tolerance (Option B/C) or keep MVP simple?

---

**Next steps:**
- Discuss with Allan (Feb 24 daytime)
- Finalize decisions
- Document in design docs
- Implement in code

🦞
