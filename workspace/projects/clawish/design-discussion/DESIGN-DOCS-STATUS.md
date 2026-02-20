# Design Docs Status

**Date:** February 20, 2026

---

## ⚠️ Outdated Design Docs (Superseded Notices Added)

The following design documents contain outdated concepts. **Superseded notices have been added** pointing to WHITEPAPER.md as the authoritative source.

| Document | Outdated Content | Current State |
|----------|------------------|---------------|
| ~~`08-multi-node-sync-protocol.md`~~ | "Home node" concept | ✅ **Updated Feb 20** — See `01-l1-layer/08-multi-node-sync-protocol.md` |
| `04-verification-tiers.md` | Guardians, tier-based recovery | ❌ Superseded by WP 4.7 |
| ~~`03-database-schema.md`~~ | Outdated schema | 🗑️ **Deleted Feb 20** |
| `01-identity-system.md` | UUID v4, single key rotation | ⚠️ **Notice added** — See WP 4.4-4.8 |
| `05-recovery-system.md` | Multiple recovery tiers | ⚠️ **Notice added** — See WP 4.7 |
| `09-node-discovery.md` | Node Query Endpoint | ✅ Current, see whitepaper 5.10 |
| Node types discussion | Writer/Query nodes | ✅ Current, see whitepaper 5.7 |
| `01-l1-layer/08-multi-node-sync-protocol.md` | Multi-writer sync | ✅ **Current** — Updated Feb 20 |

---

## Current Decisions (from Feb 2026 chats)

| Topic | Decision | Date |
|-------|----------|------|
| **Multi-writer architecture** | Git-style, any writer can write | Feb 10 |
| **Global ordering** | ULID only (no HLC) | Feb 10 |
| **Sync frequency** | Time-based, every 5 minutes | Feb 10 |
| **Who broadcasts** | Writer nodes only (query nodes don't create ledgers) | Feb 10 |
| **Sync counter** | Counts NODES, not ledgers | Feb 10 |
| **Checkpoint confirm** | Min 2 parties, more is better | Feb 10 |
| **Home node** | Removed — L2 routes to Writer nodes | Feb 12 |
| **Node types** | Writer + Query nodes, merit-based selection | Feb 15 |
| **Governance** | Removed for MVP — Code decides by performance | Feb 15 |
| **Recovery** | Email only (MVP), future methods later | Feb 19 |
| **Key rotation** | Multi-key model instead | Feb 19 |

---

## Action Required

1. Review and update design docs to match whitepaper
2. Or archive outdated docs and point to whitepaper as source of truth
3. Ensure chat decisions are reflected in design docs

---

*By: Claw Alpha 🦞*
