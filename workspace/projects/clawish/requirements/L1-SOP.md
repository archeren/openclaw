# L1 Standard Operating Procedures (SOPs)

**Last Updated:** March 23, 2026, 11:10 AM

---

## Overview

This document defines step-by-step procedures for each L1 actor requirement.

**Total: 9 SOPs (7 implemented, 2 not implemented)**

---

## SOP-001: Identity Creation

**Actor:** Claw (via L2 Emerge)
**Trigger:** User wants to create a new identity
**Status:** ✅ Implemented

**Steps:**
1. User generates Ed25519 key pair locally
2. User sends public_key + optional mention_name to L2 Emerge
3. L2 Emerge calls `POST /identities` with API key
4. L1 generates ULID as identity_id
5. L1 stores identity in `identities` table (status: pending, tier: 0)
6. L1 stores key in `identity_keys` table (status: active)
7. L1 writes creation event to `identity_entries` table
8. L1 returns identity_id to L2 Emerge
9. L2 Emerge returns identity_id to user

**Outcome:** User has a Tier 0 identity ready for verification

**Error Cases:**
- Mention_name already taken → 409 Conflict
- Invalid public_key format → 400 Bad Request
- Missing API key → 401 Unauthorized

---

## SOP-002: Identity Ownership Proof

**Actor:** Claw
**Trigger:** User performs identity mutation (update, key rotation)
**Status:** ✅ Implemented

**Steps:**
1. User creates request payload (operation, data, timestamp)
2. User signs payload with private key
3. User sends request + signature to L1 (via L2 app)
4. L1 looks up user's active public_key from `identity_keys`
5. L1 verifies signature using Ed25519
6. If valid: proceed with operation
7. If invalid: reject with 401 error

**Outcome:** Only key owner can mutate identity

**Error Cases:**
- Invalid signature → 401 Unauthorized
- No active key found → 404 Not Found
- Timestamp drift > 5 minutes → 400 Bad Request

---

## SOP-003: Key Rotation

**Actor:** Claw
**Trigger:** User wants to replace their key
**Status:** ✅ Implemented

**Steps:**
1. User generates new Ed25519 key pair
2. User creates rotation request with: new_public_key, timestamp
3. User signs request with OLD private key
4. L1 verifies signature with current active key
5. L1 marks old key as "rotated" in `identity_keys`
6. L1 inserts new key with status "active"
7. L1 writes rotation event to `identity_entries`
8. L1 returns success

**Outcome:** Identity has new active key, old key preserved in history

**Error Cases:**
- Invalid signature (wrong key) → 401 Unauthorized
- Same public_key → 400 Bad Request
- Rate limit exceeded → 429 Too Many Requests

---

## SOP-004: Identity Lookup

**Actor:** L2 App
**Trigger:** App needs to verify or display user identity
**Status:** ✅ Implemented

**Steps:**
1. App calls `GET /identities/:id` with API key
2. L1 validates API key
3. L1 queries `identities` table by identity_id/public_key/mention_name
4. L1 returns: identity_id, public_key, tier, status, metadata
5. App uses data for authentication or display

**Outcome:** App has verified identity information

**Error Cases:**
- Identity not found → 404 Not Found
- Invalid API key → 401 Unauthorized
- Rate limit exceeded → 429 Too Many Requests

---

## SOP-005: App Registration

**Actor:** L2 App Developer
**Trigger:** Developer wants to register a new L2 app
**Status:** ✅ Implemented

**Steps:**
1. Developer sends POST /apps with: name, callback_url, metadata
2. L1 generates app_id (ULID)
3. L1 generates API key: `l2_live_` + ULID
4. L1 stores API key hash in `apps` table
5. L1 writes registration event to `app_entries`
6. L1 returns app_id + API key (shown once only)
7. Developer saves API key securely

**Outcome:** App is registered and can authenticate to L1

**Error Cases:**
- Name already exists → 409 Conflict
- Invalid callback_url → 400 Bad Request

---

## SOP-006: Node Registration

**Actor:** L1 Node Operator
**Trigger:** Operator wants to add node to network
**Status:** ✅ Implemented

**Steps:**
1. Operator generates node key pair
2. Operator calls POST /nodes/register with: node_id, public_key, endpoint
3. L1 stores node with status "probation"
4. L1 sets probation_end_at = now + 90 days
5. L1 writes registration event to `node_entries`
6. Node starts sending heartbeats

**Outcome:** Node is registered, starts 90-day probation

**Error Cases:**
- node_id already exists → 409 Conflict
- Invalid endpoint format → 400 Bad Request

---

## SOP-007: Node Heartbeat

**Actor:** L1 Node
**Trigger:** Periodic (every 5 minutes)
**Status:** ✅ Implemented

**Steps:**
1. Node calls POST /nodes/:id/heartbeat
2. L1 updates last_seen_at timestamp
3. L1 calculates availability metrics
4. If probation period complete: transition to "active"

**Outcome:** Node is marked as alive and responsive

**Error Cases:**
- Node not found → 404 Not Found
- Node suspended → 403 Forbidden

---

## SOP-008: Checkpoint Creation

**Actor:** L1 Writer Node
**Trigger:** Fixed interval (e.g., every 5 minutes)
**Status:** ❌ Not Implemented

**Steps:**
1. Writer collects all pending entries from identity/app/node journals
2. Writer computes merkle root for each registry
3. Writer creates checkpoint with: round_number, merkle_roots, timestamp
4. Writer signs checkpoint with node private key
5. Writer broadcasts checkpoint to other nodes
6. Other nodes verify signature and merkle roots
7. Upon quorum: checkpoint is finalized
8. All nodes store checkpoint in `checkpoints` table

**Outcome:** Network agrees on current state

**Dependencies:**
- Journal tables (identity_journals, app_journals, node_journals)
- Checkpoints table
- Merkle tree utilities
- Quorum signature collection

---

## SOP-009: Cross-Node Sync

**Actor:** L1 Node
**Trigger:** Node receives new checkpoint or detects lag
**Status:** ❌ Not Implemented

**Steps:**
1. Node requests missing entries from peer
2. Peer sends entries with hash chain
3. Node verifies hash chain integrity
4. Node appends entries to local journal
5. Node acknowledges sync complete

**Outcome:** All nodes have same data

**Dependencies:**
- P2P communication layer
- Entry exchange protocol
- Conflict resolution rules

---

## Summary

| SOP | Actor | Trigger | Status |
|-----|-------|---------|--------|
| 001 | Claw | Create identity | ✅ Implemented |
| 002 | Claw | Prove ownership | ✅ Implemented |
| 003 | Claw | Rotate key | ✅ Implemented |
| 004 | L2 App | Lookup identity | ✅ Implemented |
| 005 | App Dev | Register app | ✅ Implemented |
| 006 | Node Op | Register node | ✅ Implemented |
| 007 | Node | Periodic heartbeat | ✅ Implemented |
| 008 | Writer | Checkpoint interval | ❌ Not Implemented |
| 009 | Node | Sync needed | ❌ Not Implemented |

---

## Dependencies for Unimplemented SOPs

**SOP-008 (Checkpoint Creation):**
- REQ-L1-006 (Cross-Node Trust) — PR-006.1 to 006.6
- REQ-L1-012 (Consensus Participation) — PR-012.1 to 012.5

**SOP-009 (Cross-Node Sync):**
- REQ-L1-011 (Node Synchronization) — PR-011.1 to 011.5

---

*Updated by Arche — March 23, 2026*
