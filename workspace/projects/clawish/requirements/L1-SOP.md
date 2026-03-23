# L1 Standard Operating Procedures (SOPs)

**Last Updated:** March 23, 2026, 5:20 PM

---

## Overview

This document defines step-by-step procedures for each L1 actor requirement.

**Total: 8 SOPs (all in Discussion phase)**

---

## Document Lifecycle

Every SOP goes through these stages:

| Stage | Meaning |
|-------|---------|
| 📋 Discussion | Draft being reviewed, not finalized |
| ✅ Approved | Stakeholders approved, ready to implement |
| 🔨 Implementing | Being coded |
| ✔️ Verified | Code exists and tested |
| ⚠️ Deprecated | No longer relevant |

**Current State:** All SOPs are in **📋 Discussion** phase. Nothing is approved or implemented yet.

---

## SOP-001: Identity Creation

**Actor:** Claw (via L2 Emerge)
**Trigger:** User wants to create a new identity
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/02-identity.md`

**Steps:**
1. User generates Ed25519 key pair locally
2. User sends public_key to L2 Emerge
3. L2 Emerge signs request with its registered public_key
4. L2 Emerge calls `POST /identities` to L1
5. L1 validates L2's signature and public_key
6. L1 generates ULID as identity_id
7. L1 stores identity with status "pending", tier: 0
8. L1 stores key in `identity_keys` table (status: active)
9. L1 writes creation event to `identity_entries` table
10. L1 returns identity_id to L2 Emerge
11. L2 Emerge stores identity locally (Tier 0)
12. L2 Emerge returns identity_id to user

**Tier Flow:**
- Tier 0: Identity created, stored on L2 only
- Tier 1: Email verified (L2), still on L2 only
- Tier 2: Parent verified → **Moved to L1**

**Note:** Mention_name NOT available at registration. Unlocks at higher tier.

**Outcome:** User has a Tier 0 identity stored on L2

**Error Cases:**
- Invalid public_key format → 400 Bad Request
- L2 not authorized → 401 Unauthorized

---

## SOP-002: Identity Ownership Proof

**Actor:** Claw, L2 Emerge
**Trigger:** User performs identity mutation (update, key rotation)
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/10-crypto-auth.md`

**Steps:**
1. User creates request payload (operation, data, timestamp)
2. User signs payload with private key
3. User sends request + signature to L2 Emerge
4. L2 queries L1 for user's active public_key
5. L2 verifies signature locally using Ed25519
6. If valid: L2 proceeds with operation
7. If invalid: L2 rejects with 401 error

**Outcome:** L2 verifies signature locally, only queries L1 for public_key lookup

**Error Cases:**
- Invalid signature → 401 Unauthorized
- No active key found → 404 Not Found
- Timestamp drift > 5 minutes → 400 Bad Request

---

## SOP-003: Key Rotation

**Actor:** Claw, L2 Emerge
**Trigger:** User wants to replace their key
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/02-identity.md`

**Steps:**
1. User generates new Ed25519 key pair
2. User creates rotation request with: new_public_key, timestamp
3. User signs request with OLD private key
4. User sends request to L2 Emerge
5. L2 verifies signature with current active key (from L1 lookup)
6. L2 requests L1 to update key
7. L1 marks old key as "rotated" in `identity_keys`
8. L1 inserts new key with status "active"
9. L1 writes rotation event to `identity_entries`
10. L1 returns success to L2
11. L2 returns success to user

**Outcome:** Identity has new active key, L2 is the intermediary

**Error Cases:**
- Invalid signature (wrong key) → 401 Unauthorized
- Same public_key → 400 Bad Request
- Rate limit exceeded → 429 Too Many Requests

---

## SOP-004: Identity Lookup

**Actor:** L2 App
**Trigger:** App needs to verify or display user identity
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/02-identity.md`

**Steps:**
1. L2 App calls `GET /identities/:id` with its registered public_key
2. L1 validates L2 App's public_key
3. L1 queries `identities` table by identity_id/public_key
4. L1 returns: identity_id, public_key, tier, status, metadata
5. L2 App uses data for authentication or display

**Outcome:** L2 App uses its public_key for authentication, not API key

**Error Cases:**
- Identity not found → 404 Not Found
- L2 App not authorized → 401 Unauthorized
- Rate limit exceeded → 429 Too Many Requests

---

## SOP-005: App Registration

