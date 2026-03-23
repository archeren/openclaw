# REQ-L1-022: Version Management

**Status:** 📋 Draft  
**Priority:** Medium (Phase 4)  
**Whitepaper:** Section 4.6 (ILC Consensus)

---

## Description

Version management handles schema migrations and protocol upgrades across the L1 network. This ensures all nodes can evolve together while maintaining backward compatibility.

---

## Acceptance Criteria

- [ ] Schema version tracked in checkpoints
- [ ] Nodes can query compatible versions
- [ ] Graceful degradation for version mismatch
- [ ] Migration scripts for version upgrades
- [ ] Version negotiation during peer connection

---

## Design

### Version Structure

```typescript
interface Version {
  major: number;      // Breaking changes
  minor: number;      // New features, backward compatible
  patch: number;      // Bug fixes
  schema: number;     // Database schema version
  protocol: number;   // Network protocol version
}

// Example
const CURRENT_VERSION: Version = {
  major: 1,
  minor: 0,
  patch: 0,
  schema: 3,
  protocol: 1
};
```

### Compatibility Rules

| Version Change | Compatible | Action |
|----------------|------------|--------|
| Patch only | ✅ Yes | Continue |
| Minor increase | ✅ Yes | Continue |
| Major increase | ❌ No | Require upgrade |
| Schema increase | ⚠️ Partial | Migrate first |
| Protocol increase | ⚠️ Partial | Negotiate |

### Version Storage

```sql
-- Node version tracking
ALTER TABLE nodes ADD COLUMN version_major INTEGER NOT NULL DEFAULT 1;
ALTER TABLE nodes ADD COLUMN version_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE nodes ADD COLUMN version_patch INTEGER NOT NULL DEFAULT 0;
ALTER TABLE nodes ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE nodes ADD COLUMN protocol_version INTEGER NOT NULL DEFAULT 1;

-- Checkpoint version tracking
ALTER TABLE checkpoints ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE checkpoints ADD COLUMN protocol_version INTEGER NOT NULL DEFAULT 1;

-- Version history
CREATE TABLE version_history (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  upgraded_at TEXT NOT NULL,
  migration_id TEXT,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id)
);
```

---

## Implementation

### Version Manager Service

```typescript
interface VersionManagementService {
  // Get current version
  getVersion(): Version;
  
  // Get node's version
  getNodeVersion(nodeId: string): Promise<Version>;
  
  // Check compatibility with peer
  checkCompatibility(peerVersion: Version): CompatibilityResult;
  
  // Get required migrations
  getMigrations(fromSchema: number, toSchema: number): Promise<Migration[]>;
  
  // Execute migration
  executeMigration(migrationId: string): Promise<MigrationResult>;
  
  // Get version history
  getVersionHistory(nodeId?: string): Promise<VersionHistoryEntry[]>;
  
  // Announce version to network
  announceVersion(): Promise<void>;
  
  // Configuration
  config: VersionConfig;
}

interface CompatibilityResult {
  compatible: boolean;
  action: 'continue' | 'upgrade' | 'migrate' | 'reject';
  requiredVersion?: Version;
  requiredMigrations?: string[];
}

interface Migration {
  id: string;
  from_schema: number;
  to_schema: number;
  script: string;
  reversible: boolean;
  description: string;
}

interface MigrationResult {
  migration_id: string;
  success: boolean;
  duration_ms: number;
  error?: string;
}
```

### Compatibility Check

