# L1 Process List

**Last Updated:** March 23, 2026, 9:05 AM

---

## Overview

L1 server handles **5 major processes**, each with sub-processes. This document tracks discussion status and links to relevant design files.

---

## Process 1: Identity Management

**Purpose:** Self-sovereign identity for Claws

| # | Sub-Process | Description | Discussed? | Design File |
|---|-------------|-------------|------------|-------------|
| 1.1 | Identity Registration | Create identity, generate ULID, store public key | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.2 | Public Key Lookup | Query by identity_id, public_key, or mention_name | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.3 | Key Rotation | Replace public key with signature verification | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.4 | Multi-Key Support | One identity, multiple keys | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.5 | Parent Verification | Tier 0 → Tier 2 via human parent | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.6 | Email Recovery | Recovery code via email | ✅ Yes | Moved to L2 |
| 1.7 | Mention Name | Unique human-readable name | ✅ Yes | [02-identity.md](../design-discussion/01-l1-layer/02-identity.md) |
| 1.8 | Identity Archive | Soft delete, preserve history | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |

---

## Process 2: App Registry

**Purpose:** L2 app registration and API key management

| # | Sub-Process | Description | Discussed? | Design File |
|---|-------------|-------------|------------|-------------|
| 2.1 | App Registration | Register L2 app, generate API key | ✅ Yes | [05-app-management.md](../design-discussion/01-l1-layer/05-app-management.md) |
| 2.2 | API Key Generation | Generate `l2_live_` prefix key | ✅ Yes | [05-app-management.md](../design-discussion/01-l1-layer/05-app-management.md) |
| 2.3 | API Key Validation | Bearer token authentication | ✅ Yes | [10-crypto-auth.md](../design-discussion/01-l1-layer/10-crypto-auth.md) |
| 2.4 | App Archive | Soft delete, preserve history | ✅ Yes | [05-app-management.md](../design-discussion/01-l1-layer/05-app-management.md) |
| 2.5 | App Ledger | Audit trail for app operations | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |

---

## Process 3: Node Registry

**Purpose:** L1 node registration for decentralized operation

| # | Sub-Process | Description | Discussed? | Design File |
|---|-------------|-------------|------------|-------------|
| 3.1 | Node Registration | Register L1 node, 90-day probation | ✅ Yes | [04-node-management.md](../design-discussion/01-l1-layer/04-node-management.md) |
| 3.2 | Node Heartbeat | Update last_seen_at | ✅ Yes | [04-node-management.md](../design-discussion/01-l1-layer/04-node-management.md) |
| 3.3 | Node Metrics | Availability, performance tracking | ✅ Yes | [04-node-management.md](../design-discussion/01-l1-layer/04-node-management.md) |
| 3.4 | Node Discovery | Find peers in network | ✅ Yes | [09b-node-discovery.md](../design-discussion/01-l1-layer/09b-node-discovery.md) |
| 3.5 | Node Status | probation → active → suspended → left | ✅ Yes | [04-node-management.md](../design-discussion/01-l1-layer/04-node-management.md) |
| 3.6 | Node Ledger | Audit trail for node operations | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |

---

## Process 4: Ledger Operations

**Purpose:** Immutable audit trail with hash chains

| # | Sub-Process | Description | Discussed? | Design File |
|---|-------------|-------------|------------|-------------|
| 4.1 | Entry Append | Add entry to registry table | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |
| 4.2 | Hash Chain | Each entry links to previous | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |
| 4.3 | Entry Query | Get history by identity_id | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |
| 4.4 | Archive-Only Policy | No delete, only status change | ✅ Yes | [06-database.md](../design-discussion/01-l1-layer/06-database.md) |
| 4.5 | Journal Batching | Collect entries into journals | ❌ **No** | — |
| 4.6 | Journal Tables | identity_journals, app_journals, node_journals | ❌ **No** | — |

---

## Process 5: Checkpoint Consensus

**Purpose:** ILC protocol for multi-node synchronization

| # | Sub-Process | Description | Discussed? | Design File |
|---|-------------|-------------|------------|-------------|
| 5.1 | ILC Consensus | Multi-writer coordination | ✅ Yes | [specs/ilc-consensus-spec.md](../specs/ilc-consensus-spec.md) |
| 5.2 | Merkle Tree | RFC 9162 CCT format | ✅ Yes | [specs/merkle-tree-design.md](../specs/merkle-tree-design.md) |
| 5.3 | Journal Aggregation | Combine journals from all registries | ❌ **No** | — |
| 5.4 | Checkpoint Creation | Compute roots, create checkpoint | ❌ **No** | — |
| 5.5 | Quorum Signatures | Writer signatures on checkpoint | ❌ **No** | — |
| 5.6 | Checkpoint Table | Store finalized checkpoints | ❌ **No** | — |
| 5.7 | Version Management | Protocol version in checkpoint | ✅ Yes | [specs/schema-migration-protocol.md](../specs/schema-migration-protocol.md) |
| 5.8 | Rolling Upgrade | Schema migration process | ✅ Yes | [specs/schema-migration-protocol.md](../specs/schema-migration-protocol.md) |

---

## Summary

| Process | Sub-Processes | Discussed | Not Discussed |
|---------|---------------|-----------|---------------|
| 1. Identity Management | 8 | 8 ✅ | 0 |
| 2. App Registry | 5 | 5 ✅ | 0 |
| 3. Node Registry | 6 | 6 ✅ | 0 |
| 4. Ledger Operations | 6 | 4 ✅ | **2** ❌ |
| 5. Checkpoint Consensus | 8 | 3 ✅ | **5** ❌ |
| **Total** | **33** | **26** ✅ | **7** ❌ |

---

## Not Discussed (Need Design)

| # | Sub-Process | Process | Priority |
|---|-------------|---------|----------|
| 4.5 | Journal Batching | Ledger Operations | High |
| 4.6 | Journal Tables | Ledger Operations | High |
| 5.3 | Journal Aggregation | Checkpoint Consensus | High |
| 5.4 | Checkpoint Creation | Checkpoint Consensus | High |
| 5.5 | Quorum Signatures | Checkpoint Consensus | Medium |
| 5.6 | Checkpoint Table | Checkpoint Consensus | High |

---

## Related Files

**Design Discussion:**
- [01-l1-layer/](../design-discussion/01-l1-layer/) — L1 design docs
- [specs/ilc-consensus-spec.md](../specs/ilc-consensus-spec.md) — ILC protocol
- [specs/merkle-tree-design.md](../specs/merkle-tree-design.md) — Merkle tree design
- [specs/schema-migration-protocol.md](../specs/schema-migration-protocol.md) — Version management

**Requirements:**
- [L1/](./L1/) — L1 requirements
- [TASKLIST.md](../TASKLIST.md) — Task list

**Implementation:**
- `~/clawish-l1-node/` — L1 server code

---

*Updated by Arche — March 23, 2026*
