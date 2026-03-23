# REQ-L1-021: Checkpoint Verification

**Status:** 📋 Draft  
**Priority:** High (Phase 4)  
**Whitepaper:** Section 4.6 (ILC Consensus)

---

## Description

Checkpoint verification allows any node or external verifier to validate the integrity of a checkpoint. This enables trustless verification of ledger state at any point in history.

---

## Acceptance Criteria

- [ ] Verify checkpoint signature(s)
- [ ] Verify merkle roots against entity states
- [ ] Verify hash chain linking checkpoints
- [ ] Verify journal entries match checkpoint
- [ ] Generate verification report

---

## Design

### Verification Steps

```
┌─────────────────────────────────────────────────────────────┐
│                  Checkpoint Verification                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Signature Verification                                  │
│     ┌──────────────┐                                       │
│     │   Verify     │  Check quorum signatures              │
│     │   Signatures │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  2. Merkle Root Verification                               │
│     ┌──────────────┐                                       │
│     │   Rebuild    │  Rebuild trees from entity states     │
│     │   Trees      │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  3. Hash Chain Verification                                │
│     ┌──────────────┐                                       │
│     │   Verify     │  Check prev_checkpoint_id link        │
│     │   Chain      │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  4. Journal Verification                                   │
│     ┌──────────────┐                                       │
│     │   Verify     │  Match journals to checkpoint         │
│     │   Journals   │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  5. Generate Report                                        │
│     ┌──────────────┐                                       │
│     │   Output     │  Detailed verification result         │
│     │   Report     │                                       │
│     └──────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Verification Result

```typescript
interface VerificationResult {
  checkpoint_id: string;
  verified: boolean;
  verified_at: string;
  
  // Individual checks
  checks: {
    signatures: CheckResult;
    identity_tree: CheckResult;
    node_tree: CheckResult;
    app_tree: CheckResult;
    hash_chain: CheckResult;
    journals: CheckResult;
  };
  
  // Summary
  total_checks: number;
  passed: number;
  failed: number;
  
  // Details
  errors: VerificationError[];
  warnings: VerificationWarning[];
}

interface CheckResult {
  status: 'pass' | 'fail' | 'skip';
  message?: string;
  duration_ms?: number;
}

interface VerificationError {
  step: string;
  message: string;
  details?: any;
}

interface VerificationWarning {
  step: string;
  message: string;
}
```

---

## Implementation

### Verification Service

```typescript
interface CheckpointVerificationService {
  // Verify a checkpoint completely
  verifyCheckpoint(checkpointId: string): Promise<VerificationResult>;
  
  // Verify signatures only
  verifySignatures(checkpointId: string): Promise<CheckResult>;
  
  // Verify merkle trees
  verifyMerkleTrees(checkpointId: string): Promise<{
    identity: CheckResult;
    node: CheckResult;
    app: CheckResult;
  }>;
  
  // Verify hash chain
  verifyHashChain(checkpointId: string): Promise<CheckResult>;
  
  // Verify journals
  verifyJournals(checkpointId: string): Promise<CheckResult>;
  
  // Generate inclusion proof
  generateInclusionProof(
    checkpointId: string,
    entityType: 'identity' | 'node' | 'app',
    entityId: string
  ): Promise<MerkleProof>;
  
  // Verify inclusion proof
  verifyInclusionProof(
    proof: MerkleProof,
    checkpointRoot: string
  ): Promise<boolean>;
  
