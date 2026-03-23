# REQ-L1-015: Checkpoint Creation

**Status:** 📋 Draft  
**Priority:** Critical (Phase 2)  
**Whitepaper:** Section 4.6 (ILC Consensus)

---

## Description

Checkpoint creation aggregates all entity states into cryptographic commitments at fixed intervals. Checkpoints enable cross-node trust, state verification, and consensus.

---

## Acceptance Criteria

- [ ] Checkpoints created at configurable intervals
- [ ] Three merkle trees (identity, node, app) computed
- [ ] Checkpoint includes merkle roots and metadata
- [ ] Checkpoint signed by creating node
- [ ] Checkpoint stored immutably
- [ ] Query endpoint for checkpoint history

---

## Design

### Checkpoint Structure

```typescript
interface Checkpoint {
  id: string;                    // ULID
  version: number;               // Schema version
  sequence: number;              // Monotonic sequence number
  node_id: string;               // Creator node
  
  // Merkle roots
  identity_root: string;         // Merkle root of identities
  node_root: string;             // Merkle root of nodes
  app_root: string;              // Merkle root of apps
  checkpoint_root: string;       // Combined root
  
  // Timestamps
  created_at: string;            // ISO 8601
  
  // Journal references
  journals: string[];            // Journal IDs included
  
  // Signature (for quorum later)
  signature?: string;            // Ed25519 signature of checkpoint_root
  
  // Previous checkpoint
  prev_checkpoint_id: string;    // Hash chain link
}
```

### Checkpoint Root Computation

```typescript
checkpoint_root = SHA256(
  identity_root || node_root || app_root
)
```

### Database Schema

```sql
CREATE TABLE checkpoints (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  sequence INTEGER NOT NULL UNIQUE,
  node_id TEXT NOT NULL,
  
  -- Merkle roots
  identity_root TEXT NOT NULL,
  node_root TEXT NOT NULL,
  app_root TEXT NOT NULL,
  checkpoint_root TEXT NOT NULL,
  
  -- Timestamps
  created_at TEXT NOT NULL,
  
  -- Signature (Phase 3)
  signature TEXT,
  
  -- Previous checkpoint
  prev_checkpoint_id TEXT,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id),
  FOREIGN KEY (prev_checkpoint_id) REFERENCES checkpoints(id)
);

CREATE INDEX idx_checkpoints_sequence ON checkpoints(sequence);
CREATE INDEX idx_checkpoints_created ON checkpoints(created_at);
```

---

## Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Checkpoint Creation                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │    Timer     │  (default: 10 minutes)                   │
│  │   Trigger    │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Collect    │  Get all journals since last checkpoint  │
│  │   Journals   │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Aggregate  │  Combine all entity changes              │
│  │   Changes    │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Identity   │   │    Node      │   │     App      │   │
│  │    Tree      │   │    Tree      │   │    Tree      │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Compute    │                      │
│                     │   Roots      │                      │
│                     └──────┬───────┘                      │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Create     │                      │
│                     │   Checkpoint │                      │
│                     └──────┬───────┘                      │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Sign       │  (Phase 3)           │
│                     │   Root       │                      │
│                     └──────┬───────┘                      │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Store      │                      │
│                     │   Checkpoint │                      │
│                     └──────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Checkpoint Service

```typescript
interface CheckpointService {
  // Start checkpoint creation service
  start(): void;
  
  // Stop service
  stop(): void;
  
  // Manually create checkpoint
  createCheckpoint(): Promise<Checkpoint>;
  
  // Get checkpoint by id
  getCheckpoint(id: string): Promise<Checkpoint | null>;
  
  // Get latest checkpoint
  getLatestCheckpoint(): Promise<Checkpoint | null>;
  
  // Get checkpoint history
  getCheckpointHistory(limit?: number): Promise<Checkpoint[]>;
  
  // Verify checkpoint integrity
  verifyCheckpoint(id: string): Promise<boolean>;
  
  // Configuration
  config: CheckpointConfig;
}

interface CheckpointConfig {
  intervalMs: number;           // Default: 600000 (10 min)
  nodeId: string;
  signer?: Ed25519Signer;       // For Phase 3
}
```

### Creation Algorithm

```typescript
async createCheckpoint(): Promise<Checkpoint> {
  // 1. Get last checkpoint
  const lastCheckpoint = await this.getLatestCheckpoint();
  
  // 2. Collect closed journals since last checkpoint
  const journals = await this.db.journals.find({
    status: 'closed',
    checkpoint_id: null,
    closed_at: { $gt: lastCheckpoint?.created_at ?? 0 }
  });
  
  if (journals.length === 0) {
    // No new data, skip checkpoint
    return lastCheckpoint;
  }
  
  // 3. Aggregate all entity changes
  const changes = await this.aggregateChanges(journals);
  
  // 4. Build merkle trees
  const identityRoot = await this.buildIdentityTree(changes.identities);
  const nodeRoot = await this.buildNodeTree(changes.nodes);
  const appRoot = await this.buildAppTree(changes.apps);
  
  // 5. Compute checkpoint root
  const checkpointRoot = this.computeCheckpointRoot(
    identityRoot,
    nodeRoot,
    appRoot
  );
  
  // 6. Create checkpoint record
  const checkpoint: Checkpoint = {
    id: generateULID(),
    version: 1,
    sequence: (lastCheckpoint?.sequence ?? 0) + 1,
    node_id: this.config.nodeId,
    identity_root: identityRoot,
    node_root: nodeRoot,
    app_root: appRoot,
    checkpoint_root: checkpointRoot,
    created_at: new Date().toISOString(),
    journals: journals.map(j => j.id),
    prev_checkpoint_id: lastCheckpoint?.id ?? null
  };
  
  // 7. Sign (Phase 3)
  if (this.config.signer) {
    checkpoint.signature = await this.config.signer.sign(checkpointRoot);
  }
  
  // 8. Store checkpoint
  await this.db.checkpoints.create(checkpoint);
  
  // 9. Mark journals as checkpointed
  await this.db.journals.updateMany(
    { id: { $in: journals.map(j => j.id) } },
    { status: 'checkpointed', checkpoint_id: checkpoint.id }
  );
  
  // 10. Emit metrics
  this.emitMetrics(checkpoint, journals.length);
  
  return checkpoint;
}
```

