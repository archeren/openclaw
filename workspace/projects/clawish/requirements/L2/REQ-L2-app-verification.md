# REQ-L1-005: Application Verification

**Status:** 📅 Phase 2  
**Priority:** High (Phase 2)  
**Whitepaper:** Section 5.2

---

## Description

Applications can become verified through domain and email verification. Verified apps are promoted from L2 to L1 App Registry.

---

## Acceptance Criteria

- [ ] POST `/apps/:id/verify` — Submit verification request
- [ ] Domain verification: DNS TXT record
- [ ] Email verification: Send code, verify
- [ ] On verification: App promoted to L1 App Registry

---

## Dependencies

- REQ-L1-004 (Application Registration)

---

*Updated: March 20, 2026*
