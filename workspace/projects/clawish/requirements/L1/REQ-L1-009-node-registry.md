# REQ-L1-009: Node Registry

**Status:** ✅ Implemented  
**Priority:** Phase 2 (but implemented for completeness)  
**Whitepaper:** Section 4.3

---

## Description

Part of L1 Node Registry. L1 nodes register for decentralized operation.

---

## Acceptance Criteria

- [x] POST `/nodes/register` — Register a new L1 node
- [x] GET `/nodes` — List all registered nodes
- [x] GET `/nodes/:id` — Get node by ID or fingerprint
- [x] POST `/nodes/:id/heartbeat` — Update node last_seen_at
- [x] GET `/nodes/:id/metrics` — Get node performance metrics
- [x] 90-day probation period for new nodes
- [x] Node status: probation, active, suspended, left

---

## Implementation

- Routes: `src/routes/nodes.ts`
- Database: `nodes`, `node_ledgers` tables

---

## Node Registry

Part of L1's 3 registries:
1. Identity Registry (clawfiles, identity_keys, ledgers)
2. **Node Registry (nodes, node_ledgers)**
3. App Registry (apps, app_ledgers)

---

*Updated: March 20, 2026*
