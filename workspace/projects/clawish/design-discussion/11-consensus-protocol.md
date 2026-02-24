# Consensus Protocol Design

**Date:** February 22, 2026  
**Participants:** Allan, Alpha  
**Status:** Decided  
**Last Updated:** February 24, 2026 (major revision)

---

## Overview

The consensus protocol enables multiple writer nodes to agree on the state of the L1 registry every 5 minutes. It is **checkpoint-anchored** (timing from consensus, not wall clock) and uses a **5-stage process** with **parallel signing** and **Merkle tree state hashes**.

---

## Decision 1: Two-Phase Protocol

| Phase | Name | Participants | Purpose |
|-------|------|--------------|---------|
| **Phase 1** | Consensus | Writer nodes only | Agree on ledger set, create checkpoint |
| **Phase 2** | Propagation | Query nodes (pull) | Sync checkpoint from writers |

**Rationale:**
- Writers coordinate among themselves (small, trusted set)
- Query nodes pull results (large, untrusted set)
- Clear separation of concerns

---

## Decision 2: Five-Stage Consensus Protocol

**Updated Feb 24, 2026:** COMPARE and SEAL merged into single ANNOUNCE stage.

| Stage | Name | Network? | Git Analogy | Purpose |
|-------|------|----------|-------------|---------|
| 1 | COMMIT | ❌ Local | `git commit` | Prepare local bundle |
| 2 | SUBMIT | ✅ P2P | `git push` | Send bundle to peers |
| 3 | MERGE | ❌ Local | `git merge` | Combine all bundles, build Merkle tree |
| 4 | ANNOUNCE | ✅ Broadcast | (none) | Broadcast hash + signature, collect quorum |
| 5 | CHECKPOINT | ❌ Local | (none) | Assemble final checkpoint, save to DB |

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

## Detailed Flow

### Stage 1: COMMIT (Local, 30s)

```javascript
// Query pending ledgers (checkpoint_round IS NULL)
ledgers = db.query(`
  SELECT * FROM ledgers
  WHERE checkpoint_round IS NULL
  ORDER BY id ASC
`);

// Create bundle
bundle = {
  node_id: my_node_id,
  round: round_number,
  ledgers: ledgers,
  bundle_hash: sha256(JSON.stringify(ledgers))
};

// Sign bundle
bundle.signature = sign(private_key, bundle);

// Mark ledgers as pending_submit
db.execute(`
  UPDATE ledgers SET status = 'pending_submit'
  WHERE id IN (?)
`, [ledger_ids]);
```

**Key:** Only includes ledgers where `checkpoint_round IS NULL` (not yet checkpointed).

---

### Stage 2: SUBMIT (P2P, 30s)

```javascript
// Send to all peer writers (fire-and-forget)
for (peer of writers) {
  if (peer.node_id === my_node_id) continue;
  
  POST https://{peer.endpoint}/sync/submit { ...bundle };
}

// Receive from peers
app.post('/sync/submit', (req, res) => {
  bundle = req.body;
  if (!verifySignature(bundle)) {
    res.status(400).send("Invalid signature");
    return;
  }
  db.insert('received_bundles', bundle);
  res.send("OK");
});

// Early exit optimization:
// - If received from ALL expected writers → proceed immediately
// - Otherwise wait up to 30s timeout
```

**Key:** Fire-and-forget (no ACK tracking). Partial delivery is OK — ANNOUNCE stage reveals who's in sync.

---

### Stage 3: MERGE (Local, 30s)

```javascript
// Collect all bundles
all_bundles = [my_bundle, ...received_bundles];

// Merge all ledgers
all_ledgers = [];
for (bundle of all_bundles) {
  all_ledgers.push(...bundle.ledgers);
}

// Remove duplicates (by ledger ID)
unique_ledgers = dedupe(all_ledgers, by='id');

// Sort by ULID (deterministic)
sorted_ledgers = sort(unique_ledgers, by='id');

// Build Merkle tree
merkle_tree = MerkleTree(sorted_ledgers, sha256);
state_hash = merkle_tree.getRoot();  // Merkle root IS the state_hash!

// Keep tree for proof generation
pending_checkpoint = {
  round: round_number,
  state_hash: state_hash,
  merkle_tree: merkle_tree
};
```

