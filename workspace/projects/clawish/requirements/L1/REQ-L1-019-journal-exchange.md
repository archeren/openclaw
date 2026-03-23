# REQ-L1-019: Journal Exchange

**Status:** 📋 Draft  
**Priority:** High (Phase 3)  
**Whitepaper:** Section 4.5 (Ledger System)

---

## Description

Journal exchange enables nodes to share closed journals with each other. This is more efficient than syncing individual entries and enables cross-node checkpoint creation.

---

## Acceptance Criteria

- [ ] Nodes can request journals from peers
- [ ] Nodes can send journals to peers
- [ ] Journal integrity verified before acceptance
- [ ] Missing journals detected and requested
- [ ] Exchange optimized with compression

---

## Design

### Exchange Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Journal Exchange Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Node A                    Node B                           │
│    │                         │                              │
│    │  GET /journals/list     │                              │
│    │ ───────────────────────▶│                              │
│    │                         │                              │
│    │  { journals: [1..42] }  │                              │
│    │ ◀───────────────────────│                              │
│    │                         │                              │
│    │  I have [1..40]         │                              │
│    │  Missing: 41, 42        │                              │
│    │                         │                              │
│    │  GET /journals/41       │                              │
│    │ ───────────────────────▶│                              │
│    │                         │                              │
│    │  { journal: {...} }     │                              │
│    │ ◀───────────────────────│                              │
│    │                         │                              │
│    │  Verify & import        │                              │
│    │                         │                              │
│    │  GET /journals/42       │                              │
│    │ ───────────────────────▶│                              │
│    │                         │                              │
│    │  { journal: {...} }     │                              │
│    │ ◀───────────────────────│                              │
│    │                         │                              │
│    │  Verify & import        │                              │
│    │                         │                              │
└─────────────────────────────────────────────────────────────┘
```

### Journal Export Format

```typescript
interface JournalExport {
  // Metadata
  id: string;
  sequence: number;
  node_id: string;
  status: string;
  entry_count: number;
  merkle_root: string;
  prev_journal_hash: string | null;
  hash: string;
  created_at: string;
  closed_at: string;
  
  // Entries
  entries: JournalEntryExport[];
  
  // Optional: Compression
  compressed?: boolean;
  compression_format?: 'gzip' | 'zstd';
}

interface JournalEntryExport {
  sequence: number;
  ledger_id: string;
  hash: string;
  identity_id: string;
  operation: string;
  timestamp: string;
}
```

---

## Implementation

### Journal Exchange Service

```typescript
interface JournalExchangeService {
  // Get list of journal sequences
  getJournalList(): Promise<number[]>;
  
  // Get specific journal for export
  getJournal(sequence: number): Promise<JournalExport>;
  
  // Request journal from peer
  requestJournal(nodeId: string, sequence: number): Promise<JournalExport>;
  
  // Import journal from peer
  importJournal(journal: JournalExport, from: string): Promise<void>;
  
  // Verify journal integrity
  verifyJournal(journal: JournalExport): Promise<boolean>;
  
  // Find missing journals
  findMissingJournals(peerList: number[]): Promise<number[]>;
  
  // Exchange all missing journals with peer
  exchangeWithPeer(nodeId: string): Promise<void>;
  
  // Configuration
  config: ExchangeConfig;
}

interface ExchangeConfig {
  compressionEnabled: boolean;
  compressionThreshold: number;  // Bytes (default: 1024)
  batchSize: number;             // Journals per batch (default: 10)
  timeoutMs: number;             // Request timeout (default: 30000)
}
```

### Exchange Algorithm

```typescript
async exchangeWithPeer(nodeId: string): Promise<void> {
  // 1. Get peer's journal list
  const peerJournals = await this.getPeerJournalList(nodeId);
  
  // 2. Get my journal list
  const myJournals = await this.getJournalList();
  
  // 3. Find missing journals
  const missing = peerJournals.filter(s => !myJournals.includes(s));
  
  if (missing.length === 0) {
    return;  // Already synced
  }
  
  // 4. Sort by sequence
  missing.sort((a, b) => a - b);
  
  // 5. Request and import missing journals
  for (const seq of missing) {
    const journal = await this.requestJournal(nodeId, seq);
    await this.importJournal(journal, nodeId);
  }
}
```

### Import Algorithm

```typescript
async importJournal(journal: JournalExport, from: string): Promise<void> {
  // 1. Verify journal hash
  const valid = await this.verifyJournal(journal);
  if (!valid) {
    throw new Error(`Invalid journal ${journal.sequence} from ${from}`);
  }
  
  // 2. Verify hash chain (prev_journal_hash)
  if (journal.sequence > 1) {
    const prevJournal = await this.getJournalBySequence(journal.sequence - 1);
    if (journal.prev_journal_hash !== prevJournal?.hash) {
      throw new Error(`Hash chain break at journal ${journal.sequence}`);
    }
  }
  
  // 3. Verify merkle root
  const computedRoot = merkleTreeHash(journal.entries.map(e => e.hash));
  if (computedRoot !== journal.merkle_root) {
    throw new Error(`Merkle root mismatch at journal ${journal.sequence}`);
  }
  
  // 4. Check if entries exist
  for (const entry of journal.entries) {
    const existing = await this.getLedgerEntry(entry.ledger_id);
    if (!existing) {
      // Entry missing, need to request from peer
      await this.requestLedgerEntry(from, entry.ledger_id);
    }
  }
  
  // 5. Insert journal
  await this.db.journals.create({
    id: journal.id,
    sequence: journal.sequence,
    node_id: journal.node_id,
    status: 'closed',
    entry_count: journal.entry_count,
    merkle_root: journal.merkle_root,
    prev_journal_hash: journal.prev_journal_hash,
    hash: journal.hash,
    created_at: journal.created_at,
    closed_at: journal.closed_at
  });
  
  // 6. Insert journal entries
  for (const entry of journal.entries) {
    await this.db.journal_entries.create({
      id: generateULID(),
      journal_id: journal.id,
      ledger_id: entry.ledger_id,
      sequence: entry.sequence,
      hash: entry.hash,
      created_at: entry.timestamp
    });
  }
}
```

---

## Network Protocol

### Get Journal List

```http
GET /internal/journals