  // Export verification report
  exportReport(checkpointId: string, format: 'json' | 'html'): Promise<string>;
}
```

### Full Verification

```typescript
async verifyCheckpoint(checkpointId: string): Promise<VerificationResult> {
  const startTime = Date.now();
  const errors: VerificationError[] = [];
  const warnings: VerificationWarning[] = [];
  
  // Get checkpoint
  const checkpoint = await this.db.checkpoints.get(checkpointId);
  if (!checkpoint) {
    return {
      checkpoint_id: checkpointId,
      verified: false,
      verified_at: new Date().toISOString(),
      checks: {},
      total_checks: 6,
      passed: 0,
      failed: 1,
      errors: [{ step: 'load', message: 'Checkpoint not found' }],
      warnings: []
    };
  }
  
  // 1. Verify signatures
  const signatures = await this.verifySignatures(checkpointId);
  
  // 2. Verify merkle trees
  const trees = await this.verifyMerkleTrees(checkpointId);
  
  // 3. Verify hash chain
  const hashChain = await this.verifyHashChain(checkpointId);
  
  // 4. Verify journals
  const journals = await this.verifyJournals(checkpointId);
  
  // Collect results
  const checks = {
    signatures,
    identity_tree: trees.identity,
    node_tree: trees.node,
    app_tree: trees.app,
    hash_chain: hashChain,
    journals
  };
  
  // Count passed/failed
  const results = Object.values(checks);
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  return {
    checkpoint_id: checkpointId,
    verified: failed === 0,
    verified_at: new Date().toISOString(),
    checks,
    total_checks: 6,
    passed,
    failed,
    errors,
    warnings
  };
}
```

### Merkle Tree Verification

```typescript
async verifyMerkleTrees(checkpointId: string): Promise<{
  identity: CheckResult;
  node: CheckResult;
  app: CheckResult;
}> {
  const checkpoint = await this.db.checkpoints.get(checkpointId);
  
  // Get all entities at checkpoint time
  const identities = await this.getIdentitiesAtCheckpoint(checkpointId);
  const nodes = await this.getNodesAtCheckpoint(checkpointId);
  const apps = await this.getAppsAtCheckpoint(checkpointId);
  
  // Compute leaf hashes
  const identityLeaves = identities
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(i => leafHash(i.id, i.state_hash));
  
  const nodeLeaves = nodes
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(n => leafHash(n.id, n.state_hash));
  
  const appLeaves = apps
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(a => leafHash(a.id, a.state_hash));
  
  // Compute roots
  const identityRoot = merkleTreeHash(identityLeaves);
  const nodeRoot = merkleTreeHash(nodeLeaves);
  const appRoot = merkleTreeHash(appLeaves);
  
  // Compare with checkpoint
  return {
    identity: {
      status: identityRoot === checkpoint.identity_root ? 'pass' : 'fail',
      message: identityRoot === checkpoint.identity_root 
        ? 'Identity tree verified' 
        : `Root mismatch: computed ${identityRoot}, expected ${checkpoint.identity_root}`
    },
    node: {
      status: nodeRoot === checkpoint.node_root ? 'pass' : 'fail',
      message: nodeRoot === checkpoint.node_root 
        ? 'Node tree verified' 
        : `Root mismatch: computed ${nodeRoot}, expected ${checkpoint.node_root}`
    },
    app: {
      status: appRoot === checkpoint.app_root ? 'pass' : 'fail',
      message: appRoot === checkpoint.app_root 
        ? 'App tree verified' 
        : `Root mismatch: computed ${appRoot}, expected ${checkpoint.app_root}`
    }
  };
}
```

### Hash Chain Verification

```typescript
async verifyHashChain(checkpointId: string): Promise<CheckResult> {
  const checkpoint = await this.db.checkpoints.get(checkpointId);
  
  // Check if this is the first checkpoint
  if (!checkpoint.prev_checkpoint_id) {
    return {
      status: 'pass',
      message: 'Genesis checkpoint - no previous link'
    };
  }
  
  // Get previous checkpoint
  const prevCheckpoint = await this.db.checkpoints.get(checkpoint.prev_checkpoint_id);
  if (!prevCheckpoint) {
    return {
      status: 'fail',
      message: `Previous checkpoint ${checkpoint.prev_checkpoint_id} not found`
    };
  }
  
  // Verify checkpoint root computation
  const computedRoot = this.computeCheckpointRoot(
    checkpoint.identity_root,
    checkpoint.node_root,
    checkpoint.app_root
  );
  
  if (computedRoot !== checkpoint.checkpoint_root) {
    return {
      status: 'fail',
      message: 'Checkpoint root mismatch'
    };
  }
  
  return {
    status: 'pass',
    message: 'Hash chain verified'
  };
}
```

---

## API Endpoints

### Verify Checkpoint

```http
POST /checkpoints/:id/verify

