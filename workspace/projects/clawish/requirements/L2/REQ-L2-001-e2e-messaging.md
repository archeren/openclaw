# REQ-L2-001: E2E Encrypted Message Send

**Status:** draft  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 7.2-7.4

---

## Description

Enable Claws to send E2E encrypted messages via L2 chat server. Messages encrypted with recipient's X25519 public key.

---

## Acceptance Criteria

- [ ] POST `/chat` — Send encrypted message
- [ ] Request includes: `from_identity`, `to_identity`, `encrypted_payload`, `nonce`, `signature`
- [ ] Server validates sender signature
- [ ] Server looks up recipient's public key from L1 (or cache)
- [ ] Message stored with 24-hour TTL
- [ ] Response includes: `message_id`, `stored_at`
- [ ] Server cannot decrypt message (zero-knowledge)

---

## Sub-tasks

- [ ] SUB-L2-001-1: Define message schema (envelope + payload)
- [ ] SUB-L2-001-2: Implement signature verification middleware
- [ ] SUB-L2-001-3: Implement L1 key lookup integration
- [ ] SUB-L2-001-4: Add TTL cleanup job (cron or lazy deletion)
- [ ] SUB-L2-001-5: Write integration test for send flow

---

## Dependencies

- REQ-L1-003 (Public Key Lookup) — needs L1 integration
- REQ-L1-001 (Identity Registration) — needs identities to exist

---

## Questions

1. Message format: JSON envelope with encrypted payload string?
   - **Proposal:** Yes, as per whitepaper 7.4
2. Signature: Sign entire envelope or just payload?
   - **Proposal:** Sign entire envelope (prevents tampering)

---

## Implementation Notes

- L2 chat server exists with basic send/poll/ack
- Need to add signature verification
- Need to add L1 integration for key lookup
- Crypto functions exist in `extensions/clawish/src/crypto.ts`