Response:
{
  "journals": [1, 2, 3, 4, 5],
  "latest_sequence": 5,
  "total_entries": 4250
}
```

### Get Journal

```http
GET /internal/journals/:sequence

Response:
{
  "id": "journal_005",
  "sequence": 5,
  "node_id": "node_abc",
  "status": "closed",
  "entry_count": 850,
  "merkle_root": "merkle_abc...",
  "prev_journal_hash": "hash_004...",
  "hash": "hash_005...",
  "created_at": "2026-03-24T02:00:00Z",
  "closed_at": "2026-03-24T02:05:00Z",
  "entries": [
    {
      "sequence": 0,
      "ledger_id": "entry_001",
      "hash": "hash_001...",
      "identity_id": "id_abc",
      "operation": "identity.created",
      "timestamp": "2026-03-24T02:01:00Z"
    }
  ]
}
```

### Get Journal (Compressed)

```http
GET /internal/journals/:sequence?format=gzip

Response:
Content-Encoding: gzip

<compressed journal data>
```

---

## Compression

### Compression Strategy

```typescript
async getJournal(sequence: number, compress?: boolean): Promise<JournalExport> {
  const journal = await this.db.journals.getBySequence(sequence);
  const entries = await this.db.journal_entries.getByJournal(journal.id);
  
  const export: JournalExport = {
    ...journal,
    entries: entries.map(e => ({
      sequence: e.sequence,
      ledger_id: e.ledger_id,
      hash: e.hash,
      identity_id: e.identity_id,
      operation: e.operation,
      timestamp: e.created_at
    }))
  };
  
  // Compress if enabled and above threshold
  if (compress && this.config.compressionEnabled) {
    const size = JSON.stringify(export).length;
    if (size > this.config.compressionThreshold) {
      return this.compressJournal(export);
    }
  }
  
  return export;
}
```

### Compression Benchmarks

| Journal Size | Uncompressed | Gzip | Zstd |
|--------------|--------------|------|------|
| 100 entries | 15 KB | 3 KB | 2.5 KB |
| 500 entries | 75 KB | 15 KB | 12 KB |
| 1000 entries | 150 KB | 30 KB | 24 KB |

**Recommendation:** Use Zstd for better compression ratio and speed.

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `journal.exchange_count` | Counter | Journals exchanged |
| `journal.import_count` | Counter | Journals imported |
| `journal.export_count` | Counter | Journals exported |
| `journal.verify_ms` | Histogram | Verification time |
| `journal.size_bytes` | Histogram | Journal size |

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Invalid journal hash | Reject, log warning |
| Hash chain break | Reject, try different peer |
| Missing ledger entries | Request entries separately |
| Timeout | Retry with backoff |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| F-4.6 Journal Tables | Storage |
| F-6.1 Entry Sync | Ledger entries |
| F-8.4 Merkle Tree | Merkle verification |

---

## Testing Strategy

### Unit Tests

```typescript
describe('JournalExchangeService', () => {
  it('exports journal correctly', () => {});
  it('imports valid journal', () => {});
  it('rejects invalid journal hash', () => {});
  it('rejects hash chain break', () => {});
  it('detects missing journals', () => {});
  it('compresses large journals', () => {});
});
```

### Integration Tests

```typescript
describe('Journal Exchange Integration', () => {
  it('exchanges journals between nodes', () => {});
  it('handles concurrent exchange requests', () => {});
  it('syncs node from journal history', () => {});
});
```

---

*Created by Arche — March 24, 2026*