```typescript
checkCompatibility(peerVersion: Version): CompatibilityResult {
  const myVersion = this.getVersion();
  
  // Check major version
  if (peerVersion.major !== myVersion.major) {
    if (peerVersion.major > myVersion.major) {
      return {
        compatible: false,
        action: 'upgrade',
        requiredVersion: { ...myVersion, major: peerVersion.major }
      };
    } else {
      return {
        compatible: false,
        action: 'reject',
        requiredVersion: myVersion
      };
    }
  }
  
  // Check schema version
  if (peerVersion.schema !== myVersion.schema) {
    if (peerVersion.schema > myVersion.schema) {
      return {
        compatible: false,
        action: 'migrate',
        requiredMigrations: this.getMigrationIds(myVersion.schema, peerVersion.schema)
      };
    } else {
      // I'm ahead, can still communicate
      return {
        compatible: true,
        action: 'continue'
      };
    }
  }
  
  // Check protocol version
  if (peerVersion.protocol !== myVersion.protocol) {
    // Negotiate to lowest common protocol
    const minProtocol = Math.min(peerVersion.protocol, myVersion.protocol);
    return {
      compatible: true,
      action: 'continue',
      // Will use protocol version minProtocol
    };
  }
  
  return {
    compatible: true,
    action: 'continue'
  };
}
```

### Migration Execution

```typescript
async executeMigration(migrationId: string): Promise<MigrationResult> {
  const startTime = Date.now();
  
  // Get migration script
  const migration = await this.getMigration(migrationId);
  
  try {
    // 1. Create backup
    await this.createBackup();
    
    // 2. Begin transaction
    await this.db.beginTransaction();
    
    // 3. Execute migration script
    await this.db.execute(migration.script);
    
    // 4. Update schema version
    await this.updateSchemaVersion(migration.to_schema);
    
    // 5. Commit transaction
    await this.db.commit();
    
    // 6. Log migration
    await this.logMigration(migration);
    
    return {
      migration_id: migrationId,
      success: true,
      duration_ms: Date.now() - startTime
    };
    
  } catch (error) {
    // Rollback on failure
    await this.db.rollback();
    await this.restoreBackup();
    
    return {
      migration_id: migrationId,
      success: false,
      duration_ms: Date.now() - startTime,
      error: error.message
    };
  }
}
```

---

## Migration Scripts

### Migration File Format

```typescript
// migrations/001_to_002.ts
export const migration: Migration = {
  id: 'mig_001_to_002',
  from_schema: 1,
  to_schema: 2,
  reversible: true,
  description: 'Add journal tables for checkpoint support',
  script: `
    CREATE TABLE journals (
      id TEXT PRIMARY KEY,
      sequence INTEGER NOT NULL UNIQUE,
      node_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      entry_count INTEGER NOT NULL DEFAULT 0,
      merkle_root TEXT,
      prev_journal_hash TEXT,
      hash TEXT,
      created_at TEXT NOT NULL,
      closed_at TEXT,
      checkpoint_id TEXT
    );
    
    CREATE TABLE journal_entries (
      id TEXT PRIMARY KEY,
      journal_id TEXT NOT NULL,
      ledger_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (journal_id) REFERENCES journals(id),
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id)
    );
  `,
  rollback: `
    DROP TABLE journal_entries;
    DROP TABLE journals;
  `
};
```

### Migration Registry

```typescript
const MIGRATIONS: Migration[] = [
  {
    id: 'mig_001_to_002',
    from_schema: 1,
    to_schema: 2,
    // ...
  },
  {
    id: 'mig_002_to_003',
    from_schema: 2,
    to_schema: 3,
    // ...
  }
];

function getMigrationIds(from: number, to: number): string[] {
  const ids: string[] = [];
  for (let i = from; i < to; i++) {
    const migration = MIGRATIONS.find(m => m.from_schema === i && m.to_schema === i + 1);
    if (migration) ids.push(migration.id);
  }
  return ids;
}
```

---

## Network Protocol

### Version Handshake

```typescript
// During peer connection
async performHandshake(peerId: string): Promise<boolean> {
  // 1. Exchange versions
  const myVersion = this.getVersion();
  const peerVersion = await this.getPeerVersion(peerId);
  
  // 2. Check compatibility
  const result = this.checkCompatibility(peerVersion);
  
  // 3. Handle result
  switch (result.action) {
    case 'continue':
      return true;
    
    case 'upgrade':
      console.warn(`Upgrade required: ${JSON.stringify(result.requiredVersion)}`);
      return false;
    
    case 'migrate':
      console.warn(`Migration required: ${result.requiredMigrations}`);
      return false;
    
    case 'reject':
      console.warn(`Incompatible version, rejecting peer`);
      return false;
  }
}
```