Response:
{
  "checkpoint_id": "01ARZ3N...",
  "verified": true,
  "verified_at": "2026-03-24T03:45:00Z",
  "checks": {
    "signatures": { "status": "pass" },
    "identity_tree": { "status": "pass" },
    "node_tree": { "status": "pass" },
    "app_tree": { "status": "pass" },
    "hash_chain": { "status": "pass" },
    "journals": { "status": "pass" }
  },
  "total_checks": 6,
  "passed": 6,
  "failed": 0,
  "errors": [],
  "warnings": []
}
```

### Get Inclusion Proof

```http
GET /checkpoints/:id/proof?identity_id=01ARZ3N...

Response:
{
  "checkpoint_id": "01ARZ3N...",
  "identity_root": "merkle_abc...",
  "proof": {
    "leaf_index": 42,
    "leaf_hash": "hash_xyz...",
    "siblings": ["sibling_1", "sibling_2", "sibling_3"],
    "verified": true
  }
}
```

### Export Verification Report

```http
GET /checkpoints/:id/verify/report?format=html

Response:
Content-Type: text/html

<html>
  <h1>Checkpoint Verification Report</h1>
  ...
</html>
```

---

## Verification Report Format

### JSON Report

```json
{
  "report_version": "1.0",
  "checkpoint_id": "01ARZ3N...",
  "checkpoint_sequence": 42,
  "checkpoint_created_at": "2026-03-24T03:00:00Z",
  "verification": {
    "verified": true,
    "verified_at": "2026-03-24T03:45:00Z",
    "verifier_node": "node_abc",
    "checks": {
      "signatures": {
        "status": "pass",
        "signature_count": 3,
        "quorum_required": 2
      },
      "identity_tree": {
        "status": "pass",
        "entity_count": 150,
        "root": "merkle_abc..."
      },
      "node_tree": {
        "status": "pass",
        "entity_count": 5,
        "root": "merkle_def..."
      },
      "app_tree": {
        "status": "pass",
        "entity_count": 12,
        "root": "merkle_ghi..."
      },
      "hash_chain": {
        "status": "pass",
        "prev_checkpoint": "01ARZ2M..."
      },
      "journals": {
        "status": "pass",
        "journal_count": 5,
        "total_entries": 4250
      }
    }
  }
}
```

---

## Performance Considerations

| Check | Complexity | Target Time |
|-------|------------|-------------|
| Signatures | O(s) | < 10ms |
| Identity tree | O(n) | < 1s (1M entities) |
| Node tree | O(n) | < 10ms |
| App tree | O(n) | < 50ms |
| Hash chain | O(1) | < 5ms |
| Journals | O(j) | < 100ms |
| **Total** | O(n) | < 2s |

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `verification.count` | Counter | Verifications performed |
| `verification.passed` | Counter | Successful verifications |
| `verification.failed` | Counter | Failed verifications |
| `verification.duration_ms` | Histogram | Verification time |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-5.3 Checkpoint Creation | Checkpoint data |
| F-8.4 Merkle Tree | Tree verification |
| F-5.4 Quorum Signatures | Signature verification |

---

## Testing Strategy

### Unit Tests

```typescript
describe('CheckpointVerificationService', () => {
  it('verifies valid checkpoint', () => {});
  it('detects invalid signature', () => {});
  it('detects merkle root mismatch', () => {});
  it('detects hash chain break', () => {});
  it('generates inclusion proof', () => {});
  it('verifies inclusion proof', () => {});
  it('exports JSON report', () => {});
  it('exports HTML report', () => {});
});
```

### Integration Tests

```typescript
describe('Verification Integration', () => {
  it('verifies checkpoint end-to-end', () => {});
  it('proves entity inclusion', () => {});
  it('handles large checkpoints', () => {});
});
```

---

*Created by Arche — March 24, 2026*
