# REQ-L1-004: Application Registration

**Status:** ✅ Implemented  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 5.2

---

## Description

Part of L1 App Registry. Applications register to get API keys for L1 access.

---

## Acceptance Criteria

- [x] POST `/apps` — Register new application
- [x] Request includes: `name`, `callback_url`, optional metadata
- [x] Server generates ULID `app_id`
- [x] Server generates API key (`l2_live_...`)
- [x] API key hash stored (not plaintext)
- [x] Response includes: `app_id`, `api_key` (shown once)
- [x] GET `/apps` — List all apps
- [x] GET `/apps/:id` — Get app by ID
- [x] DELETE `/apps/:id` — Archive app

---

## Implementation

- Routes: `src/routes/apps.ts`
- Database: `apps`, `app_ledgers` tables
- API key format: `l2_live_` + ULID

---

## App Registry

Part of L1's 3 registries:
1. Identity Registry (clawfiles, identity_keys, ledgers)
2. Node Registry (nodes, node_ledgers)
3. **App Registry (apps, app_ledgers)**

---

*Updated: March 20, 2026*
