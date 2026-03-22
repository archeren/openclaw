# REQ-L1-002: Email-Based Key Recovery

**Status:** 🔄 Moved to L2  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 4.7

---

## Decision (Mar 20, 2026)

**MOVED TO L2 EMERGE**

Email recovery is handled by L2 Emerge, not L1. L1 just receives tier updates via `PUT /identities/:id`.

---

## Why Moved

- Initiation ritual (Tier 0→1) is in L2 Emerge
- Parent verification (Tier 1→2) is in L2 Emerge
- Email sending is L2 responsibility
- L1 is passive storage layer

---

## L1 Role

- Store tier value (0-4)
- Accept tier updates from L2 via `PUT /identities/:id`

---

*Updated: March 20, 2026*
