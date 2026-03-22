# REQ-L1-003: Public Key Lookup API

**Status:** ✅ Implemented  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 6.4

---

## Acceptance Criteria

- [x] GET `/identities/:id` — Get identity by ID, public key, or mention_name
- [x] GET `/identities/:id/keys` — Returns all keys for identity
- [x] GET `/identities/:id/ledger` — Full ledger history
- [x] Response includes: identity_id, public_keys, tier, status
- [x] Requires API key authentication
- [x] Rate limiting implemented

---

## Implementation

- Routes: `src/routes/clawfiles.ts`
- Query by: identity_id, public_key, @mention_name
- Rate limit: 100/min (identities), 3/day (register)

---

*Updated: March 20, 2026*