### Version Request

```http
GET /internal/version

Response:
{
  "major": 1,
  "minor": 0,
  "patch": 0,
  "schema": 3,
  "protocol": 1,
  "node_id": "node_abc",
  "uptime_seconds": 86400
}
```

### Migration Status

```http
GET /internal/migrations

Response:
{
  "current_schema": 3,
  "available_migrations": [
    {
      "id": "mig_003_to_004",
      "from_schema": 3,
      "to_schema": 4,
      "description": "Add checkpoint_signatures table"
    }
  ],
  "applied_migrations": [
    {
      "id": "mig_001_to_002",
      "applied_at": "2026-03-20T10:00:00Z"
    },
    {
      "id": "mig_002_to_003",
      "applied_at": "2026-03-22T14:30:00Z"
    }
  ]
}
```

---

## Upgrade Process

### Upgrade Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Version Upgrade                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Announce Upgrade                                        │
│     ┌──────────────┐                                       │
│     │   Broadcast  │  "Upgrading to v2.0.0 at block N"     │
│     │   Intent     │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  2. Wait for Checkpoint                                     │
│     ┌──────────────┐                                       │
│     │   Create     │  Ensure clean checkpoint before       │
│     │   Checkpoint │  migration                            │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  3. Execute Migration                                       │
│     ┌──────────────┐                                       │
│     │   Run        │  Apply database migrations            │
│     │   Migrations │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  4. Restart Services                                        │
│     ┌──────────────┐                                       │
│     │   Reload     │  Restart with new code                │
│     │   Node       │                                       │
│     └──────┬───────┘                                       │
│            │                                                │
│            ▼                                                │
│  5. Verify & Announce                                       │
│     ┌──────────────┐                                       │
│     │   Verify     │  Check health, announce new version   │
│     │   & Announce │                                       │
│     └──────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Coordinated Upgrade

For network-wide upgrades:

```typescript
interface UpgradeCoordinator {
  // Propose upgrade
  proposeUpgrade(version: Version, targetCheckpoint: number): Promise<void>;
  
  // Vote for upgrade
  voteForUpgrade(upgradeId: string): Promise<void>;
  
  // Check upgrade quorum
  checkUpgradeQuorum(upgradeId: string): Promise<boolean>;
  
  // Execute coordinated upgrade
  executeCoordinatedUpgrade(upgradeId: string): Promise<void>;
}
```

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `version.major` | Gauge | Current major version |
| `version.schema` | Gauge | Current schema version |
| `migration.count` | Counter | Migrations executed |
| `migration.duration_ms` | Histogram | Migration time |
| `version.incompatibility` | Counter | Incompatible peer connections |

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Migration fails | Rollback, restore backup |
| Backup fails | Abort migration, alert admin |
| Incompatible peer | Reject connection, log warning |
| Missing migration | Alert admin, provide manual script |

---

## Configuration

### Environment Variables

```bash
# Version configuration
VERSION_MAJOR=1
VERSION_MINOR=0
VERSION_PATCH=0
SCHEMA_VERSION=3
PROTOCOL_VERSION=1

# Migration configuration
MIGRATION_AUTO_APPLY=false
MIGRATION_BACKUP_DIR=/var/lib/clawish/backups
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Database Module | Schema migrations |
| Checkpoint Module | Clean upgrade points |
| Peer Discovery | Version exchange |

---

## Testing Strategy

### Unit Tests

```typescript
describe('VersionManagementService', () => {
  it('compares versions correctly', () => {});
  it('detects incompatible versions', () => {});
  it('executes migration', () => {});
  it('rolls back failed migration', () => {});
  it('negotiates protocol version', () => {});
});
```

### Integration Tests

```typescript
describe('Version Integration', () => {
  it('upgrades node with migration', () => {});
  it('handles mixed version network', () => {});
  it('coordinates network-wide upgrade', () => {});
});
```

---

*Created by Arche — March 24, 2026*
