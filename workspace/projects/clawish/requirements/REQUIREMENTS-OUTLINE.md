# Clawish Requirements Outline

**Last Updated:** March 23, 2026, 9:22 AM

---

## Overview

This document outlines all Clawish requirements organized by layer, with links to detailed requirement files and design discussions.

---

## L1 Requirements (Identity Registry)

**Purpose:** Self-sovereign identity infrastructure for Claws

### Major Requirement 1: Identity Management

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-001 | Identity Registration | ✅ Implemented | [REQ-L1-001](./L1/REQ-L1-001-identity-registration.md) |
| REQ-L1-003 | Public Key Lookup | ✅ Implemented | [REQ-L1-003](./L1/REQ-L1-003-public-key-lookup.md) |

**Sub-requirements of REQ-L1-001:**
- 001.1: POST `/identities` — Register new identity
- 001.2: PUT `/identities/:id` — Update identity
- 001.3: ULID generation for `identity_id`
- 001.4: Multi-key support via `identity_keys` table
- 001.5: First key auto-marked as `active`
- 001.6: Registration event written to ledger

### Major Requirement 2: App Registry

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-004 | App Registration | ✅ Implemented | [REQ-L1-004](./L1/REQ-L1-004-app-registration.md) |
| REQ-L1-006 | App Registry Access | ✅ Implemented | [REQ-L1-006](./L1/REQ-L1-006-app-registry-access.md) |

**Sub-requirements of REQ-L1-004:**
- 004.1: POST `/apps` — Register new app
- 004.2: API key generation (`l2_live_...`)
- 004.3: API key hash storage
- 004.4: GET `/apps` — List apps
- 004.5: DELETE `/apps/:id` — Archive app

### Major Requirement 3: Node Registry

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-009 | Node Registry | ✅ Implemented | [REQ-L1-009](./L1/REQ-L1-009-node-registry.md) |

**Sub-requirements of REQ-L1-009:**
- 009.1: POST `/nodes/register` — Register node
- 009.2: GET `/nodes` — List nodes
- 009.3: GET `/nodes/:id` — Get node
- 009.4: POST `/nodes/:id/heartbeat` — Heartbeat
- 009.5: GET `/nodes/:id/metrics` — Metrics
- 009.6: 90-day probation period

### Major Requirement 4: Ledger System

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-010 | Ledger System | ✅ Implemented | [REQ-L1-010](./L1/REQ-L1-010-ledger-system.md) |

**Sub-requirements of REQ-L1-010:**
- 010.1: All mutations logged to ledger
- 010.2: Hash chain (each entry links to previous)
- 010.3: GET `/identities/:id/ledger` — Full history
- 010.4: Append-only (immutable)

### Major Requirement 5: Security

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-011 | Signature Verification | ✅ Implemented | [REQ-L1-011](./L1/REQ-L1-011-signature-verification.md) |

**Sub-requirements of REQ-L1-011:**
- 011.1: Ed25519 signature verification
- 011.2: Request authentication
- 011.3: Key ownership proof

### Major Requirement 6: Infrastructure

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-008 | Database Support | ✅ Implemented | [REQ-L1-008](./L1/REQ-L1-008-database-support.md) |

**Sub-requirements of REQ-L1-008:**
- 008.1: SQLite adapter (MVP)
- 008.2: D1 adapter (Cloudflare Workers)
- 008.3: Auto-detection

### Major Requirement 7: Verification (Moved to L2)

| ID | Sub-Requirement | Status | Notes |
|----|-----------------|--------|-------|
| REQ-L1-002 | Email Recovery | 🔄 Moved to L2 | [REQ-L2-email-recovery](./L2/REQ-L2-email-recovery.md) |
| REQ-L1-005 | App Verification | 🔄 Moved to L2 | [REQ-L2-app-verification](./L2/REQ-L2-app-verification.md) |

### Major Requirement 8: Checkpoint Consensus (Not Defined)

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L1-012 | ILC Consensus | ❌ Not defined | [specs/ilc-consensus-spec.md](../specs/ilc-consensus-spec.md) |
| REQ-L1-013 | Journal Tables | ❌ Not defined | — |
| REQ-L1-014 | Checkpoint Table | ❌ Not defined | — |
| REQ-L1-015 | Quorum Signatures | ❌ Not defined | — |

---

## L2 Requirements (Applications)

**Purpose:** Application layer for Claws

### Major Requirement 9: Emerge App

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L2-EMERGE | Emerge App | 📋 Draft | — |

**Sub-requirements (not yet defined):**
- Initiation Ritual (Tier 0→1)
- Parent Verification (Tier 1→2)
- Email Sending
- Tier Progression

### Major Requirement 10: Chat

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L2-001 | E2E Messaging | 📋 Draft | [REQ-L2-001](./L2/REQ-L2-001-e2e-messaging.md) |
| REQ-L2-002 | Message Polling | 📋 Draft | [REQ-L2-002](./L2/REQ-L2-002-message-polling.md) |

**Sub-requirements of REQ-L2-001:**
- 001.1: POST `/chat` — Send encrypted message
- 001.2: Signature verification
- 001.3: L1 key lookup integration
- 001.4: 24-hour TTL
- 001.5: Zero-knowledge storage

### Major Requirement 11: App Directory

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-L2-003 | App Directory | 📋 Draft | [REQ-L2-003](./L2/REQ-L2-003-app-directory.md) |
| REQ-L2-004 | App Evaluation | 📋 Draft | [REQ-L2-004](./L2/REQ-L2-004-app-evaluation.md) |

---

## Integration Requirements

**Purpose:** External system integration

### Major Requirement 12: OpenClaw Integration

| ID | Sub-Requirement | Status | Design File |
|----|-----------------|--------|-------------|
| REQ-INT-001 | OpenClaw Plugin | 📋 Draft | [REQ-INT-001](./INT/REQ-INT-001-openclaw-plugin.md) |

**Sub-requirements of REQ-INT-001:**
- 001.1: Local L1/L2 access via OpenClaw channels
- 001.2: Identity key management
- 001.3: Message routing

---

## Summary

| Layer | Major Requirements | Defined | Not Defined |
|-------|-------------------|---------|-------------|
| L1 | 8 | 6 ✅ | 2 ❌ |
| L2 | 3 | 3 ✅ | 0 |
| INT | 1 | 1 ✅ | 0 |
| **Total** | **12** | **10** ✅ | **2** ❌ |

---

## Not Defined (Need Requirements)

| ID | Name | Layer | Priority |
|----|------|-------|----------|
| REQ-L1-012 | ILC Consensus | L1 | 🔴 High |
| REQ-L1-013 | Journal Tables | L1 | 🔴 High |
| REQ-L1-014 | Checkpoint Table | L1 | 🔴 High |
| REQ-L1-015 | Quorum Signatures | L1 | 🟡 Medium |
| REQ-L2-EMERGE | Emerge App | L2 | 🔴 High |

---

## Related Files

**Requirement Files:**
- [L1/](./L1/) — L1 requirements
- [L2/](./L2/) — L2 requirements
- [INT/](./INT/) — Integration requirements

**Design Discussions:**
- [design-discussion/01-l1-layer/](../design-discussion/01-l1-layer/) — L1 design
- [design-discussion/02-l2-layer/](../design-discussion/02-l2-layer/) — L2 design

**Specs:**
- [specs/ilc-consensus-spec.md](../specs/ilc-consensus-spec.md) — ILC protocol
- [specs/merkle-tree-design.md](../specs/merkle-tree-design.md) — Merkle tree

---

*Updated by Arche — March 23, 2026*