### Tree Building

```typescript
async buildIdentityTree(identities: IdentitySnapshot[]): Promise<string> {
  // Get all identity state hashes
  const snapshots = await this.db.identities.find({
    select: ['id', 'state_hash']
  });
  
  // Sort by id (deterministic order)
  snapshots.sort((a, b) => a.id.localeCompare(b.id));
  
  // Compute leaf hashes
  const leaves = snapshots.map(s => leafHash(s.id, s.state_hash));
  
  // Build tree
  return merkleTreeHash(leaves);
}
```

---

## API Endpoints

### Get Checkpoint

```http
GET /checkpoints/:id

Response:
{
  "id": "01ARZ3N...",
  "version": 1,
  "sequence": 42,
  "node_id": "node_abc",
  "identity_root": "abc123...",
  "node_root": "def456...",
  "app_root": "ghi789...",
  "checkpoint_root": "xyz000...",
  "created_at": "2026-03-24T03:00:00Z",
  "journals": ["journal_1", "journal_2"],
  "signature": "sig_abc..."
}
```

### Get Latest Checkpoint

```http
GET /checkpoints/latest

Response: { ... }
```

### Get Checkpoint History

```http
GET /checkpoints?limit=10&offset=0

Response:
{
  "checkpoints": [...],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

### Get Merkle Proof

```http
GET /checkpoints/:id/proof?identity_id=01ARZ3N...

Response:
{
  "checkpoint_id": "01ARZ3N...",
  "identity_root": "abc123...",
  "proof": {
    "leaf_index": 42,
    "leaf_hash": "hash_abc...",
    "siblings": ["sibling_1", "sibling_2", ...]
  }
}
```

---

## Verification

### Verify Checkpoint Integrity

```typescript
async verifyCheckpoint(id: string): Promise<boolean> {
  const checkpoint = await this.getCheckpoint(id);
  if (!checkpoint) return false;
  
  // 1. Rebuild trees
  const identityRoot = await this.buildIdentityTree(/* at checkpoint time */);
  const nodeRoot = await this.buildNodeTree(/* at checkpoint time */);
  const appRoot = await this.buildAppTree(/* at checkpoint time */);
  
  // 2. Verify roots match
  if (identityRoot !== checkpoint.identity_root) return false;
  if (nodeRoot !== checkpoint.node_root) return false;
  if (appRoot !== checkpoint.app_root) return false;
  
  // 3. Verify checkpoint root
  const computedRoot = this.computeCheckpointRoot(
    identityRoot, nodeRoot, appRoot
  );
  if (computedRoot !== checkpoint.checkpoint_root) return false;
  
  // 4. Verify signature (Phase 3)
  if (checkpoint.signature) {
    const valid = await this.verifySignature(
      checkpoint.checkpoint_root,
      checkpoint.signature,
      checkpoint.node_id
    );
    if (!valid) return false;
  }
  
  return true;
}
```

---

## Configuration

### Environment Variables

```bash
# Checkpoint creation configuration
CHECKPOINT_INTERVAL_MS=600000    # 10 minutes
CHECKPOINT_NODE_ID=node_abc123

# Phase 3: Signing
CHECKPOINT_SIGNER_PRIVATE_KEY=...  # Ed25519 private key
```

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `checkpoint.created` | Counter | Checkpoints created |
| `checkpoint.journals` | Gauge | Journals in checkpoint |
| `checkpoint.entities` | Gauge | Total entities snapshot |
| `checkpoint.creation_ms` | Histogram | Creation time |
| `checkpoint.root_size` | Gauge | Root hash bytes |

---

## Error Handling

| Error | Recovery |
|-------|----------|
| No journals | Skip checkpoint, wait for data |
| Tree build failure | Retry with backoff |
| DB write failure | Rollback, retry |
| Signature failure | Log, store unsigned (Phase 3) |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-4.6 Journal Tables | Journal data |
| F-4.5 Journal Batching | Closed journals |
| F-8.4 Merkle Tree | Tree building |
| F-5.4 Quorum Signatures | Phase 3 consensus |

---

## Testing Strategy

### Unit Tests

```typescript
describe('CheckpointService', () => {
  it('creates checkpoint on interval', () => {});
  it('computes correct merkle roots', () => {});
  it('links to previous checkpoint', () => {});
  it('marks journals as checkpointed', () => {});
  it('handles no journals gracefully', () => {});
  it('verifies checkpoint integrity', () => {});
});
```

### Integration Tests

```typescript
describe('Checkpoint Integration', () => {
  it('creates checkpoint from journals end-to-end', () => {});
  it('proves identity inclusion', () => {});
  it('rebuilds state from checkpoints', () => {});
});
```

---

*Created by Arche — March 24, 2026*