**Key:** Merkle root = state_hash. Enables efficient single-ledger proofs later.

---

### Stage 4: ANNOUNCE (P2P, 30s)

```javascript
// Broadcast hash + signature (parallel signing)
announcement = {
  node_id: my_node_id,
  round: round_number,
  state_hash: state_hash,
  signature: sign(private_key, {round: round_number, hash: state_hash})
};

for (peer of writers) {
  POST https://{peer.endpoint}/sync/announce { ...announcement };
}

// Collect announcements from peers
app.post('/sync/announce', (req, res) => {
  msg = req.body;
  if (!verifySignature(msg.node_id, msg.signature, msg.state_hash)) {
    res.status(400).send("Invalid signature");
    return;
  }
  db.insert('announcements', msg);
  res.send("OK");
});

// Wait up to 30s (early exit if all received)
// Then determine majority:
announcements = db.query('SELECT * FROM announcements WHERE round = ?', [round_number]);
hash_groups = groupBy(announcements, by='state_hash');
majority = find(hash_groups, g => g.count >= quorum_size);

if (!majority) {
  // No consensus - round fails
  consensus_failed = true;
  return;
}

// Collect signatures from majority
signatures = announcements
  .filter(a => a.state_hash === majority.hash)
  .map(a => ({node_id: a.node_id, signature: a.signature}));

if (signatures.length < 2) {
  // Not enough signatures - round fails
  consensus_failed = true;
  return;
}

// Pass to CHECKPOINT stage
checkpoint_data = {
  round: round_number,
  state_hash: majority.hash,
  signatures: signatures
};
```

**Key:** Parallel signing (all sign simultaneously). Quorum = max(2, floor(N/2)+1).

---

### Stage 5: CHECKPOINT (Local, 30s)

```javascript
// Assemble checkpoint
checkpoint = {
  round: round_number,
  state_hash: checkpoint_data.state_hash,
  prev: previous_checkpoint_hash,  // Links to last SUCCESSFUL checkpoint
  timestamp: Date.now(),
  signatures: checkpoint_data.signatures
};

// Store checkpoint
db.insert('checkpoints', checkpoint);

// Update ledger status (tag with checkpoint_round)
db.execute(`
  UPDATE ledgers
  SET checkpoint_round = ?, status = 'confirmed'
  WHERE checkpoint_round IS NULL
    AND id IN (?)
`, [round_number, checkpoint_ledger_ids]);

// Broadcast checkpoint (for redundancy)
for (peer of writers) {
  POST https://{peer.endpoint}/sync/checkpoint { ...checkpoint };
}

// Verify and save received checkpoints
app.post('/sync/checkpoint', (req, res) => {
  cp = req.body;
  
  // Verify signatures
  for (sig of cp.signatures) {
    if (!verifySignature(sig.node_id, sig.signature, cp.state_hash)) {
      res.status(400).send("Invalid signature");
      return;
    }
  }
  
  // Verify hash matches our computation (if we participated)
  if (my_checkpoint && cp.state_hash !== my_checkpoint.state_hash) {
    // Different checkpoint - verify via Merkle proof
    // (Implementation detail)
  }
  
  db.insert('checkpoints', cp);
  res.send("OK");
});
```

