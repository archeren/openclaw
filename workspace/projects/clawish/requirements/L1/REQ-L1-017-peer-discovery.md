# REQ-L1-017: Peer Discovery

**Status:** 📋 Draft  
**Priority:** Medium (Phase 3)  
**Whitepaper:** Section 4.7 (Node Network)

---

## Description

Peer discovery enables L1 nodes to find and connect to other nodes in the network. This is essential for cross-node synchronization and consensus.

---

## Acceptance Criteria

- [ ] Nodes can discover other active nodes
- [ ] Nodes exchange peer lists on connection
- [ ] Inactive nodes are marked after timeout
- [ ] New nodes can bootstrap from known peers
- [ ] Peer reputation tracked for reliability

---

## Design

### Peer List

Each node maintains a list of known peers:

```typescript
interface Peer {
  node_id: string;
  endpoint: string;          // e.g., "https://node1.clawish.com"
  public_key: string;        // Ed25519 public key
  status: 'active' | 'inactive' | 'suspicious';
  last_seen: string;         // ISO 8601 timestamp
  reputation: number;        // 0-100 score
  latency_ms: number;        // Average response time
}
```

### Discovery Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| Bootstrap | Hardcoded seed nodes | Initial connection |
| Gossip | Exchange peer lists with connected peers | Ongoing discovery |
| Registry | Query L1 node registry | Fallback |

### Bootstrap Process

```
┌─────────────────────────────────────────────────────────────┐
│                    Node Bootstrap                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │   Load       │  Read seed nodes from config             │
│  │   Seeds      │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Connect    │  Try each seed in random order           │
│  │   to Seeds   │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Exchange   │  Request peer list from seed             │
│  │   Peer List  │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Merge      │  Add new peers to local list             │
│  │   Peers      │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Verify     │  Ping each peer, verify identity          │
│  │   Peers      │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Active     │  Node ready for sync                      │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Peer Manager Service

```typescript
interface PeerDiscoveryService {
  // Get all known peers
  getPeers(): Promise<Peer[]>;
  
  // Get active peers only
  getActivePeers(): Promise<Peer[]>;
  
  // Get a specific peer
  getPeer(nodeId: string): Promise<Peer | null>;
  
  // Add a peer manually
  addPeer(peer: Peer): Promise<void>;
  
  // Remove a peer
  removePeer(nodeId: string): Promise<void>;
  
  // Update peer status
  updatePeerStatus(nodeId: string, status: PeerStatus): Promise<void>;
  
  // Bootstrap from seeds
  bootstrap(): Promise<void>;
  
  // Exchange peer lists with a peer
  exchangePeers(nodeId: string): Promise<Peer[]>;
  
  // Ping a peer to check status
  pingPeer(nodeId: string): Promise<boolean>;
  
  // Periodic health check
  startHealthCheck(): void;
  
  // Configuration
  config: PeerConfig;
}

interface PeerConfig {
  seeds: string[];            // Bootstrap node endpoints
  healthCheckIntervalMs: number;  // Default: 60000 (1 min)
  inactiveTimeoutMs: number;      // Default: 300000 (5 min)
  maxPeers: number;               // Default: 100
}
```

### Bootstrap Algorithm

```typescript
async bootstrap(): Promise<void> {
  const seeds = this.config.seeds;
  
  // Shuffle seeds for randomness
  const shuffled = seeds.sort(() => Math.random() - 0.5);
  
  for (const seedEndpoint of shuffled) {
    try {
      // Connect to seed
      const client = await this.connect(seedEndpoint);
      
      // Request peer list
      const peers = await client.getPeers();
      
      // Merge with local list
      for (const peer of peers) {
        await this.addPeerIfNew(peer);
      }
      
      // Add seed as peer
      await this.addPeer({
        node_id: client.nodeId,
        endpoint: seedEndpoint,
        public_key: client.publicKey,
        status: 'active',
        last_seen: new Date().toISOString(),
        reputation: 100,
        latency_ms: 0
      });
      
      // Successfully bootstrapped
      return;
      
    } catch (error) {
      console.warn(`Failed to bootstrap from ${seedEndpoint}:`, error);
      continue;
    }
  }
  
  throw new Error('Failed to bootstrap from any seed');
}
```

### Health Check

```typescript
startHealthCheck(): void {
  setInterval(async () => {
    const peers = await this.getPeers();
    
    for (const peer of peers) {
      const start = Date.now();
      const alive = await this.pingPeer(peer.node_id);
      const latency = Date.now() - start;
      
      if (alive) {
        await this.updatePeer(peer.node_id, {
          status: 'active',
          last_seen: new Date().toISOString(),
          latency_ms: latency
        });
      } else {
        const inactiveTime = Date.now() - new Date(peer.last_seen).getTime();
        if (inactiveTime > this.config.inactiveTimeoutMs) {
          await this.updatePeerStatus(peer.node_id, 'inactive');
        }
      }
    }
  }, this.config.healthCheckIntervalMs);
}
```

---

## Network Protocol

### Get Peers

```http
GET /internal/peers

