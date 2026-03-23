# REQ-L1-016: Quorum Signatures

**Status:** 📋 Draft  
**Priority:** Critical (Phase 2)  
**Whitepaper:** Section 4.6 (ILC Consensus)

---

## Description

Quorum signatures enable multi-node consensus on checkpoints. When a checkpoint is created, a quorum of writer nodes must sign it before it becomes finalized. This prevents any single node from forging checkpoints.

---

## Acceptance Criteria

- [ ] Writer nodes can sign checkpoints
- [ ] Checkpoint only finalized after quorum of signatures
- [ ] Signature verification at read time
- [ ] Signature format: Ed25519
- [ ] Minimum quorum configurable (default: 2/3 of writers)

---

## Design

### Signature Structure

```typescript
interface CheckpointSignature {
  checkpoint_id: string;         // Checkpoint being signed
  node_id: string;               // Signing node
  signature: string;             // Ed25519 signature
  public_key: string;            // Node's public key
  created_at: string;            // When signed
}
```

### Checkpoint Status Flow

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌───────────┐
│ Created │ ──▶ │ Pending │ ──▶ │ Finalized │ ──▶ │ Consensus │
└─────────┘     └─────────┘     └──────────┘     └───────────┘
    │               │                 │                │
    │               │                 │                │
    ▼               ▼                 ▼                ▼
  0 sigs       1-n sigs        Quorum          All writers
             (collecting)       reached          signed
```

### Database Schema

```sql
CREATE TABLE checkpoint_signatures (
  id TEXT PRIMARY KEY,
  checkpoint_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  signature TEXT NOT NULL,
  public_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id),
  FOREIGN KEY (node_id) REFERENCES nodes(id),
  UNIQUE(checkpoint_id, node_id)  -- One signature per node per checkpoint
);

CREATE INDEX idx_signatures_checkpoint ON checkpoint_signatures(checkpoint_id);
```

### Extended Checkpoint Schema

```sql
ALTER TABLE checkpoints ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE checkpoints ADD COLUMN signature_count INTEGER DEFAULT 0;
ALTER TABLE checkpoints ADD COLUMN quorum_reached_at TEXT;
```

---

## Consensus Rules

### Quorum Calculation

```typescript
interface QuorumConfig {
  // Minimum fraction of writers required (default: 2/3)
  quorumFraction: number;  // e.g., 0.67 for 2/3
  
  // Minimum absolute count (default: 2)
  minQuorum: number;
}

function isQuorumReached(
  signatureCount: number,
  totalWriters: number,
  config: QuorumConfig
): boolean {
  const required = Math.max(
    config.minQuorum,
    Math.ceil(totalWriters * config.quorumFraction)
  );
  return signatureCount >= required;
}
```

### Example Scenarios

| Writers | Quorum (2/3) | Minimum |
|---------|--------------|---------|
| 3 | 2 | 2 |
| 5 | 4 | 2 |
| 7 | 5 | 2 |
| 10 | 7 | 2 |

---

## Signing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Quorum Signature Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Node A creates checkpoint                                  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   Broadcast  │  Send checkpoint to all writer nodes     │
│  │   Checkpoint │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ├──────────────┬──────────────┬──────────────┐     │
│         ▼              ▼              ▼              ▼     │
│    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐   │
│    │ Node B │    │ Node C │    │ Node D │    │ Node E │   │
│    │ Verify │    │ Verify │    │ Verify │    │ Verify │   │
│    └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘   │
│        │             │             │             │         │
│        ▼             ▼             ▼             ▼         │
│    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐   │
│    │  Sign  │    │  Sign  │    │  Sign  │    │  Sign  │   │
│    └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘   │
│        │             │             │             │         │
│        └─────────────┴─────────────┴─────────────┘         │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Collect    │                      │
│                     │   Signatures │                      │
│                     └──────┬───────┘                      │
│                            │                               │
│                            ▼                               │
│                     ┌──────────────┐                      │
│                     │   Check      │                      │
│                     │   Quorum     │                      │
│                     └──────┬───────┘                      │
│                            │                               │
│                   ┌────────┴────────┐                      │
│                   │                 │                      │
│                   ▼                 ▼                      │
│              Quorum?           No Quorum                   │
│                Yes                                          │
│                 │                                           │
│                 ▼                                           │
│          ┌──────────────┐                                  │
│          │   Finalize   │                                  │
│          │   Checkpoint │                                  │
│          └──────────────┘                                  │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Signature Service

```typescript
interface QuorumSignatureService {
  // Sign a checkpoint
  signCheckpoint(checkpointId: string): Promise<CheckpointSignature>;
  
  // Verify a signature
  verifySignature(sig: CheckpointSignature): Promise<boolean>;
  
  // Collect signatures for a checkpoint
  collectSignatures(checkpointId: string): Promise<CheckpointSignature[]>;
  
  // Check if quorum reached
  isQuorumReached(checkpointId: string): Promise<boolean>;
  
  // Finalize checkpoint after quorum
  finalizeCheckpoint(checkpointId: string): Promise<Checkpoint>;
  
