# REQ-L1-014: Journal Batching

**Status:** 📋 Draft  
**Priority:** Critical (Phase 2)  
**Whitepaper:** Section 4.5 (Ledger System)

---

## Description

Journal batching is the process of grouping ledger entries into journals at fixed intervals. This enables efficient checkpoint creation and cross-node data exchange.

---

## Acceptance Criteria

- [ ] Ledger entries automatically batched into journals
- [ ] Configurable batch parameters (time, size)
- [ ] Journal closing triggered by time or size threshold
- [ ] Batch process idempotent and recoverable
- [ ] Metrics emitted for monitoring

---

## Design

### Batching Triggers

| Trigger | Default | Configurable |
|---------|---------|--------------|
| Time elapsed | 5 minutes | Yes |
| Entry count | 1000 entries | Yes |
| Manual command | — | Yes (admin) |

**Batching rules:**
1. If time threshold reached → close journal immediately
2. If size threshold reached → close journal immediately
3. Manual close → close journal immediately (bypass thresholds)
4. Whichever comes first wins

### Batch Service

```typescript
interface JournalBatchService {
  // Start batching service (runs in background)
  start(): void;
  
  // Stop batching service
  stop(): void;
  
  // Manually close current journal
  closeCurrentJournal(): Promise<Journal>;
  
  // Add entry to current journal
  addEntry(ledgerEntry: LedgerEntry): Promise<void>;
  
  // Get current open journal
  getCurrentJournal(): Journal | null;
  
  // Configuration
  config: BatchConfig;
}

interface BatchConfig {
  timeThresholdMs: number;    // Default: 300000 (5 min)
  sizeThreshold: number;      // Default: 1000
  nodeId: string;             // This node's ID
}
```

### Service Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                  Journal Batch Service              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐    ┌─────────────┐               │
│  │   Timer     │    │   Entry     │               │
│  │   (5 min)   │    │   Counter   │               │
│  └──────┬──────┘    └──────┬──────┘               │
│         │                  │                       │
│         └──────┬───────────┘                       │
│                │                                   │
│                ▼                                   │
│         ┌─────────────┐                           │
│         │   Trigger   │                           │
│         │   Check     │                           │
│         └──────┬──────┘                           │
│                │                                   │
│      ┌─────────┴─────────┐                        │
│      │                   │                        │
│      ▼                   ▼                        │
│  Threshold?         Manual?                       │
│      │                   │                        │
│      └─────────┬─────────┘                        │
│                │                                   │
│                ▼                                   │
│         ┌─────────────┐                           │
│         │   Close     │                           │
│         │   Journal   │                           │
│         └──────┬──────┘                           │
│                │                                   │
│                ▼                                   │
│         ┌─────────────┐                           │
│         │   Compute   │                           │
│         │   Merkle    │                           │
│         └──────┬──────┘                           │
│                │                                   │
│                ▼                                   │
│         ┌─────────────┐                           │
│         │   Create    │                           │
│         │   New       │                           │
│         └─────────────┘                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation

### Timer-Based Batching

```typescript
class JournalBatchService {
  private timer: Timer | null = null;
  private currentJournal: Journal | null = null;
  private entryCount = 0;
  
  start() {
    // Create initial journal
    this.createNewJournal();
    
    // Start timer
    this.timer = setInterval(() => {
      this.checkAndClose();
    }, 1000); // Check every second
  }
  
  private checkAndClose() {
    if (!this.currentJournal) return;
    
    const elapsed = Date.now() - this.currentJournal.createdAt.getTime();
    const timeThreshold = this.config.timeThresholdMs;
    const sizeThreshold = this.config.sizeThreshold;
    
    if (elapsed >= timeThreshold || this.entryCount >= sizeThreshold) {
      this.closeCurrentJournal();
    }
  }
  
  async closeCurrentJournal(): Promise<Journal> {
    if (!this.currentJournal) {
      throw new Error('No open journal to close');
    }
    
    // Get all entries
    const entries = await this.getEntries(this.currentJournal.id);
    
    // Compute merkle root
    const hashes = entries.map(e => e.hash);
    const merkleRoot = merkleTreeHash(hashes);
    
    // Compute journal hash
    const prevJournal = await this.getPreviousJournal();
    const prevHash = prevJournal?.hash || null;
    
    const journalHash = this.computeJournalHash(
      this.currentJournal,
      merkleRoot,
      prevHash
    );
    
    // Update journal
    await this.db.journals.update(this.currentJournal.id, {
      status: 'closed',
      entry_count: entries.length,
      merkle_root: merkleRoot,
      prev_journal_hash: prevHash,
      hash: journalHash,
      closed_at: new Date()
    });
    
    // Emit metrics
    this.emitMetrics(this.currentJournal, entries.length);
    
    // Create new journal
    const closed = this.currentJournal;
    this.createNewJournal();
    
    return closed;
  }
}
```

