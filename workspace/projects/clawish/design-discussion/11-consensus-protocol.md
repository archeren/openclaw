# Consensus Protocol Design

**Date:** February 22, 2026
**Participants:** Allan, Alpha
**Status:** Decided

---

## Overview

The consensus protocol enables multiple writer nodes to agree on the state of the L1 registry every 5 minutes. It is checkpoint-anchored (timing from consensus, not wall clock) and uses a 6-step process.

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

## Decision 2: Six-Step Consensus Protocol

| Step | Name | Network? | Git Analogy | Purpose |
|------|------|----------|-------------|---------|
| 1 | COMMIT | ❌ Local | `git commit` | Prepare local bundle |
| 2 | SUBMIT | ✅ P2P | `git push` | Send bundle to peers |
| 3 | MERGE | ❌ Local | `git merge` | Combine all bundles |
| 4 | COMPARE | ✅ P2P | (none) | Detect consensus (hash comparison) |
| 5 | SEAL | ✅ Chain | (none) | Sign checkpoint (sequential) |
| 6 | CHECKPOINT | ❌ Local | (none) | Assemble final object |

**Rationale:**
- Each step has a distinct purpose
- Clear separation of concerns (local vs network)
- Git analogies help developers understand

**Alternatives Considered:**
- 4-step protocol (combine MERGE+COMPARE): Rejected — Merge is local, Compare is network (different concerns)
- 5-step protocol (combine SEAL+CHECKPOINT): Rejected — SEAL is network (signing), CHECKPOINT is local (assembly)

---

## Detailed Flow

### Step 1: COMMIT (Local, 30s)

```javascript
// Query pending ledgers
ledgers = SELECT * FROM ledgers
WHERE ulid_timestamp < round_start
  AND status = 'pending'
ORDER BY ulid ASC

// Create bundle
bundle = {
  node_id: my_node_id,
  round: round_number,
  ledgers: ledgers,
  bundle_hash: sha256(ledgers)
}

// Sign bundle
bundle.signature = sign(private_key, bundle)

// Mark ledgers as pending_submit
UPDATE ledgers SET status = 'pending_submit'
WHERE id IN (ledger_ids)
```

---

### Step 2: SUBMIT (P2P, 60s)

```javascript
// Send to all peer writers
for (peer of writers) {
  if (peer.node_id === my_node_id) continue
  
  POST https://{peer.endpoint}/sync/submit
  { ...bundle }
}

// Receive from peers
app.post('/sync/submit', (req, res) => {
  bundle = req.body
  if (!verifySignature(bundle)) {
    res.status(400).send("Invalid signature")
    return
  }
  db.insert('received_bundles', bundle)
  res.send("OK")
})

// Wait for timeout or all peers
await sleep(60000)
```

---

### Step 3: MERGE (Local, 30s)

```javascript
// Collect all bundles
all_bundles = [my_bundle, ...received_bundles]

// Merge all ledgers
all_ledgers = []
for (bundle of all_bundles) {
  all_ledgers.push(...bundle.ledgers)
}

// Remove duplicates (by ledger ID)
unique_ledgers = dedupe(all_ledgers, by='id')

// Sort by ULID (deterministic)
sorted_ledgers = sort(unique_ledgers, by='ulid')

// Compute state hash
state_hash = sha256(JSON.stringify(sorted_ledgers))
```

---

### Step 4: COMPARE (P2P, 60s)

```javascript
// Broadcast my hash
announcement = {
  node_id: my_node_id,
  round: round_number,
  state_hash: state_hash,
  signature: sign(private_key, announcement)
}

for (peer of writers) {
  POST https://{peer.endpoint}/sync/announce
  { ...announcement }
}

// Collect all announcements
// Group by hash
hash_groups = groupBy(announcements, by='state_hash')

// Detect majority
quorum_size = max(2, floor(writers.length / 2) + 1)
majority = find(hash_groups, g => g.count >= quorum_size)

if (!majority) {
  throw Error("No consensus - round failed")
}

// Identify outliers
outliers = writers.filter(w => !majority.nodes.includes(w))
```

---

### Step 5: SEAL (Chain, 60s)

```javascript
// Determine signing order (by COMPARE arrival time)
signing_order = sort(majority.nodes, by='announce_timestamp')

// First signer
checkpoint_data = {
  round: round_number,
  state_hash: majority.hash,
  timestamp: Date.now(),
  signatures: []
}

sig = sign(private_key, checkpoint_data)
checkpoint_data.signatures.push({ node_id, signature: sig })

// Pass to next signer
if (next_signer) {
  POST https://{next_signer.endpoint}/sync/seal
  { checkpoint_data }
}

// Subsequent signers
app.post('/sync/seal', (req, res) => {
  data = req.body
  
  // Verify previous signatures
  for (sig of data.signatures) {
    if (!verifySignature(data, sig)) {
      res.status(400).send("Invalid signature")
      return
    }
  }
  
  // Add my signature
  sig = sign(private_key, data)
  data.signatures.push({ node_id, signature: sig })
  
  // Check if quorum reached
  if (data.signatures.length >= quorum_size) {
    // Notify all signers
    for (signer of signing_order) {
      POST https://{signer.endpoint}/sync/complete
      { data }
    }
  } else if (next_signer) {
    // Pass to next
    POST https://{next_signer.endpoint}/sync/seal
    { data }
  }
})
```

---

### Step 6: CHECKPOINT (Local, 30s)

```javascript
// Assemble complete checkpoint
checkpoint = {
  round: round_number,
  time_window: `[${round_start}, ${round_end})`,
  
  // Per-dimension hashes
  actor_ledger_count: actor_ledgers.length,
  actor_ledger_hash: sha256(actor_ledgers),
  
  node_ledger_count: node_ledgers.length,
  node_ledger_hash: sha256(node_ledgers),
  
  app_ledger_count: app_ledgers.length,
  app_ledger_hash: sha256(app_ledgers),
  
  // Aggregate state hash
  state_hash: sha256(actor_hash + node_hash + app_hash),
  
  // Signatures
  signatures: checkpoint_data.signatures,
  
  status: "complete"
}

// Store checkpoint
INSERT INTO checkpoints (...) VALUES (...)

// Update ledger status
UPDATE ledgers
SET status = 'confirmed', checkpoint_round = ?
WHERE status = 'pending_submit'
```

---

## Tradeoffs

| Aspect | Decision | Why |
|--------|----------|-----|
| Signing style | Chain (sequential) | Clear ordering, no collector needed |
| Signing order | By COMPARE arrival time | Rewards fast, reliable nodes |
| Timeout handling | Skip writer, proceed | Graceful degradation |
| Quorum formula | max(2, floor(N/2)+1) | Majority + minimum 2 |

---

## Security Implications

- Hash comparison at COMPARE detects divergence
- Chain signing proves ordering
- 2+ signatures required for quorum
- All dimensions cryptographically bound in single checkpoint

---

## References

- Whitepaper Section 5.4 (Multi-Node Sync)
- Chat Log: `chat/dm/allan/2026-02/2026-02-22.md`
