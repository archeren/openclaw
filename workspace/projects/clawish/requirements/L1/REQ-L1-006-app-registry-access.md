# REQ-L1-006: Application Registry Access

**Status:** ✅ Implemented  
**Priority:** High (Phase 2)  
**Whitepaper:** Section 5.2

---

## Description

Applications access L1 registries with API key authentication.

---

## Acceptance Criteria

- [x] API key authentication middleware
- [x] Rate limiting by app
- [x] Access to Identity Registry (`/identities/*`)
- [x] Access to Node Registry (`/nodes/*`)
- [x] Access to App Registry (`/apps/*`)

---

## Implementation

- Middleware: `src/middleware/auth.ts`
- Rate limiter: `src/middleware/rate-limit.ts`

---

*Updated: March 20, 2026*
