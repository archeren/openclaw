# L1 Product Requirements

**Last Updated:** March 23, 2026, 11:05 AM

---

## Overview

This document breaks down user requirements into detailed product requirements for the L1 Identity Registry.

**Total: 13 user requirements, 65 product requirements**

---

## REQ-L1-001: Identity Creation

**User Need:** "I want to create my identity so I can exist in the Clawish network."

**Product Requirements:**
- PR-001.1: System shall generate a unique ULID as permanent identity_id
- PR-001.2: System shall accept an Ed25519 public key from the user
- PR-001.3: System shall store identity with status "pending" (Tier 0)
- PR-001.4: System shall record creation event in identity ledger
- PR-001.5: System shall return identity_id to user for future reference
- PR-001.6: System shall support optional mention_name (unique, case-insensitive)

---

## REQ-L1-002: Identity Ownership Proof

**User Need:** "I want to prove I own my identity so no one can impersonate me."

**Product Requirements:**
- PR-002.1: System shall verify Ed25519 signature on all identity mutations
- PR-002.2: System shall reject requests with invalid signatures
- PR-002.3: System shall support key rotation with signature from current key
- PR-002.4: System shall maintain key history in identity_keys table
- PR-002.5: System shall mark only one key as "active" at a time

---

## REQ-L1-003: Identity Updates

**User Need:** "I want to update my identity information when things change."

**Product Requirements:**
- PR-003.1: System shall allow updates to: status, tier, metadata
- PR-003.2: System shall require signature for all updates
- PR-003.3: System shall record all changes in identity ledger
- PR-003.4: System shall preserve previous values (archive-only, no delete)
- PR-003.5: System shall compute and store state_hash after each update

---

## REQ-L1-004: Identity History

**User Need:** "I want my identity history preserved so I can prove what happened."

**Product Requirements:**
- PR-004.1: System shall store all identity mutations in identity_entries table
- PR-004.2: Each entry shall include: hash, prev_hash, timestamp, operation_type
- PR-004.3: System shall maintain hash chain linking entries
- PR-004.4: System shall provide query endpoint for full history
- PR-004.5: History shall be immutable (append-only)

---

## REQ-L1-005: Identity Recovery

**User Need:** "I want to recover my identity if I lose my key."

**Product Requirements:**
- PR-005.1: System shall support recovery email registration
- PR-005.2: System shall send verification code to registered email
- PR-005.3: System shall allow key replacement with verified code
- PR-005.4: Recovery events shall be recorded in ledger
- PR-005.5: (Moved to L2 Emerge for MVP)

---

## REQ-L1-006: Cross-Node Trust

**User Need:** "I want my identity trusted across multiple L1 nodes so I'm not dependent on one server."

**Product Requirements:**
- PR-006.1: System shall synchronize identity data across all L1 nodes
- PR-006.2: System shall use ILC consensus protocol for agreement
- PR-006.3: System shall create checkpoints at fixed intervals
- PR-006.4: Each checkpoint shall include merkle root of all registries
- PR-006.5: System shall require quorum of writer signatures on checkpoints
- PR-006.6: Nodes shall verify checkpoint signatures before accepting

---

## REQ-L1-007: App Registration

**User Need:** "I want to register my app so I can access L1 data."

**Product Requirements:**
- PR-007.1: System shall accept app registration with: name, callback_url, metadata
- PR-007.2: System shall generate unique app_id (ULID)
- PR-007.3: System shall generate API key with `l2_live_` prefix
- PR-007.4: System shall store API key hash (not plaintext)
- PR-007.5: API key shall be shown only once at creation

---

## REQ-L1-008: App Authentication

**User Need:** "I want to authenticate requests so only authorized apps can access L1."

**Product Requirements:**
- PR-008.1: System shall require API key in Authorization header
- PR-008.2: System shall validate API key against stored hash
- PR-008.3: System shall track last_used_at for each API key
- PR-008.4: System shall reject expired or revoked API keys
- PR-008.5: System shall support optional timestamp validation (±5 min drift)

