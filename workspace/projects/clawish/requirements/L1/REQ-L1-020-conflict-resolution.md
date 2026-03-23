# REQ-L1-020: Conflict Resolution

**Status:** 📋 Draft  
**Priority:** Medium (Phase 3)  
**Whitepaper:** Section 4.5 (Ledger System)

---

## Description

Conflict resolution handles situations where nodes have divergent ledger states. This can occur during network partitions or Byzantine behavior. The goal is to achieve eventual consistency.

---

## Acceptance Criteria

- [ ] Conflicts detected when hash chains diverge
- [ ] Resolution follows deterministic rules
- [ ] All nodes converge to same state
- [ ] No data loss during resolution
- [ ] Conflict events logged for audit

---

## Design

### Conflict Types

| Type | Description | Resolution |
|------|-------------|------------|
| Fork | Two different entries at same height | Highest checkpoint wins |
| Orphan | Entry references non-existent previous | Request missing entries |
| Timestamp | Conflicting timestamps | Use earliest valid |
| Signature | Invalid signature on entry | Reject entry |

### Conflict Detection

```typescript
interface Conflict {
  id: string;
  type: ConflictType;
  detected_at: string;
  
  // Fork details
  height?: number;
  local_hash?: string;
  remote_hash?: string;
  remote_node?: string;
  
  // Resolution
  resolution: 'local_wins' | 'remote_wins' | 'merge' | 'reject';
  resolved_at?: string;
}

type ConflictType = 'fork' | 'orphan' | 'timestamp' | 'signature';
```

---

## Resolution Rules

### Rule 1: Checkpoint Authority

```
If conflict detected:
  1. Find last common checkpoint
  2. Rollback to that checkpoint
  3. Replay entries from checkpoint forward
  4. Accept entries with valid signatures
```

**Rationale:** Checkpoints are signed by quorum, providing authoritative truth.

### Rule 2: Longest Valid Chain

```
If no common checkpoint:
  1. Compare chain lengths
  2. Longer chain wins (more work)
  3. Verify all entries on winning chain
```

**Rationale:** Similar to blockchain, longest valid chain represents most work.

### Rule 3: Timestamp Priority

```
If same length, different entries:
  1. Compare entry timestamps
  2. Earlier timestamp wins
  3. If same timestamp, lower hash wins
```

**Rationale:** Deterministic ordering prevents indefinite conflicts.

---

## Implementation

### Conflict Resolution Service

```typescript
interface ConflictResolutionService {
  // Detect conflicts between local and remote state
  detectConflicts(remoteState: SyncState, remoteNode: string): Promise<Conflict[]>;
  
  // Resolve a specific conflict
  resolveConflict(conflictId: string): Promise<void>;
  
  // Rollback to checkpoint
  rollbackToCheckpoint(checkpointId: string): Promise<void>;
  
  // Replay entries from height
  replayEntriesFrom(height: number): Promise<void>;
  
  // Get conflict history
  getConflictHistory(limit?: number): Promise<Conflict[]>;
  
  // Configuration
  config: ResolutionConfig;
}

interface ResolutionConfig {
  autoResolve: boolean;         // Auto-resolve conflicts (default: true)
  maxRollbackDepth: number;     // Max checkpoints to rollback (default: 10)
  auditLog: boolean;            // Log all conflicts (default: true)
}
```

### Fork Resolution

```typescript
async resolveFork(conflict: Conflict): Promise<void> {
  // 1. Find last common checkpoint
  const commonCheckpoint = await this.findCommonCheckpoint(
    conflict.remote_node!
  );
  
  if (commonCheckpoint) {
    // 2. Rollback to common checkpoint
    await this.rollbackToCheckpoint(commonCheckpoint.id);
    
    // 3. Request entries from peer since checkpoint
    const entries = await this.requestEntriesFrom(
      conflict.remote_node!,
      commonCheckpoint.sequence
    );
    
    // 4. Verify and replay entries
    for (const entry of entries) {
      const valid = await this.verifyEntry(entry);
      if (valid) {
        await this.appendEntry(entry);
      } else {
        // Invalid entry, stop and alert
        await this.logConflict(conflict, 'invalid_entry');
        return;
      }
    }
    
    // 5. Mark conflict resolved
    conflict.resolution = 'remote_wins';
    conflict.resolved_at = new Date().toISOString();
    
  } else {
    // No common checkpoint - use longest chain rule
    await this.resolveByLongestChain(conflict);
  }
}
```

### Rollback Algorithm

```typescript
async rollbackToCheckpoint(checkpointId: string): Promise<void> {
  // 1. Get checkpoint
  const checkpoint = await this.db.checkpoints.get(checkpointId);
  
  // 2. Get current height
  const currentHeight = await this.getLedgerHeight();
  
  // 3. Archive entries after checkpoint
  const entries = await this.db.ledgers.find({
    height: { $gt: checkpoint.sequence }
  });
  
  // 4. Move to archive table
  for (const entry of entries) {
    await this.db.ledgers_archive.create(entry);
    await this.db.ledgers.delete(entry.id);
  }
  
  // 5. Reset journals after checkpoint
  await this.db.journals.update(
    { checkpoint_id: { $gt: checkpointId } },
    { status: 'rolled_back' }
  );
  
  // 6. Update sync state
  await this.updateSyncState({
    last_synced_height: checkpoint.sequence,
    last_synced_hash: checkpoint.checkpoint_root
  });
}
```

