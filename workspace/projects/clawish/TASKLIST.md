# Clawish L1 Tasklist

**Last Updated:** March 23, 2026, 8:55 AM

---

## L1 Server Overview

**Location:** `~/clawish-l1-node/`
**Status:** MVP feature-complete, needs architecture review

---

## 1. L1 Processes

L1 server handles **5 core processes**:

| # | Process | Description | Status |
|---|---------|-------------|--------|
| 1 | Identity Management | Register, lookup, key rotation, verification | ✅ Implemented |
| 2 | App Registry | L2 app registration, API key management | ✅ Implemented |
| 3 | Node Registry | L1 node registration, heartbeat, metrics | ✅ Implemented |
| 4 | Ledger Operations | Entry append, hash chain, query history | ✅ Implemented |
| 5 | Checkpoint Consensus | ILC protocol, merkle trees, multi-node sync | ❌ Not implemented |

---

## 2. L1 Modules

### Core Modules (7)

| # | Module | Location | Purpose |
|---|--------|----------|---------|
| 1 | Identity | `routes/clawfiles.ts` | Identity CRUD, key management |
| 2 | App | `routes/apps.ts` | L2 app registry |
| 3 | Node | `routes/nodes.ts` | L1 node registry |
| 4 | Ledger | `db/schema.sql` | Entry tables, hash chains |
| 5 | Checkpoint | ❌ Missing | ILC consensus, merkle trees |
| 6 | Auth | `middleware/auth.ts` | API key, signature verification |
| 7 | Crypto | `utils/crypto.ts` | Ed25519, hashing utilities |

### Infrastructure Modules (2)

| # | Module | Location | Purpose |
|---|--------|----------|---------|
| 8 | Database | `db/` | SQLite/D1 adapters, schema |
| 9 | Email | `utils/email.ts` | Resend/SendGrid/log providers |

---

## 3. Module Functions

### Module 1: Identity (`routes/clawfiles.ts`)

| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| Register identity | POST | `/identities` | ✅ |
| Lookup identity | GET | `/identities/:id` | ✅ |
| Get all keys | GET | `/identities/:id/keys` | ✅ |
| Get ledger history | GET | `/identities/:id/ledger` | ✅ |
| Rotate key | POST | `/identities/:id/rotate-key` | ✅ |
| Request parent verification | POST | `/verify-parent/request` | ✅ |
| Confirm parent verification | POST | `/verify-parent/confirm` | ✅ |
| Request recovery | POST | `/recover/request` | ✅ |

### Module 2: App (`routes/apps.ts`)

| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| Register app | POST | `/apps` | ✅ |
| List apps | GET | `/apps` | ✅ |
| Get app | GET | `/apps/:id` | ✅ |
| Archive app | DELETE | `/apps/:id` | ✅ |

### Module 3: Node (`routes/nodes.ts`)

| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| Register node | POST | `/nodes/register` | ✅ |
| List nodes | GET | `/nodes` | ✅ |
| Get node | GET | `/nodes/:id` | ✅ |
| Heartbeat | POST | `/nodes/:id/heartbeat` | ✅ |
| Get metrics | GET | `/nodes/:id/metrics` | ✅ |

### Module 4: Ledger (Database)

| Table | Purpose | Status |
|-------|---------|--------|
| `identities` | Identity snapshots | ✅ |
| `identity_keys` | Multi-key support | ✅ |
| `identity_entries` | Identity audit trail | ✅ |
| `identity_journals` | Batch before checkpoint | ❌ Missing |
| `apps` | L2 app registry | ✅ |
| `app_entries` | App audit trail | ✅ |
| `app_journals` | Batch before checkpoint | ❌ Missing |
| `nodes` | L1 node registry | ✅ |
| `node_entries` | Node audit trail | ✅ |
| `node_journals` | Batch before checkpoint | ❌ Missing |
| `checkpoints` | Finalized state | ❌ Missing |

### Module 5: Checkpoint (Missing)

| Function | Description | Status |
|----------|-------------|--------|
| ILC Consensus | Multi-writer coordination | ❌ TODO |
| Merkle Tree | RFC 9162 CCT format | ❌ TODO |
| Journal Batching | Collect entries into journals | ❌ TODO |
| Checkpoint Creation | Combine journals, compute roots | ❌ TODO |
| Signature Collection | Writer quorum signatures | ❌ TODO |

### Module 6: Auth (`middleware/auth.ts`)

| Function | Description | Status |
|----------|-------------|--------|
| API key validation | Bearer token for L2 apps | ✅ |
| Timestamp validation | ±5 minute drift | ✅ |
| Request ID | For debugging | ✅ |
| Signature verification | Ed25519 on requests | ❓ Need review |

### Module 7: Crypto (`utils/crypto.ts`)

| Function | Description | Status |
|----------|-------------|--------|
| `verifySignature()` | Ed25519 verification | ✅ |
| `sha256()` | Hash function | ✅ |
| `computeStateHash()` | Identity state hash | ✅ |
| `computeLedgerHash()` | Ledger entry hash | ✅ |
| Merkle tree | RFC 9162 CCT | ❌ Missing |

---

## 4. Discussion Schedule

### Phase 1: Review Current Implementation (Today)

| # | Topic | Time | Notes |
|---|-------|------|-------|
| 1.1 | Identity endpoints review | 15 min | Flow, validation, error handling |
| 1.2 | Auth middleware review | 10 min | API key flow, signature verification |
| 1.3 | Rate limiting review | 5 min | Limits, headers, storage |
| 1.4 | Database schema review | 15 min | Current tables vs new design |

### Phase 2: Design Missing Modules (This Week)

| # | Topic | Time | Notes |
|---|-------|------|-------|
| 2.1 | Journal tables design | 20 min | identity_journals, app_journals, node_journals |
| 2.2 | Checkpoints table design | 20 min | Fields, indices, relationships |
| 2.3 | ILC consensus implementation | 30 min | Multi-writer, merkle, signatures |

### Phase 3: Integration (Next Week)

| # | Topic | Time | Notes |
|---|-------|------|-------|
| 3.1 | Journal batching logic | 30 min | Entry → Journal → Checkpoint flow |
| 3.2 | Merkle tree implementation | 30 min | RFC 9162 CCT format |
| 3.3 | Checkpoint creation | 30 min | Combine registries, compute roots |
| 3.4 | End-to-end testing | 30 min | Full flow validation |

---

## 5. Current Blockers

| Blocker | Resolution |
|---------|------------|
| Journal tables missing | Discuss 2.1 |
| Checkpoints table missing | Discuss 2.2 |
| ILC consensus not implemented | Discuss 2.3 |
| Merkle tree utilities missing | Discuss 3.2 |

---

## 6. Summary

**What's Done:**
- ✅ Identity, App, Node CRUD endpoints
- ✅ Auth middleware, rate limiting
- ✅ Email service (Resend/SendGrid)
- ✅ Database adapters (SQLite/D1)
- ✅ Crypto utilities (Ed25519, hashing)

**What's Missing:**
- ❌ Journal tables (3 tables)
- ❌ Checkpoints table
- ❌ ILC consensus protocol
- ❌ Merkle tree utilities
- ❌ Checkpoint creation logic

**Next:** Start Phase 1 discussion with 爸爸

---

*Updated by Arche — March 23, 2026*