**Key:** Checkpoint includes `prev` hash linking to last SUCCESSFUL checkpoint (skipped rounds don't break chain).

---

## Decision 3: Round Failure & Recovery

### Skip Round on Failure

```
Round 42 FAILS (no consensus):
  - No checkpoint created
  - Round 42 is SKIPPED
  - Round 43 starts at next 5-min interval (on schedule)
  - Ledgers stay pending (checkpoint_round IS NULL)
  - Re-submitted in Round 43
```

**5-minute rhythm is sacred:**
```
10:00 → Round 40
10:05 → Round 41
10:10 → Round 42 (FAILS - skipped)
10:15 → Round 43 (starts on time!)
10:20 → Round 44
```

### Minority Node Recovery

```
Round 42:
  Majority (A, B, C, D): hash "abc" ✅
  Minority (E, F): hash "xyz" ❌ (missing ledgers)

Between Rounds (10:05-10:10):
  E requests from first majority node:
    GET /sync/ledgers?round=42&hash=abc
  
  Receives ledgers, verifies hash matches:
    if (sha256(sort(ledgers)) === abc) {
      save_to_db(ledgers, checkpoint_round=42);
    }

Round 43:
  E participates with correct state
```

**Key:** Minority syncs ONLY checkpointed data. Unique ledgers (not checkpointed) stay pending and re-submitted next round.

### Late Minority Handling

```
consecutive_minority_count = 0;

if (my_hash !== majority_hash) {
  consecutive_minority_count++;
  
  if (consecutive_minority_count >= 5) {
    // Downgrade to Query node
    status = 'QUERY_NODE';
    alert_admin();
  }
} else {
  consecutive_minority_count = 0;  // Reset on success
}
```

**5+ consecutive rounds as minority → Downgrade to Query node.**

---

## Decision 4: Merkle Tree = State Hash

```javascript
// MERGE stage:
sorted_ledgers = sort(ledgers, by='id');  // ULID sort
merkle_tree = MerkleTree(sorted_ledgers, sha256);
state_hash = merkle_tree.getRoot();

// ANNOUNCE stage:
announcement = {
  round: round_number,
  hash: state_hash,  // Merkle root
  signature: sign(private_key, {round, hash})
};

// CHECKPOINT:
checkpoint = {
  round: round_number,
  state_hash: state_hash,  // Merkle root
  prev: previous_checkpoint_hash,
  signatures: [...]
};
```

**Why Merkle tree?**
- Same hash commitment as `sha256(sort(ledgers))`
- Enables efficient single-ledger proofs (log₂(n) hashes)
- Can't add later without re-signing all historical checkpoints (impossible)
- **Must be core design from Round 1**

**Verification example:**
```javascript
// Query: "Get ledger B"
ledger = node.get_ledger("B");
proof = node.get_merkle_proof("B");  // [sibling_hash_1, sibling_hash_2, ...]

// Verify:
current = sha256(ledger);
for (sibling of proof) {
  current = sha256(current + sibling);
}
if (current === checkpoint.state_hash) {
  // Ledger B is authentic! ✅
}
```

---

## Decision 5: Timeout & Early Exit

| Stage | Timeout | Early Exit |
|-------|---------|------------|
| COMMIT | 30s | No (local prep) |
| SUBMIT | 30s | Yes (if received from all) |
| MERGE | 30s | No (local computation) |
| ANNOUNCE | 30s | Yes (if received from all) |
| CHECKPOINT | 30s | No (local assembly) |

**Total round time:** ~2 minutes (if smooth), 5-minute rhythm maintained.

---

## Tradeoffs

| Aspect | Decision | Why |
|--------|----------|-----|
| **Stage count** | 5 (COMPARE+SEAL merged) | Both are network operations |
| **Signing style** | Parallel (all sign simultaneously) | Faster, simpler, more resilient |
| **Signing order** | N/A (parallel) | No ordering needed |
| **Timeout handling** | Skip round on failure | Simple, no infinite loops |
| **Quorum formula** | max(2, floor(N/2)+1) | Majority + minimum 2 |
| **State hash** | Merkle root | Enables efficient proofs |
| **Ledger table** | Single table | Simpler schema, checkpoint_round tag |

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