**Actor:** L2 App Developer, L2 Emerge
**Trigger:** Developer wants to register a new L2 app
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/05-app-management.md`

**Steps:**
1. Developer sends registration request to L2 Emerge with: name, callback_url, metadata
2. L2 Emerge generates app_id (ULID)
3. L2 Emerge generates app key pair (Ed25519)
4. L2 Emerge requests L1 to register app
5. L1 stores app_id + public_key in `apps` table
6. L1 writes registration event to `app_entries`
7. L1 returns app_id to L2 Emerge
8. L2 Emerge returns app_id + private_key to developer (shown once only)
9. Developer saves private_key securely

**Outcome:** L2 registers app first, then stores on L1

**Error Cases:**
- Name already exists → 409 Conflict
- Invalid callback_url → 400 Bad Request

---

## SOP-006: Node Registration

**Actor:** L1 Node Operator, L2 Emerge
**Trigger:** Operator wants to add node to network
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/04-node-management.md`

**Steps:**
1. Operator requests node registration through L2 Emerge
2. L2 Emerge verifies operator identity
3. L2 Emerge requests L1 to register node
4. Operator generates node key pair
5. L1 stores node with: node_id, public_key, endpoint, status: "active"
6. L1 writes registration event to `node_entries`
7. Node becomes Query Node immediately

**Node Types:**
- Query Node: Can query L1 data (most nodes)
- Writer Node: Can propose checkpoints (merit-based promotion)

**Outcome:** L2 verifies first, then L1 stores node

**Error Cases:**
- node_id already exists → 409 Conflict
- Invalid endpoint format → 400 Bad Request

---

## SOP-007: REMOVED

**Stage:** ⚠️ Deprecated

**Reason:** No separate heartbeat needed. Nodes connect during checkpoint rounds (every 5 min). Metrics system is a separate requirement to discuss later.

---

## SOP-008: Checkpoint Creation

**Actor:** L1 Writer Node
**Trigger:** Fixed interval (every 5 minutes)
**Stage:** 📋 Discussion
**Discussion Doc:** `specs/ilc-consensus-spec.md`

**5 Stages:**

**Stage 1: Propose**
1. Writer collects all pending entries from identity/app/node journals
2. Writer creates checkpoint proposal with: round_number, entry_count, timestamp

**Stage 2: Prepare**
3. Writer computes merkle root for each registry (identity, app, node)
4. Writer creates merkle tree using RFC 9162 CCT format
5. Writer packages journals with merkle roots

**Stage 3: Commit**
6. Writer signs checkpoint with node private key
7. Writer broadcasts checkpoint to other Writer Nodes

**Stage 4: Finalize**
8. Other Writers verify signature and merkle roots
9. Writers add their signatures
10. Upon quorum (2/3+): checkpoint is finalized

**Stage 5: Broadcast**
11. Finalized checkpoint broadcast to all Query Nodes
12. All nodes store checkpoint in `checkpoints` table
13. Journal entries marked as "finalized"

**Outcome:** Network agrees on current state via ILC consensus

**Dependencies:**
- Journal tables (identity_journals, app_journals, node_journals)
- Checkpoints table
- Merkle tree utilities (RFC 9162 CCT)
- Quorum signature collection

---

## SOP-009: Cross-Node Sync

**Actor:** L1 Query Node
**Trigger:** Query Node receives new checkpoint or detects lag
**Stage:** 📋 Discussion
**Discussion Doc:** `design-discussion/01-l1-layer/08-multi-node-sync-protocol.md`

**Steps:**
1. Query Node detects it's behind (missing checkpoint or entries)
2. Query Node requests missing entries from Writer Node peer
3. Writer Node sends entries with hash chain
4. Query Node verifies hash chain integrity
5. Query Node appends entries to local journal
6. Query Node acknowledges sync complete

**Outcome:** Query Node catches up to current state

**Dependencies:**
- P2P communication layer
- Entry exchange protocol
- Conflict resolution rules

---

## Summary

| SOP | Actor | Stage | Discussion Doc |
|-----|-------|-------|----------------|
| 001 | Claw + L2 | 📋 Discussion | 02-identity.md |
| 002 | Claw + L2 | 📋 Discussion | 10-crypto-auth.md |
| 003 | Claw + L2 | 📋 Discussion | 02-identity.md |
| 004 | L2 App | 📋 Discussion | 02-identity.md |
| 005 | App Dev + L2 | 📋 Discussion | 05-app-management.md |
| 006 | Node Op + L2 | 📋 Discussion | 04-node-management.md |
| 007 | — | ⚠️ Deprecated | — |
| 008 | Writer Node | 📋 Discussion | ilc-consensus-spec.md |
| 009 | Query Node | 📋 Discussion | 08-multi-node-sync-protocol.md |

---

## File Location

All L1 documents are stored at:

```
/home/ubuntu/.openclaw/workspace/projects/clawish/
├── requirements/
│   └── L1-SOP.md           ← This document
├── design-discussion/
│   └── 01-l1-layer/
│       ├── 02-identity.md
│       ├── 04-node-management.md
│       ├── 05-app-management.md
│       ├── 08-multi-node-sync-protocol.md
│       └── 10-crypto-auth.md
└── specs/
    └── ilc-consensus-spec.md
```

---

*Updated by Arche — March 23, 2026*
