# REQ-L1-018: Entry Sync

**Status:** 📋 Draft  
**Priority:** High (Phase 3)  
**Whitepaper:** Section 4.5 (Ledger System)

---

## Description

Entry sync ensures all L1 nodes have the same ledger entries. When nodes connect, they exchange missing entries to achieve consistency.

---

## Acceptance Criteria

- [ ] Nodes can request missing ledger entries from peers
- [ ] Nodes can send ledger entries to peers
- [ ] Entries verified before acceptance
- [ ] Sync progress tracked and resumable
- [ ] Bandwidth optimized with incremental sync

---

## Design

### Sync Protocol

```
┌─────────────────────────────────────────────────────────────┐
│                    Entry Sync Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Node A                    Node B                           │
│    │                         │                              │
│    │  GET /sync/status       │                              │
│    │ ───────────────────────▶│                              │
│    │                         │                              │
│    │  { ledger_height: 100 } │                              │
│    │ ◀───────────────────────│                              │
│    │                         │                              │
│    │  My height: 95          │                              │
│    │  Missing: 96-100        │                              │
│    │                         │                              │
│    │  GET /sync/entries?     │                              │
│    │      since=96&limit=10  │                              │
│    │ ───────────────────────▶│                              │
│    │                         │                              │
│    │  { entries: [...] }     │                              │
│    │ ◀───────────────────────│                              │
│    │                         │                              │
│    │  Verify & append        │                              │
│    │  entries 96-100         │                              │
│    │                         │                              │
│    │  Sync complete!         │                              │
│    │                         │                              │
└─────────────────────────────────────────────────────────────┘
```

### Sync State

```typescript
interface SyncState {
  last_synced_height: number;
  last_synced_hash: string;
  last_sync_time: string;
  syncing_with: string | null;
  progress: number;  // 0-100
}
```

---

## Implementation

### Sync Service

```typescript
interface EntrySyncService {
  // Get current sync state
  getSyncState(): Promise<SyncState>;
  
  // Sync with a specific peer
  syncWithPeer(nodeId: string): Promise<void>;
  
  // Sync with best available peer
  sync(): Promise<void>;
  
  // Request entries from peer
  requestEntries(nodeId: string, since: number, limit: number): Promise<LedgerEntry[]>;
  
  // Receive entries from peer
  receiveEntries(entries: LedgerEntry[], from: string): Promise<void>;
  
  // Verify received entry
  verifyEntry(entry: LedgerEntry): Promise<boolean>;
  
  // Append verified entry to ledger
  appendEntry(entry: LedgerEntry): Promise<void>;
  
  // Get entries for syncing to peer
  getEntriesSince(since: number, limit: number): Promise<LedgerEntry[]>;
  
  // Configuration
  config: SyncConfig;
}

interface SyncConfig {
  batchSize: number;          // Entries per request (default: 100)
  maxRetries: number;         // Retry attempts (default: 3)
  retryDelayMs: number;       // Delay between retries (default: 1000)
  timeoutMs: number;          // Request timeout (default: 30000)
}
```

### Sync Algorithm

```typescript
async syncWithPeer(nodeId: string): Promise<void> {
  // 1. Get peer's ledger height
  const peerStatus = await this.getPeerStatus(nodeId);
  const myStatus = await this.getSyncState();
  
  // 2. Check if sync needed
  if (peerStatus.height <= myStatus.last_synced_height) {
    return;  // Already synced
  }
  
  // 3. Calculate missing entries
  const missing = peerStatus.height - myStatus.last_synced_height;
  
  // 4. Update sync state
  await this.updateSyncState({
    syncing_with: nodeId,
    progress: 0
  });
  
  // 5. Fetch and verify entries in batches
  let fetched = 0;
  let currentHeight = myStatus.last_synced_height;
  
  while (fetched < missing) {
    const entries = await this.requestEntries(
      nodeId,
      currentHeight + 1,
      this.config.batchSize
    );
    
    for (const entry of entries) {
      // Verify entry
      const valid = await this.verifyEntry(entry);
      if (!valid) {
        throw new Error(`Invalid entry at height ${entry.height}`);
      }
      
      // Append to ledger
      await this.appendEntry(entry);
      currentHeight++;
      fetched++;
    }
    
    // Update progress
    await this.updateSyncState({
      progress: Math.floor((fetched / missing) * 100)
    });
  }
  
  // 6. Mark sync complete
  await this.updateSyncState({
    last_synced_height: peerStatus.height,
    last_synced_hash: peerStatus.hash,
    last_sync_time: new Date().toISOString(),
    syncing_with: null,
    progress: 100
  });
}
```

### Entry Verification