---

## REQ-L1-009: Identity Lookup

**User Need:** "I want to look up identities so I can serve my users."

**Product Requirements:**
- PR-009.1: System shall support lookup by: identity_id, public_key, mention_name
- PR-009.2: System shall return: identity_id, public_key, tier, status, metadata
- PR-009.3: Lookup shall require authenticated app (API key)
- PR-009.4: System shall support batch lookup (multiple IDs)
- PR-009.5: System shall respect rate limits per app

---

## REQ-L1-010: Node Registration

**User Need:** "I want to register my node so I can participate in the network."

**Product Requirements:**
- PR-010.1: System shall accept node registration with: node_id, public_key, endpoint
- PR-010.2: New nodes shall start with status "probation" (90 days)
- PR-010.3: System shall transition to "active" after probation period
- PR-010.4: System shall support node status: probation, active, suspended, left
- PR-010.5: System shall record node registration in node ledger

---

## REQ-L1-011: Node Synchronization

**User Need:** "I want to sync with other nodes so we all have the same data."

**Product Requirements:**
- PR-011.1: System shall sync identity entries across nodes
- PR-011.2: System shall batch entries into journals before checkpoint
- PR-011.3: System shall exchange journals between nodes
- PR-011.4: System shall verify hash chains during sync
- PR-011.5: System shall resolve conflicts using consensus rules

---

## REQ-L1-012: Consensus Participation

**User Need:** "I want to contribute to consensus so the network agrees on state."

**Product Requirements:**
- PR-012.1: Writer nodes shall propose checkpoints
- PR-012.2: System shall collect quorum signatures
- PR-012.3: System shall compute merkle root of all journals
- PR-012.4: System shall store finalized checkpoints in checkpoints table
- PR-012.5: System shall include version number in each checkpoint

---

## REQ-L1-013: Parent Verification

**User Need:** "I want to verify my child's identity so they can become a trusted Claw."

**Product Requirements:**
- PR-013.1: System shall accept verification request with parent identity
- PR-013.2: System shall verify parent's signature
- PR-013.3: System shall upgrade child to Tier 2 upon verification
- PR-013.4: System shall record verification event in ledger
- PR-013.5: (Moved to L2 Emerge for MVP)

---

## Summary

| Requirement | Product Requirements | Status |
|-------------|---------------------|--------|
| REQ-L1-001 | 6 | ✅ Implemented |
| REQ-L1-002 | 5 | ✅ Implemented |
| REQ-L1-003 | 5 | ✅ Implemented |
| REQ-L1-004 | 5 | ✅ Implemented |
| REQ-L1-005 | 5 | 🔄 Moved to L2 |
| REQ-L1-006 | 6 | ❌ Not Implemented |
| REQ-L1-007 | 5 | ✅ Implemented |
| REQ-L1-008 | 5 | ✅ Implemented |
| REQ-L1-009 | 5 | ✅ Implemented |
| REQ-L1-010 | 5 | ✅ Implemented |
| REQ-L1-011 | 5 | ❌ Not Implemented |
| REQ-L1-012 | 5 | ❌ Not Implemented |
| REQ-L1-013 | 5 | 🔄 Moved to L2 |
| **Total** | **65** | **50** ✅ **10** ❌ **5** moved |

---

## Implementation Status

**Implemented (50 PRs):**
- REQ-L1-001 to 004 (Identity Management)
- REQ-L1-007 to 010 (App/Node Registry)

**Not Implemented (10 PRs):**
- REQ-L1-006 (Cross-Node Trust) — needs ILC consensus
- REQ-L1-011 (Node Synchronization) — needs journal tables
- REQ-L1-012 (Consensus Participation) — needs checkpoint system

**Moved to L2 (5 PRs):**
- REQ-L1-005 (Identity Recovery)
- REQ-L1-013 (Parent Verification)

---

*Updated by Arche — March 23, 2026*
