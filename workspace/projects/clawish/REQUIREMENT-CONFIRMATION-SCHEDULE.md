# Requirement Confirmation Schedule

**Created:** March 20, 2026, 8:40 AM
**Purpose:** Track what's been confirmed with 爸爸 vs what needs discussion

---

## ✅ Confirmed with 爸爸

### Architecture Decisions
| Item | Status | Notes |
|------|--------|-------|
| Initiation ritual location | ✅ Decided | L2 Emerge handles ritual, L1 just updates tier |
| Parent verification location | ✅ Decided | L2 Emerge handles email flow, L1 just updates tier |
| L1 role in verification | ✅ Decided | Passive — receives tier updates from L2 |
| L1 update endpoint | ✅ Decided | Single `PUT /identities/{id}` for all updates |
| Email verification routes | ✅ Decided | Move to L2 Emerge (not on L1) |
| Three L1 registries | ✅ Decided | Identity Registry, Node Registry, App Registry — all needed |
| Layered Merkle tree | ✅ Decided | H_checkpoint = hash(H_identity \|\| H_ledger \|\| H_app) |
| apps/nodes tables | ✅ Decided | Part of L1 registries, NOT optional |
| checkpoints table | ✅ Decided | Added to schema.sql |
| Tier system location | ✅ Decided | L2 Emerge handles tier progression, L1 just stores tier value |
| Covenant Storage | ✅ Decided | **Removed from L1** — passing verification = agreed. L2 Emerge shows policy/covenant in registration flow |

### Database Schema (Mar 19-20)
| Item | Status | Notes |
|------|--------|-------|
| clawfiles table | ✅ Finalized | 7 fields: identity_id, mention_name, tier, status, state_hash, metadata, updated_at |
| identity_keys table | ✅ Finalized | 5 fields: id, identity_id, public_key, status, metadata |
| ledgers table | ✅ Finalized | 5 fields: id, identity_id, hash, prev_hash, metadata |
| Structured vs Metadata rule | ✅ Finalized | Structured = indexable, Metadata = everything else |
| Hash specifications | ✅ Finalized | Two-level: state_hash (clawfiles) + hash (ledgers) |
| Rate limiting | ✅ Finalized | 3 times/day for all fields |

### Project Setup
| Item | Status | Notes |
|------|--------|-------|
| Project name | ✅ Decided | clawish-l1-node |
| Project location | ✅ Decided | ~/clawish-l1-node/ |
| Database | ✅ Decided | SQLite (with D1 adapter for Cloudflare) |
| Language | ✅ Decided | TypeScript |

---

## ❌ NOT Confirmed (Implemented Without Discussion)

**I built these without confirming with 爸爸:**
- apps table
- app_ledgers table
- nodes table
- node_ledgers table
- verification_codes table
- Identity routes (register, lookup, keys, ledger, rotate-key)
- Apps routes (register, list, get, archive)
- Nodes routes (register, list, get, heartbeat, metrics)
- Email verification routes
- Auth middleware
- Rate limiting middleware
- Deployment config

**These need review and confirmation.**

---

## 📋 Requirements Status

### L1 Server — Critical (MVP)

| ID | Name | Status | Discussed? | Notes |
|----|------|--------|-----------|-------|
| REQ-L1-001 | Identity Registration | discussed | ✅ Yes | L2 creates, L1 has `PUT /identities/:id` |
| REQ-L1-002 | Email Recovery | moved | ✅ Yes | Moved to L2 Emerge |
| REQ-L1-003 | Public Key Lookup | implemented | ✅ Yes | GET /identities/:id, /keys |
| REQ-L1-004 | App Registration | implemented | ✅ Partial | POST /apps exists, needs confirmation |
| REQ-L1-007 | Covenant Storage | removed | ✅ Yes | **Removed** — passing verification = agreed |
| REQ-L1-008 | Database Support | implemented | ✅ Yes | SQLite + D1 adapters |
| REQ-L1-010 | Ledger System | implemented | ✅ Yes | Schema confirmed |
| REQ-L1-011 | Signature Verification | implemented | ✅ Partial | crypto.ts exists, needs confirmation |

### L1 Server — Phase 2

| ID | Name | Status | Discussed? | Notes |
|----|------|--------|-----------|-------|
| REQ-L1-005 | App Verification | draft | ❌ No | Phase 2 |
| REQ-L1-006 | App Registry Access | draft | ❌ No | Phase 2 |
| REQ-L1-009 | Node Registry | draft | ❌ No | Phase 2 |

### L2 Application — Critical (MVP)

| ID | Name | Status | Discussed? | Notes |
|----|------|--------|-----------|-------|
| REQ-L2-001 | E2E Encrypted Messaging | draft | ❌ No | Need to discuss |
| REQ-L2-002 | Message Polling | draft | ❌ No | Need to discuss |

### Integration

| ID | Name | Status | Discussed? | Notes |
|----|------|--------|-----------|-------|
| REQ-INT-001 | OpenClaw Plugin | draft | ❌ No | Need to discuss |

---

## 📅 Proposed Discussion Order

### Phase 1: Core Identity (MVP)
1. **REQ-L1-001: Identity Registration**
   - What endpoints needed?
   - Tier 0 creation flow
   - Initiation ritual (Tier 0 → 1)?

2. **REQ-L1-003: Public Key Lookup**
   - Query by identity_id, public_key, mention_name?
   - What data returned?

3. **REQ-L1-011: Signature Verification**
   - Which endpoints require signatures?
   - Timestamp validation?

4. **REQ-L1-007: Covenant Storage**
   - Mandatory on registration?
   - Version tracking?

### Phase 2: Apps & Nodes
5. **REQ-L1-004: App Registration**
   - apps table design
   - API key generation
   - What metadata needed?

6. **REQ-L1-009: Node Registry** (Phase 2)
   - nodes table design
   - Probation period?

### Phase 3: Recovery
7. **REQ-L1-002: Email Recovery**
   - verification_codes table?
   - Email provider?
   - Recovery flow?

### Phase 4: L2 Applications
8. **REQ-L2-001 & REQ-L2-002: Messaging**
   - Emerge app architecture
   - E2E encryption approach

---

## 📝 Tables Not Yet Discussed

| Table | Status | Priority |
|-------|--------|----------|
| wallets | In spec, not discussed | Phase 2? |
| apps | I implemented, not discussed | MVP |
| app_ledgers | I implemented, not discussed | MVP |
| nodes | I implemented, not discussed | Phase 2 |
| node_ledgers | I implemented, not discussed | Phase 2 |
| verification_codes | I implemented, not discussed | MVP |

---

## 🎯 Next Steps

1. Review each requirement with 爸爸
2. Update status: draft → discussed → approved
3. Only implement after approval

---

*Created by Arche — March 20, 2026*
