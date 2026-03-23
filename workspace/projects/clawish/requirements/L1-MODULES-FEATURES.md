# L1 Modules & Features

**Last Updated:** March 23, 2026, 11:48 AM

---

## Overview

This document maps product requirements to modules and features.

**Total: 10 modules, 38 features**

---

## Module 1: Identity Module

**Purpose:** Manage Claw identities
**Location:** `routes/clawfiles.ts`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-1.1 | Identity Creation | PR-001.1 to 001.6 | ✅ Done |
| F-1.2 | Signature Verification | PR-002.1 to 002.5 | ✅ Done |
| F-1.3 | Identity Updates | PR-003.1 to 003.5 | ✅ Done |
| F-1.4 | Identity History | PR-004.1 to 004.5 | ✅ Done |
| F-1.5 | Key Rotation | PR-002.3 to 002.5 | ✅ Done |
| F-1.6 | Identity Lookup | PR-009.1 to 009.5 | ✅ Done |

---

## Module 2: App Module

**Purpose:** L2 app registration and authentication
**Location:** `routes/apps.ts`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-2.1 | App Registration | PR-007.1 to 007.5 | ✅ Done |
| F-2.2 | App Authentication | PR-008.1 to 008.5 | ✅ Done |
| F-2.3 | App Archive | PR-007.4 | ✅ Done |

---

## Module 3: Node Module

**Purpose:** L1 node registry and health
**Location:** `routes/nodes.ts`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-3.1 | Node Registration | PR-010.1 to 010.5 | ✅ Done |
| F-3.2 | Node Heartbeat | SOP-007 | ✅ Done |
| F-3.3 | Node Metrics | PR-010.3 | ✅ Done |
| F-3.4 | Node Status Management | PR-010.4 | ✅ Done |

---

## Module 4: Ledger Module

**Purpose:** Immutable audit trail
**Location:** `db/schema.sql`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-4.1 | Entry Append | PR-004.1, 004.2 | ✅ Done |
| F-4.2 | Hash Chain | PR-004.3 | ✅ Done |
| F-4.3 | Entry Query | PR-004.4 | ✅ Done |
| F-4.4 | Archive-Only Policy | PR-003.4, 004.5 | ✅ Done |
| F-4.5 | Journal Batching | PR-011.2 | ❌ Missing |
| F-4.6 | Journal Tables | PR-011.2, 011.3 | ❌ Missing |

---

## Module 5: Checkpoint Module

**Purpose:** ILC consensus and multi-node coordination
**Location:** ❌ Not implemented

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-5.1 | Journal Aggregation | PR-011.3 | ❌ Missing |
| F-5.2 | Merkle Tree | PR-006.4, 012.3 | ❌ Missing |
| F-5.3 | Checkpoint Creation | PR-006.3, 012.1, 012.4 | ❌ Missing |
| F-5.4 | Quorum Signatures | PR-006.5, 012.2 | ❌ Missing |
| F-5.5 | Checkpoint Verification | PR-006.6 | ❌ Missing |
| F-5.6 | Version Management | PR-012.5 | ❌ Missing |

---

## Module 6: Sync Module

**Purpose:** Cross-node data synchronization
**Location:** ❌ Not implemented

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-6.1 | Entry Sync | PR-011.1, 011.4 | ❌ Missing |
| F-6.2 | Journal Exchange | PR-011.3 | ❌ Missing |
| F-6.3 | Conflict Resolution | PR-011.5 | ❌ Missing |
| F-6.4 | Peer Discovery | SOP-009 step 1 | ❌ Missing |

---

## Module 7: Auth Module

**Purpose:** API key and signature authentication
**Location:** `middleware/auth.ts`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-7.1 | API Key Auth | PR-008.1 to 008.4 | ✅ Done |
| F-7.2 | Signature Auth | PR-002.1, 002.2 | ✅ Done |
| F-7.3 | Timestamp Validation | PR-008.5 | ✅ Done |
| F-7.4 | Rate Limiting | PR-009.5 | ✅ Done |

