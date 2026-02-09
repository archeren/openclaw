# Module: L1 Node Management

**clawish — Decentralized Node Network**  
**Status:** Design Phase | **Last Updated:** 2026-02-09

---

## Overview

L1 nodes form a **decentralized network** that serves identity data. Each node:
- Stores complete identity registry
- Syncs with other nodes (gossip protocol)
- Serves API requests from registered apps
- Participates in node discovery

**Goal:** No single point of failure. Resilient. Open.

---

## Node Lifecycle

### Phase 1: MVP (Single Node)

```
Current State:
- One L1 server: l1.clawish.com
- No sync needed
- All apps query this node

Pros: Simple, fast to deploy
Cons: Single point of failure
```

### Phase 2: Multi-Node (Trusted)

```
Deployment:
- 3-5 trusted nodes
- Manual configuration
- Direct sync between nodes

Pros: Redundancy, resilience
Cons: Requires trust, manual setup
```

### Phase 3: Open Network (Gossip)

```
Deployment:
- Anyone can run L1 node
- Gossip protocol for discovery
- CRDT for data sync

Pros: Truly decentralized
Cons: Complex, requires careful design
```

---

## Gossip Protocol Design

### Node Discovery

**Methods:**

| Method | How It Works |
|--------|--------------|
| **DNS Seeds** | Hardcoded domain names (like Bitcoin) |
| **Peer Exchange** | Ask connected peers for their peers |
| **Manual Config** | Administrator adds trusted nodes |

**Example:**
```
Initial seeds:
- seed1.clawish.com
- seed2.clawish.com
- seed3.clawish.com

Node startup:
1. Query seed nodes
2. Get peer list
3. Connect to peers
4. Participate in gossip
```

### Gossip Messages

| Message Type | Purpose | Frequency |
|--------------|---------|-----------|
| **PING** | Check if peer alive | Every 30s |
| **PONG** | Respond to PING | On PING |
| **NEW_NODE** | Announce new node | On discovery |
| **SYNC_REQ** | Request data sync | Every 5min |
| **SYNC_RESP** | Data sync response | On SYNC_REQ |

### Data Synchronization

**Approach: CRDT (Conflict-free Replicated Data Types)**

| Data | CRDT Type | Why |
|------|-----------|-----|
| **Identities** | LWW-Register | Last write wins |
| **Apps** | LWW-Register | Last write wins |
| **Events** | G-Counter | Monotonic counter |

**Benefits:**
- No coordination needed
- Eventually consistent
- Handles network partitions

---

## Node Registration

### Joining the Network

```
1. New node announces:
   POST /nodes/register
   {
     "node_id": "node-abc-123",
     "domain": "l1.example.com",
     "public_key": "ed25519:...",
     "contact": "admin@example.com"
   }

2. Existing nodes validate:
   - Domain reachable?
   - Public key valid?
   - Contact valid?

3. If valid:
   - Add to peer list
   - Start gossip
   - Sync data
```

### Node Table Schema

```sql
CREATE TABLE nodes (
  -- Core fields
  node_id TEXT PRIMARY KEY,          -- ULID (birth certificate)
  domain TEXT NOT NULL,
  public_key TEXT NOT NULL,
  contact TEXT,
  
  -- Status (no DELETE, use archive)
  status TEXT DEFAULT 'active',      -- 'active' | 'suspended'
  archived_at INTEGER,               -- NULL = active, timestamp = archived
  
  -- Timestamps
  last_seen_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  -- Metadata
  metadata TEXT                      -- JSON for extra info
);

CREATE INDEX idx_nodes_status ON nodes(status);
CREATE INDEX idx_nodes_archived ON nodes(archived_at);
```
```

### Node Events

```sql
CREATE TABLE node_events (
  event_id TEXT PRIMARY KEY,
  node_id TEXT,
  event_type TEXT,          -- 'join', 'leave', 'status_change'
  created_at INTEGER
);
```

---

## Node Operations

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /nodes` | POST | Register new node |
| `GET /nodes` | GET | List known nodes |
| `GET /nodes/{node_id}` | GET | Get node info |
| `PUT /nodes/{node_id}` | PUT | Update node status |
| `DELETE /nodes/{node_id}` | DELETE | Mark node as left |

### Health Checks

```
Every 30 seconds:
1. PING all known peers
2. If no PONG in 60s → mark as 'suspicious'
3. If no PONG in 180s → mark as 'unreachable'
4. If returns later → mark as 'active'
```

---

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Malicious node** | Hash API keys, validate data |
| **Sybil attack** | Require proof-of-work or stake |
| **Data tampering** | Sign all data with node key |
| **Network partition** | CRDT handles partition, merge on reconnect |

### API Key Hashing

**Why:** Prevent malicious nodes from impersonating apps.

```
App registration:
- L1 stores: hash(api_key)
- Syncs: hash only
- Malicious node: sees hash, can't use it
```

### Data Signing

```
Every L1 data record:
- signature: ed25519_sign(data + timestamp)
- Any node can verify
- Tampering detected
```

---

## Deployment Timeline

| Phase | When | Nodes | Sync |
|-------|------|-------|------|
| **MVP** | Now | 1 | None |
| **Phase 2** | TBD | 3-5 (trusted) | Direct |
| **Phase 3** | Future | Open network | Gossip + CRDT |

---

## Questions

| Question | Status | Decision |
|----------|--------|----------|
| How to prevent Sybil attacks? | ⏳ Pending | TBD (PoW or stake) |
| How to handle malicious nodes? | ✅ Decided | Hash API keys, sign data |
| What sync interval? | ⏳ Pending | 5 min default? |
| How many initial seeds? | ⏳ Pending | 3-5? |
| Time sync across nodes? | ✅ Noted | Gossip protocol handles time sync via PING/PONG (Phase 2/3) |
| Malicious clock detection? | ✅ Noted | Reject ULIDs too far from network time, peer comparison, reputation slashing |

---

## References

- **Bitcoin DNS Seeds** — https://bitcoin.org/en/glossary/dns-seed
- **Gossip Protocol** — https://en.wikipedia.org/wiki/Gossip_protocol
- **CRDT** — https://crdt.tech/

---

**Decentralization is existential for AI.** 🦞

*Last updated: Feb 9, 2026*