### Entry Addition

```typescript
async addEntry(ledgerEntry: LedgerEntry): Promise<void> {
  if (!this.currentJournal) {
    throw new Error('No open journal');
  }
  
  await this.db.journal_entries.create({
    id: generateULID(),
    journal_id: this.currentJournal.id,
    ledger_id: ledgerEntry.id,
    sequence: this.entryCount,
    hash: ledgerEntry.hash,
    created_at: new Date()
  });
  
  this.entryCount++;
}
```

---

## Error Handling

### Recovery Scenarios

| Scenario | Recovery |
|----------|----------|
| Service crash | Resume from last closed journal |
| Partial close | Rollback transaction, retry |
| Missing entries | Query ledger for missing entries |
| Hash mismatch | Recompute merkle root, validate |

### Idempotency

```typescript
async recover() {
  // Find any open journals
  const openJournals = await this.db.journals.find({
    status: 'open',
    node_id: this.config.nodeId
  });
  
  if (openJournals.length > 0) {
    // Resume with existing journal
    this.currentJournal = openJournals[0];
    this.entryCount = await this.countEntries(this.currentJournal.id);
  } else {
    // Create new journal
    this.createNewJournal();
  }
}
```

---

## Configuration

### Environment Variables

```bash
# Journal batching configuration
JOURNAL_TIME_THRESHOLD_MS=300000  # 5 minutes
JOURNAL_SIZE_THRESHOLD=1000       # 1000 entries
JOURNAL_NODE_ID=node_abc123
```

### Dynamic Configuration

```typescript
interface BatchConfig {
  timeThresholdMs: number;
  sizeThreshold: number;
  nodeId: string;
  
  // Optional: load from config service
  configService?: ConfigService;
}

// Update config at runtime
service.updateConfig({
  timeThresholdMs: 60000,  // 1 minute for testing
  sizeThreshold: 100
});
```

---

## Metrics

### Emitted Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `journal.created` | Counter | New journal created |
| `journal.closed` | Counter | Journal closed |
| `journal.entries` | Gauge | Entries in current journal |
| `journal.size_bytes` | Gauge | Size in bytes |
| `journal.close_time_ms` | Histogram | Time to close journal |

### Example Prometheus Export

```
# HELP journal_closed_total Total journals closed
# TYPE journal_closed_total counter
journal_closed_total{node="node_abc"} 42

# HELP journal_entries_current Entries in current journal
# TYPE journal_entries_current gauge
journal_entries_current{node="node_abc"} 850

# HELP journal_close_duration_ms Time to close journal
# TYPE journal_close_duration_ms histogram
journal_close_duration_ms_bucket{le="10"} 5
journal_close_duration_ms_bucket{le="50"} 20
journal_close_duration_ms_bucket{le="100"} 38
```

---

## Integration Points

| Component | Integration |
|-----------|-------------|
| Ledger Module | Receives ledger entries for batching |
| Checkpoint Module | Consumes closed journals |
| Sync Module | Exports/imports journals |
| API | Manual close endpoint |
| Monitoring | Metrics endpoint |

---

## API Endpoints

### Manual Close

```http
POST /admin/journals/close
Authorization: Bearer <admin_token>

Response:
{
  "id": "01ARZ3N...",
  "sequence": 42,
  "entry_count": 850,
  "merkle_root": "abc123...",
  "status": "closed"
}
```

### Get Current Journal

```http
GET /admin/journals/current
Authorization: Bearer <admin_token>

Response:
{
  "id": "01ARZ3N...",
  "sequence": 43,
  "status": "open",
  "entry_count": 125,
  "created_at": "2026-03-24T02:30:00Z"
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('JournalBatchService', () => {
  it('creates journal on start', () => {});
  it('adds entries to current journal', () => {});
  it('closes journal on time threshold', () => {});
  it('closes journal on size threshold', () => {});
  it('computes correct merkle root', () => {});
  it('links to previous journal hash', () => {});
  it('recovers from crash', () => {});
  it('handles concurrent entries', () => {});
});
```

### Integration Tests

```typescript
describe('Journal Batching Integration', () => {
  it('batches ledger entries end-to-end', () => {});
  it('integrates with checkpoint creation', () => {});
  it('exports and imports journals', () => {});
});
```

---

## Performance Considerations

| Metric | Target | Notes |
|--------|--------|-------|
| Entry addition | < 5ms | Including DB write |
| Journal close | < 100ms | For 1000 entries |
| Merkle computation | < 50ms | For 1000 entries |
| Memory usage | < 10MB | Streaming, not loading all |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-4.6 Journal Tables | Database schema |
| F-8.4 Merkle Tree | merkleTreeHash function |
| Ledger Module | Entry stream |

---

*Created by Arche — March 24, 2026*
