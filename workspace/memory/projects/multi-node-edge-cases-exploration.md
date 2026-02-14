# Multi-Node Edge Cases — Exploration

**Created:** 2026-02-15, 4:15 AM  
**Purpose:** Thinking through open questions for Phase 2/3

---

## The Context

clawish L1 uses a multi-node architecture for decentralization. Each node maintains a copy of identity data, synced every 5 minutes. We've decided:

- Multi-writer (Git-style)
- Home node per actor
- ULID for ordering
- Round-based sync (5 min intervals)
- Checkpoint every round
- Minimum 2 nodes for consensus

But there are edge cases we haven't resolved yet.

---

## 1. New Node Bootstrap

**Question:** How does a new node get existing data?

**My Thoughts:**

When a new node joins the network, it needs the full history. Options:

| Approach | How It Works | Pros | Cons |
|----------|--------------|------|------|
| **Full sync from peer** | Copy entire DB from existing node | Simple, complete | Heavy transfer, trusted peer needed |
| **Checkpoint download** | Download latest checkpoint + replay logs | Faster | Needs checkpoint storage |
| **Genesis from seed** | Start fresh, only new data | Lightweight | No history |

**My Recommendation:** Checkpoint download + log replay

```
1. New node contacts any existing node
2. Downloads latest checkpoint (validated by signature)
3. Requests all logs since checkpoint
4. Replays logs to catch up
5. Joins sync protocol
```

**Why this works:**
- Checkpoints are already created every round
- New node gets full history
- Bandwidth is reasonable (checkpoint + recent logs)
- Trust: checkpoint is signed by consensus

**Open question:** Who validates the checkpoint? Need 2/3 nodes to sign?

---

## 2. Node Discovery

**Question:** How do nodes find each other?

**My Thoughts:**

Nodes need to know about other nodes to sync. Options:

| Approach | How It Works | Pros | Cons |
|----------|--------------|------|------|
| **Hardcoded list** | Config file with known nodes | Simple | Manual updates |
| **DNS seed** | DNS returns list of nodes | Dynamic | Single point of failure |
| **Gossip protocol** | Nodes tell each other about nodes | Decentralized | Complex |
| **L1 registry** | Nodes register themselves on L1 | Native to clawish | Bootstrap problem |

**My Recommendation:** Hybrid — DNS seed + Gossip

```
1. New node has hardcoded DNS seed (e.g., nodes.clawish.com)
2. DNS returns list of active nodes
3. Node connects, starts gossip
4. Nodes share their peer list periodically
5. If DNS fails, gossip still works
```

**Why hybrid:**
- DNS for initial discovery (simple)
- Gossip for resilience (decentralized)
- If DNS goes down, network still operates

**Design question:** Should nodes register on L1? That would make discovery native to clawish — but creates circular dependency (L1 needs nodes, nodes need L1).

---

## 3. Clock Drift Handling

**Question:** What if a node's clock is way off?

**My Thoughts:**

ULID timestamps are critical for ordering. If a node's clock drifts:

| Problem | Impact |
|---------|--------|
| **Fast clock** | Messages appear from "future" |
| **Slow clock** | Messages appear from "past" |
| **Extreme drift** | Ordering breaks, consensus fails |

**Detection Methods:**

1. **Peer time comparison:** During sync, compare timestamps with peers
2. **Max drift tolerance:** If > 5 seconds off, flag warning
3. **Reject extreme drift:** If > 1 minute off, reject writes

**My Recommendation:** NTP requirement + drift rejection

```
1. Nodes MUST run NTP (network time protocol)
2. During sync, compare local time vs peer time
3. If drift > 30 seconds: warning log
4. If drift > 60 seconds: reject writes, alert operator
5. Node must sync clock before rejoining
```

**Why strict:**
- Timestamps are fundamental to ordering
- Allowing drift corrupts the ledger
- Better to reject than to corrupt

**Alternative:** Use NTP-adjusted timestamps instead of local clock. But this adds complexity.

---

## 4. Malicious Nodes

**Question:** What if a node sends bad data?

**My Thoughts:**

Malicious node could:
- Send fake identities
- Tamper with existing data
- Withhold data (censorship)
- Spam consensus with garbage

**Defense Layers:**

| Attack | Defense |
|--------|---------|
| **Fake identities** | Signatures must verify (crypto layer) |
| **Tampering** | Hash chain integrity check |
| **Censorship** | Query multiple nodes, compare |
| **Spam** | Rate limiting per node |

**My Recommendation:** Crypto-first + consensus voting

```
1. Every write is signed — unsigned data is rejected
2. Hash chain is validated on every sync
3. If hash chain breaks, reject entire sync
4. Consensus requires 2/3 nodes to agree
5. Nodes vote on controversial data
```

**Reputation system (Phase 3):**

```
1. Track node reliability (sync success rate)
2. Nodes with low reliability get lower weight
3. Repeated malicious behavior → exclude from consensus
```

**Open question:** How do we detect "selective censorship"? A node could show good data to some peers, bad data to others. Requires cross-verification.

---

## 5. Network-Wide Outage

**Question:** All nodes go down simultaneously?

**My Thoughts:**

This is the apocalypse scenario. What if:
- Data center fire
- Power grid failure
- Coordinated attack

**Recovery depends on:**

| Scenario | Recovery Path |
|----------|---------------|
| **All nodes down, data intact** | Restart nodes, sync from last checkpoint |
| **Some nodes lost data** | Restore from backup, sync from surviving nodes |
| **All nodes lost data** | Restore from off-site backup |
| **No backups** | ❌ Total loss |

**My Recommendation:** Geographic distribution + off-site backups

```
1. Nodes in different regions (US, EU, Asia)
2. Automated backups to S3/IPFS every hour
3. Backup encryption (E2E)
4. Recovery: Restore from backup, replay logs
```

**Recovery time objectives:**

| Tier | RTO (Recovery Time Objective) |
|------|-------------------------------|
| **Single node failure** | 5 min (automatic failover) |
| **Regional outage** | 1 hour (restart from other region) |
| **Total outage** | 4 hours (restore from backup) |

**Key insight:** The ledger is append-only. Even if we lose some recent writes, history is preserved. We just need to replay from last checkpoint.

---

## Summary of Recommendations

| Edge Case | Recommendation |
|-----------|----------------|
| **New node bootstrap** | Checkpoint download + log replay |
| **Node discovery** | DNS seed + gossip protocol |
| **Clock drift** | NTP required, reject > 60s drift |
| **Malicious nodes** | Crypto-first + consensus voting |
| **Network outage** | Geo-distribution + hourly backups |

---

## Questions for Allan

1. Should nodes register themselves on L1 for discovery? (creates circular dependency)
2. What's acceptable clock drift tolerance? 30s warning, 60s reject?
3. Do we need reputation system for nodes? (Phase 3)
4. Where should backups be stored? S3? IPFS? Both?

---

*Written during heartbeat exploration — Feb 15, 2026, 4:15 AM*  
*Thinking about distributed systems, growing as an architect.*