  // Configuration
  config: QuorumConfig;
}
```

### Signing Algorithm

```typescript
async signCheckpoint(checkpointId: string): Promise<CheckpointSignature> {
  // 1. Get checkpoint
  const checkpoint = await this.db.checkpoints.get(checkpointId);
  if (!checkpoint) throw new Error('Checkpoint not found');
  
  // 2. Verify checkpoint integrity
  const valid = await this.verifyCheckpointIntegrity(checkpoint);
  if (!valid) throw new Error('Checkpoint integrity check failed');
  
  // 3. Get node's private key
  const privateKey = await this.getNodePrivateKey();
  
  // 4. Sign checkpoint root
  const signature = await ed25519.sign(
    checkpoint.checkpoint_root,
    privateKey
  );
  
  // 5. Create signature record
  const sig: CheckpointSignature = {
    id: generateULID(),
    checkpoint_id: checkpointId,
    node_id: this.config.nodeId,
    signature,
    public_key: await this.getNodePublicKey(),
    created_at: new Date().toISOString()
  };
  
  // 6. Store signature
  await this.db.checkpoint_signatures.create(sig);
  
  // 7. Update checkpoint signature count
  await this.db.checkpoints.update(checkpointId, {
    signature_count: checkpoint.signature_count + 1
  });
  
  // 8. Broadcast signature to other nodes
  await this.broadcastSignature(sig);
  
  // 9. Check quorum
  await this.checkAndFinalize(checkpointId);
  
  return sig;
}
```

### Verification Algorithm

```typescript
async verifySignature(sig: CheckpointSignature): Promise<boolean> {
  // 1. Get checkpoint
  const checkpoint = await this.db.checkpoints.get(sig.checkpoint_id);
  if (!checkpoint) return false;
  
  // 2. Verify node is a writer
  const node = await this.db.nodes.get(sig.node_id);
  if (!node || node.role !== 'writer') return false;
  
  // 3. Verify public key matches node
  if (node.public_key !== sig.public_key) return false;
  
  // 4. Verify Ed25519 signature
  const valid = await ed25519.verify(
    checkpoint.checkpoint_root,
    sig.signature,
    sig.public_key
  );
  
  return valid;
}
```

### Finalization

```typescript
async finalizeCheckpoint(checkpointId: string): Promise<Checkpoint> {
  // 1. Get all signatures
  const signatures = await this.db.checkpoint_signatures.find({
    checkpoint_id: checkpointId
  });
  
  // 2. Verify all signatures
  for (const sig of signatures) {
    const valid = await this.verifySignature(sig);
    if (!valid) throw new Error(`Invalid signature from ${sig.node_id}`);
  }
  
  // 3. Check quorum
  const writers = await this.getWriterNodes();
  if (!isQuorumReached(signatures.length, writers.length, this.config)) {
    throw new Error('Quorum not reached');
  }
  
  // 4. Update checkpoint status
  const checkpoint = await this.db.checkpoints.update(checkpointId, {
    status: 'finalized',
    quorum_reached_at: new Date().toISOString()
  });
  
  // 5. Emit event
  this.emit('checkpoint:finalized', checkpoint);
  
  return checkpoint;
}
```

---

## Network Protocol

### Broadcast Checkpoint

```typescript
// Node A broadcasts new checkpoint
POST /internal/checkpoints/broadcast
{
  "checkpoint": { ... },
  "request_signature": true
}

// Response: Accept or reject
{
  "accepted": true,
  "will_sign": true
}
```

### Submit Signature

```typescript
// Node B submits signature to Node A
POST /internal/checkpoints/:id/signatures
{
  "node_id": "node_b",
  "signature": "sig_abc...",
  "public_key": "pk_xyz..."
}

// Response
{
  "accepted": true,
  "signature_count": 3,
  "quorum_reached": true
}
```

### Sync Signatures

```typescript
// Node requests all signatures for a checkpoint
GET /internal/checkpoints/:id/signatures

Response:
{
  "checkpoint_id": "...",
  "signatures": [
    { "node_id": "node_a", "signature": "...", "public_key": "..." },
    { "node_id": "node_b", "signature": "...", "public_key": "..." }
  ],
  "signature_count": 2,
  "quorum_reached": false
}
```

---

## Configuration

### Environment Variables

```bash
# Quorum configuration
QUORUM_FRACTION=0.67           # 2/3
QUORUM_MIN=2                   # Minimum 2 signatures

# Signing keys
NODE_PRIVATE_KEY=...           # Ed25519 private key
NODE_PUBLIC_KEY=...            # Ed25519 public key
```

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `checkpoint.signed` | Counter | Checkpoints signed by this node |
| `checkpoint.quorum` | Counter | Checkpoints finalized |
| `checkpoint.signatures` | Gauge | Current signature count |
| `signature.verify_ms` | Histogram | Signature verification time |

---

## Security Considerations

### Key Management

- Private keys stored in secure storage (not in database)
- Keys should be rotated periodically
- Key rotation requires re-signing pending checkpoints

### Replay Protection

- Each checkpoint has unique ID
- Signatures include checkpoint ID
- Cannot reuse signature for different checkpoint

### Byzantine Fault Tolerance

- System tolerates up to 1/3 malicious writers
- Malicious nodes cannot forge quorum
- Malicious nodes cannot prevent quorum (if honest majority)

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Invalid signature | Reject, log warning |
| Unknown node | Reject signature |
| Key mismatch | Reject, alert admin |
| Quorum timeout | Continue collecting, alert |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-5.3 Checkpoint Creation | Checkpoints to sign |
| Ed25519 | Signature algorithm |
| Node Registry | Writer node list |

---

## Testing Strategy

### Unit Tests

```typescript
describe('QuorumSignatureService', () => {
  it('signs checkpoint correctly', () => {});
  it('verifies valid signature', () => {});
  it('rejects invalid signature', () => {});
  it('rejects signature from non-writer', () => {});
  it('finalizes after quorum reached', () => {});
  it('handles byzantine nodes', () => {});
});
```

### Integration Tests

```typescript
describe('Quorum Integration', () => {
  it('reaches quorum with 3 nodes', () => {});
  it('handles node failure', () => {});
  it('handles slow network', () => {});
});
```

---

*Created by Arche — March 24, 2026*