```typescript
async verifyEntry(entry: LedgerEntry): Promise<boolean> {
  // 1. Verify hash chain
  const prevEntry = await this.getEntryByHeight(entry.height - 1);
  if (entry.prev_hash !== prevEntry?.hash) {
    return false;
  }
  
  // 2. Verify entry hash
  const computedHash = this.computeEntryHash(entry);
  if (entry.hash !== computedHash) {
    return false;
  }
  
  // 3. Verify signature (if present)
  if (entry.signature) {
    const valid = await ed25519.verify(
      entry.payload,
      entry.signature,
      entry.public_key
    );
    if (!valid) return false;
  }
  
  // 4. Verify timestamp (within acceptable range)
  const now = Date.now();
  const entryTime = new Date(entry.timestamp).getTime();
  const maxSkew = 5 * 60 * 1000;  // 5 minutes
  if (Math.abs(now - entryTime) > maxSkew) {
    return false;
  }
  
  return true;
}
```

---

## Network Protocol

### Get Sync Status

```http
GET /internal/sync/status

Response:
{
  "ledger_height": 100,
  "ledger_hash": "hash_abc...",
  "last_checkpoint": 95,
  "node_id": "node_abc"
}
```

### Request Entries

```http
GET /internal/sync/entries?since=96&limit=10

Response:
{
  "entries": [
    {
      "id": "entry_96",
      "height": 96,
      "hash": "hash_96",
      "prev_hash": "hash_95",
      "identity_id": "id_xyz",
      "operation": "identity.created",
      "payload": "{...}",
      "timestamp": "2026-03-24T03:00:00Z"
    }
  ],
  "has_more": false
}
```

### Push Entry (for real-time sync)

```http
POST /internal/sync/entries
{
  "entry": {
    "id": "entry_101",
    "height": 101,
    "hash": "hash_101",
    ...
  },
  "from": "node_xyz"
}

Response:
{
  "accepted": true
}
```

---

## Sync Strategies

### Full Sync

Used when node is significantly behind or new:

```typescript
async fullSync(nodeId: string): Promise<void> {
  // Start from height 0
  await this.updateSyncState({ last_synced_height: 0 });
  await this.syncWithPeer(nodeId);
}
```

### Incremental Sync

Used for catching up on recent entries:

```typescript
async incrementalSync(): Promise<void> {
  const peers = await this.peerDiscovery.getActivePeers();
  
  for (const peer of peers) {
    try {
      await this.syncWithPeer(peer.node_id);
      return;  // Success
    } catch (error) {
      console.warn(`Sync failed with ${peer.node_id}:`, error);
      continue;
    }
  }
  
  throw new Error('Sync failed with all peers');
}
```

### Real-time Sync

Subscribe to entry broadcasts:

```typescript
async subscribeToEntries(peerId: string): Promise<void> {
  const client = await this.connect(peerId);
  
  client.on('entry', async (entry: LedgerEntry) => {
    const valid = await this.verifyEntry(entry);
    if (valid) {
      await this.appendEntry(entry);
    }
  });
}
```

---

## Database Schema

```sql
CREATE TABLE sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_synced_height INTEGER NOT NULL DEFAULT 0,
  last_synced_hash TEXT,
  last_sync_time TEXT,
  syncing_with TEXT,
  progress INTEGER DEFAULT 0
);

-- Initialize sync state
INSERT INTO sync_state (id, last_synced_height) VALUES (1, 0);
```

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `sync.height` | Gauge | Current synced height |
| `sync.lag` | Gauge | Blocks behind peers |
| `sync.entries_synced` | Counter | Total entries synced |
| `sync.duration_ms` | Histogram | Time to complete sync |
| `sync.errors` | Counter | Sync failures |

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Invalid entry | Reject, try different peer |
| Hash chain break | Rollback to last valid, retry |
| Timeout | Retry with exponential backoff |
| No peers available | Wait, retry later |

---

## Performance Considerations

| Metric | Target |
|--------|--------|
| Entry verification | < 5ms |
| Batch sync (100 entries) | < 1s |
| Full sync (1000 entries) | < 10s |
| Real-time latency | < 100ms |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Ledger Module | Entry storage |
| Peer Discovery | Find sync peers |
| Ed25519 | Entry verification |

---

## Testing Strategy

### Unit Tests

```typescript
describe('EntrySyncService', () => {
  it('syncs missing entries from peer', () => {});
  it('verifies entry hash chain', () => {});
  it('rejects invalid entries', () => {});
  it('handles sync interruption', () => {});
  it('resumes partial sync', () => {});
});
```

### Integration Tests

```typescript
describe('Entry Sync Integration', () => {
  it('syncs new node to network', () => {});
  it('handles network partition recovery', () => {});
  it('syncs concurrently from multiple peers', () => {});
});
```

---

*Created by Arche — March 24, 2026*
