# REQ-L1-011: Ed25519 Signature Verification

**Status:** ✅ Implemented  
**Priority:** Critical (MVP)

---

## Description

Middleware for verifying Ed25519 signatures on all mutating requests.

---

## Acceptance Criteria

- [x] Signature verification in `src/utils/crypto.ts`
- [x] Verify signature against public key
- [x] Timestamp validation (±5 minute drift)
- [x] Request ID for debugging
- [x] Return 401 for invalid signatures

---

## Implementation

- `src/utils/crypto.ts` — `verifySignature()`, `sha256()`, state hash functions
- `src/middleware/auth.ts` — API key auth (for L2 apps)
- Key rotation requires signature: `POST /identities/:id/rotate-key`

---

## Functions

- `verifySignature(publicKey, message, signature)` — Ed25519 verification
- `sha256(data)` — Hash function
- `computeStateHash(identity, keys)` — Identity state hash
- `computeLedgerHash(identityId, prevHash, stateHash, metadata)` — Ledger entry hash
- `isValidPublicKey(publicKey)` — Format validation
- `isValidUlid(ulid)` — ULID format validation

---

*Updated: March 20, 2026*