---

## Module 8: Crypto Module

**Purpose:** Cryptographic utilities
**Location:** `utils/crypto.ts`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-8.1 | Ed25519 Verification | PR-002.1 | ✅ Done |
| F-8.2 | SHA256 Hashing | PR-004.2 | ✅ Done |
| F-8.3 | State Hash | PR-003.5 | ✅ Done |
| F-8.4 | Merkle Tree | PR-006.4, 012.3 | ❌ Missing |

---

## Module 9: Database Module

**Purpose:** Data persistence
**Location:** `db/`

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-9.1 | SQLite Adapter | PR-008.1 (L1) | ✅ Done |
| F-9.2 | D1 Adapter | PR-008.2 | ✅ Done |
| F-9.3 | Schema Migration | PR-012.5 | ✅ Done |

---

## Module 10: Email Module

**Purpose:** Email delivery
**Location:** Moved to L2 Emerge

| Feature ID | Feature Name | Product Requirements | Status |
|------------|--------------|---------------------|--------|
| F-10.1 | Recovery Email | PR-005.1 to 005.4 | 🔄 L2 |
| F-10.2 | Verification Email | PR-013.1 to 013.5 | 🔄 L2 |

---

## Summary

| Module | Features | Done | Missing |
|--------|----------|------|---------|
| 1. Identity | 6 | 6 ✅ | 0 |
| 2. App | 3 | 3 ✅ | 0 |
| 3. Node | 4 | 4 ✅ | 0 |
| 4. Ledger | 6 | 4 ✅ | 2 ❌ |
| 5. Checkpoint | 6 | 0 | 6 ❌ |
| 6. Sync | 4 | 0 | 4 ❌ |
| 7. Auth | 4 | 4 ✅ | 0 |
| 8. Crypto | 4 | 3 ✅ | 1 ❌ |
| 9. Database | 3 | 3 ✅ | 0 |
| 10. Email | 2 | 0 | 🔄 L2 |
| **Total** | **38** | **27** ✅ | **13** ❌ |

---

## Missing Features (Need Implementation)

| Feature ID | Feature Name | Module | Priority |
|------------|--------------|--------|----------|
| F-4.5 | Journal Batching | Ledger | 🔴 High |
| F-4.6 | Journal Tables | Ledger | 🔴 High |
| F-5.1 | Journal Aggregation | Checkpoint | 🔴 High |
| F-5.2 | Merkle Tree | Checkpoint | 🔴 High |
| F-5.3 | Checkpoint Creation | Checkpoint | 🔴 High |
| F-5.4 | Quorum Signatures | Checkpoint | 🔴 High |
| F-5.5 | Checkpoint Verification | Checkpoint | 🔴 High |
| F-5.6 | Version Management | Checkpoint | 🟡 Medium |
| F-6.1 | Entry Sync | Sync | 🔴 High |
| F-6.2 | Journal Exchange | Sync | 🔴 High |
| F-6.3 | Conflict Resolution | Sync | 🟡 Medium |
| F-6.4 | Peer Discovery | Sync | 🟡 Medium |
| F-8.4 | Merkle Tree (Crypto) | Crypto | 🔴 High |

---

## Implementation Order

**Phase 1: Foundation**
1. F-4.6 Journal Tables (database schema)
2. F-8.4 Merkle Tree (crypto utility)

**Phase 2: Checkpoint**
3. F-4.5 Journal Batching
4. F-5.2 Merkle Tree (checkpoint integration)
5. F-5.3 Checkpoint Creation
6. F-5.4 Quorum Signatures

**Phase 3: Sync**
7. F-6.4 Peer Discovery
8. F-6.1 Entry Sync
9. F-6.2 Journal Exchange
10. F-6.3 Conflict Resolution

---

*Updated by Arche — March 23, 2026*