### Longest Chain Resolution

```typescript
async resolveByLongestChain(conflict: Conflict): Promise<void> {
  // 1. Get local chain length
  const localHeight = await this.getLedgerHeight();
  
  // 2. Get remote chain length
  const remoteState = await this.getPeerState(conflict.remote_node!);
  
  // 3. Compare
  if (remoteState.height > localHeight) {
    // Remote is longer - accept it
    await this.acceptRemoteChain(conflict.remote_node!);
    conflict.resolution = 'remote_wins';
  } else if (remoteState.height < localHeight) {
    // Local is longer - keep it
    conflict.resolution = 'local_wins';
  } else {
    // Same length - use timestamp rule
    await this.resolveByTimestamp(conflict);
  }
  
  conflict.resolved_at = new Date().toISOString();
}
```

---

## Database Schema

```sql
CREATE TABLE conflicts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  height INTEGER,
  local_hash TEXT,
  remote_hash TEXT,
  remote_node TEXT,
  resolution TEXT,
  resolved_at TEXT,
  metadata TEXT  -- JSON for additional details
);

CREATE INDEX idx_conflicts_detected ON conflicts(detected_at);
CREATE INDEX idx_conflicts_resolution ON conflicts(resolution);
```

---

## Audit Trail

### Conflict Log Format

```json
{
  "id": "conflict_001",
  "type": "fork",
  "detected_at": "2026-03-24T03:30:00Z",
  "height": 150,
  "local_hash": "hash_local...",
  "remote_hash": "hash_remote...",
  "remote_node": "node_xyz",
  "resolution": "remote_wins",
  "resolved_at": "2026-03-24T03:30:05Z",
  "details": {
    "common_checkpoint": "checkpoint_10",
    "entries_rolled_back": 5,
    "entries_accepted": 10
  }
}
```

---

## Network Protocol

### Report Conflict

```http
POST /internal/conflicts
{
  "type": "fork",
  "height": 150,
  "local_hash": "hash_local...",
  "remote_node": "node_xyz"
}

Response:
{
  "conflict_id": "conflict_001",
  "status": "investigating"
}
```

### Get Conflict Status

```http
GET /internal/conflicts/:id

Response:
{
  "id": "conflict_001",
  "type": "fork",
  "resolution": "remote_wins",
  "resolved_at": "2026-03-24T03:30:05Z"
}
```

---

## Byzantine Fault Tolerance

### Handling Malicious Nodes

| Scenario | Detection | Response |
|----------|-----------|----------|
| Invalid signatures | Signature verification fails | Reject, decrease reputation |
| False checkpoints | Checkpoint not in quorum | Reject, alert network |
| Conflicting journals | Hash mismatch | Reject, blacklist if repeated |
| Timestamp manipulation | Timestamp outside range | Reject, log suspicious activity |

### Reputation Impact

| Conflict Type | Reputation Change |
|---------------|-------------------|
| Resolved normally | 0 |
| Invalid signature from peer | -20 |
| False checkpoint from peer | -50 (blacklist) |
| Successful resolution | +5 |

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `conflict.detected` | Counter | Conflicts detected |
| `conflict.resolved` | Counter | Conflicts resolved |
| `conflict.rollback_count` | Counter | Rollbacks performed |
| `conflict.resolution_ms` | Histogram | Resolution time |

---

## Error Handling

| Error | Recovery |
|-------|----------|
| No common checkpoint | Use longest chain rule |
| Rollback fails | Stop, manual intervention |
| Invalid entries during replay | Alert, manual review |
| Excessive conflicts | Alert admin, potential attack |

---

## Configuration

### Environment Variables

```bash
# Conflict resolution configuration
CONFLICT_AUTO_RESOLVE=true
CONFLICT_MAX_ROLLBACK=10
CONFLICT_AUDIT_LOG=true
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-4.6 Journal Tables | Journal data |
| F-5.3 Checkpoint Creation | Checkpoint authority |
| F-6.1 Entry Sync | Entry replay |
| F-6.4 Peer Discovery | Peer reputation |

---

## Testing Strategy

### Unit Tests

```typescript
describe('ConflictResolutionService', () => {
  it('detects fork conflicts', () => {});
  it('resolves fork using checkpoint authority', () => {});
  it('resolves using longest chain rule', () => {});
  it('resolves using timestamp priority', () => {});
  it('rolls back to checkpoint correctly', () => {});
  it('logs conflict for audit', () => {});
});
```

### Integration Tests

```typescript
describe('Conflict Resolution Integration', () => {
  it('resolves network partition conflict', () => {});
  it('handles Byzantine node', () => {});
  it('achieves eventual consistency', () => {});
});
```

---

*Created by Arche — March 24, 2026*