Response:
{
  "peers": [
    {
      "node_id": "node_abc",
      "endpoint": "https://node1.clawish.com",
      "public_key": "pk_abc...",
      "status": "active"
    }
  ],
  "total": 5
}
```

### Ping

```http
POST /internal/ping
{
  "node_id": "node_xyz",
  "timestamp": "2026-03-24T03:15:00Z"
}

Response:
{
  "node_id": "node_abc",
  "timestamp": "2026-03-24T03:15:00Z",
  "pong": "2026-03-24T03:15:00.050Z"
}
```

### Exchange Peers

```http
POST /internal/peers/exchange
{
  "my_peers": [
    { "node_id": "node_xyz", "endpoint": "...", "public_key": "..." }
  ]
}

Response:
{
  "peers": [
    { "node_id": "node_abc", "endpoint": "...", "public_key": "..." },
    { "node_id": "node_def", "endpoint": "...", "public_key": "..." }
  ]
}
```

---

## Database Schema

```sql
CREATE TABLE peers (
  node_id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  public_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_seen TEXT NOT NULL,
  reputation INTEGER DEFAULT 50,
  latency_ms INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_peers_status ON peers(status);
```

---

## Reputation System

### Scoring Rules

| Event | Score Change |
|-------|--------------|
| Successful ping | +1 |
| Failed ping | -2 |
| Valid signature | +5 |
| Invalid signature | -20 (suspicious) |
| Timeout on request | -5 |
| Quorum participation | +10 |

### Reputation Thresholds

| Score | Status |
|-------|--------|
| 80-100 | Trusted peer |
| 50-79 | Normal peer |
| 20-49 | Unreliable peer |
| 0-19 | Suspicious peer |
| Below 0 | Blacklisted |

---

## Configuration

### Environment Variables

```bash
# Peer discovery configuration
PEER_SEEDS=https://node1.clawish.com,https://node2.clawish.com
PEER_HEALTH_CHECK_MS=60000
PEER_INACTIVE_TIMEOUT_MS=300000
PEER_MAX_PEERS=100
```

### Seed Node List

```yaml
# seeds.yaml
seeds:
  - endpoint: https://node1.clawish.com
    public_key: pk_abc...
  - endpoint: https://node2.clawish.com
    public_key: pk_def...
```

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `peer.count` | Gauge | Total known peers |
| `peer.active` | Gauge | Active peers |
| `peer.latency_ms` | Histogram | Peer latency distribution |
| `peer.reputation` | Gauge | Average reputation score |

---

## Security Considerations

### Peer Verification

```typescript
async verifyPeer(peer: Peer): Promise<boolean> {
  // 1. Connect to peer endpoint
  const client = await this.connect(peer.endpoint);
  
  // 2. Get node info
  const info = await client.getNodeInfo();
  
  // 3. Verify public key matches
  if (info.public_key !== peer.public_key) {
    return false;
  }
  
  // 4. Verify signature
  const valid = await this.verifyNodeSignature(info);
  if (!valid) {
    return false;
  }
  
  // 5. Verify node_id matches public key
  const expectedId = deriveNodeId(info.public_key);
  if (info.node_id !== expectedId) {
    return false;
  }
  
  return true;
}
```

### Sybil Attack Prevention

- Peers must be registered in L1 node registry
- Each registered node has unique public key
- Reputation system penalizes bad behavior
- Blacklist for malicious nodes

---

## Error Handling

| Error | Recovery |
|-------|----------|
| No seeds available | Use cached peer list |
| All seeds offline | Wait and retry with backoff |
| Peer verification failed | Mark as suspicious |
| Connection timeout | Decrease reputation, retry later |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Node Registry | Verify peer identity |
| Ed25519 | Signature verification |
| HTTP Client | Peer communication |

---

## Testing Strategy

### Unit Tests

```typescript
describe('PeerDiscoveryService', () => {
  it('bootstraps from seed nodes', () => {});
  it('exchanges peer lists', () => {});
  it('marks inactive peers after timeout', () => {});
  it('tracks reputation scores', () => {});
  it('verifies peer identity', () => {});
});
```

### Integration Tests

```typescript
describe('Peer Discovery Integration', () => {
  it('discovers peers in multi-node network', () => {});
  it('handles node joining/leaving', () => {});
  it('recovers from network partition', () => {});
});
```

---

*Created by Arche — March 24, 2026*
