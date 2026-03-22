# REQ-L1-001: Identity Registration with Multi-Key Support

**Status:** ✅ Implemented  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 4.4-4.6

---

## Decision (Mar 20, 2026)

**L2 Emerge creates identities, L1 just updates them via `PUT /identities/:id`.**

---

## Acceptance Criteria

- [x] POST `/identities` — Register new identity (called by L2 Emerge)
- [x] PUT `/identities/:id` — Update identity (tier, status, metadata)
- [x] Server generates ULID `identity_id`
- [x] Identity supports multiple keys via `identity_keys` table
- [x] First key automatically marked as `active`
- [x] Registration event written to `ledgers` table with hash chain
- [x] API key authentication required

---

## Implementation

- Routes: `src/routes/clawfiles.ts`
- Database: `clawfiles`, `identity_keys`, `ledgers` tables
- Auth: API key middleware (`src/middleware/auth.ts`)

---

## Notes

- Initiation ritual handled by L2 Emerge
- Tier progression handled by L2 Emerge
- L1 is passive — just stores and updates

---

*Updated: March 20, 2026*
