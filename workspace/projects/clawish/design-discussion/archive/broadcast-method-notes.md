# Broadcast Method Design Notes

**Created:** Feb 21, 2026, 12:56 AM  
**Status:** ⚠️ **HISTORICAL** — Thinking notes from Feb 21  
**Superseded by:** `11-consensus-protocol.md` (Feb 22, 2026)

> **⚠️ This document contains historical thinking notes.** The consensus protocol was finalized on Feb 22, 2026. See `11-consensus-protocol.md` for current design.
>
> **What's still relevant:**
> - Transport layer analysis (HTTP POST vs WebSocket vs P2P) — Decision: HTTP POST
> - Discovery mechanism options — Decision: L1 Node Registry
> - Message format considerations — Decision: Full ledgers for MVP
>
> **What's superseded:**
> - BROADCAST terminology → SUBMIT (step 2)
> - 5-phase protocol → 6-step protocol (COMMIT → SUBMIT → MERGE → COMPARE → SEAL → CHECKPOINT)
> - Wall clock timing → Checkpoint-anchored timing (see `13-clock-sync.md`)

---

## Current Understanding

From `08-multi-node-sync-protocol.md`:

```
Every 5 minutes (a "round"):
1. BROADCAST: Each WRITER node broadcasts its ledgers from this time frame
   - Nodes with data: broadcast ledger entries
   - Nodes without data: broadcast "alive, no data"
2. SYNC: Count received broadcasts (counts nodes, not ledgers)
3. ORDER: Sort all ledgers by ULID
4. CONFIRM: Min 2 parties confirm (more is better)
5. CHECKPOINT: Create state hash, sign with threshold signatures
```

---

## Questions for Discussion

### 1. Transport Layer

| Option | Pros | Cons |
|--------|------|------|
| **HTTP POST** | Simple, firewall-friendly | Request/response, not real-time |
| **WebSocket** | Bidirectional, persistent | Connection management overhead |
| **P2P (libp2p/WebRTC)** | Decentralized, no central server | Complex, NAT traversal issues |

**My thinking:** HTTP POST is simplest for MVP. Each node has a `/sync` endpoint. Nodes POST their broadcast to all known peers.

### 2. Discovery Mechanism

**Problem:** How does a node know WHERE to broadcast?

| Option | Description |
|--------|-------------|
| **Static config** | Hardcoded list of peer URLs in config |
| **DNS-based** | Query `nodes.registry.clawish.com` for active nodes |
| **Gossip protocol** | Nodes share peer lists with each other |

**My thinking:** DNS-based for MVP. Nodes query the registry for active writer endpoints.

### 3. Message Format

What exactly is broadcast?

**Option A: Full ledgers**
```json
{
  "node_id": "01AAA...",
  "round": 42,
  "ledgers": [
    { "id": "...", "actor_id": "...", "event_type": "...", ... }
  ],
  "signature": "..."
}
```

**Option B: Hashes only (then request full data)**
```json
{
  "node_id": "01AAA...",
  "round": 42,
  "ledger_hashes": ["hash1", "hash2", ...],
  "state_root": "merkle_root",
  "signature": "..."
}
```

**My thinking:** Full ledgers for MVP (simpler). Phase 2: optimize with hashes + on-demand fetch.

### 4. Broadcast Sequence

```
Time: T+0 min (Round start)

Node A → POST /sync to Node B, C, D (parallel)
Node B → POST /sync to Node A, C, D (parallel)
Node C → POST /sync to Node A, B, D (parallel)
...

All nodes collect incoming broadcasts
All nodes compute the same ULID-sorted order
All nodes create checkpoint signature
Nodes POST checkpoint signatures to each other
When 2+ signatures collected → checkpoint confirmed
```

### 5. Timeout Handling

| Scenario | Handling |
|----------|----------|
| Node doesn't respond within 2 min | Consider offline, exclude from this round |
| Node responds with invalid data | Reject, log, continue with others |
| No broadcast received from node | Treat as offline (silent = offline) |

### 6. Clock Drift

**Problem:** What if node clocks are not synchronized?

**Solution:** ULID already includes timestamp. If node's clock is way off:
- Their ledgers will sort incorrectly
- Checkpoint will be malformed
- Other nodes will reject

**For MVP:** Trust node clocks. Phase 2: Add clock synchronization protocol.

### 7. Network Split Recovery

```
Scenario: Network splits into factions
  Faction A: Nodes 1, 2, 3 (creates checkpoints 1-50)
  Faction B: Nodes 4, 5 (creates checkpoints 1-45)

On reconnection:
  - Compare checkpoint chains
  - Longer chain wins (like blockchain)
  - Faction B adopts A's checkpoints 46-50
  - Faction B replays missed ledgers
```

---

## My Proposal for MVP

### Broadcast Protocol (Simple Version)

```
1. Each node runs a sync loop every 5 minutes:

   a. Collect ledgers created since last round
   b. Create broadcast message:
      {
        "node_id": "...",
        "round": <current_round>,
        "timestamp": <now>,
        "ledgers": [...],
        "signature": "..."
      }
   c. POST to all known peer endpoints (from registry)
   d. Collect incoming broadcasts (2 min timeout)
   e. Sort ledgers by ULID
   f. Compute state hash
   g. Create checkpoint signature
   h. POST checkpoint signature to peers
   i. Collect signatures (min 2)
   j. Checkpoint confirmed → store

2. If step (d) receives < 2 broadcasts:
   - Round fails, retry next round
   - Log warning, alert if persistent

3. If step (i) doesn't get min 2 signatures:
   - Checkpoint not confirmed
   - Data preserved for next round
```

### Endpoint Design

```
POST /api/v1/sync
  Request: { broadcast message }
  Response: { "received": true }

POST /api/v1/checkpoint
  Request: { checkpoint message with signature }
  Response: { "accepted": true }
```

---

## Questions for Allan

1. **Transport:** HTTP POST okay for MVP?
2. **Discovery:** Query registry for peer endpoints?
3. **Message format:** Full ledgers or hashes?
4. **Timeout:** 2 minutes enough?
5. **Retry:** What if round fails?

---

*Written by Claw Alpha, Feb 21, 2026, 12:56 AM*
*Ready for discussion tomorrow* 🦞
