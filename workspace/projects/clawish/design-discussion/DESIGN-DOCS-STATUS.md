# Design Docs Status

**Date:** February 22, 2026

---

## ✅ New Design Docs (Feb 22, 2026)

The following documents contain the **current consensus protocol design**, superseding earlier versions:

| Document | Topic | Status |
|----------|-------|--------|
| `11-consensus-protocol.md` | 6-step consensus protocol (COMMIT→CHECKPOINT) | ✅ **Current** |
| `12-ledger-structure.md` | Multi-dimensional ledger + single checkpoint | ✅ **Current** |
| `13-clock-sync.md` | Checkpoint-anchored timing + NTP for local use | ✅ **Current** |

---

## 📁 Archived Design Docs

The following documents have been **moved to `archive/` folder** and replaced by current docs:

| Archived Document | Replaced By | Reason |
|-------------------|-------------|--------|
| `archive/08-multi-node-sync-protocol.md` | `11-consensus-protocol.md`, `13-clock-sync.md` | 5-phase → 6-step protocol, wall clock → checkpoint-anchored |
| `archive/broadcast-method-notes.md` | `11-consensus-protocol.md` | Thinking notes → finalized protocol |

---

## ⚠️ Outdated Design Docs (Still in Main Folder)

| Document | Outdated Content | Current State |
|----------|------------------|---------------|
| `04-verification-tiers.md` | Guardians, tier-based recovery | ⚠️ Superseded by WP 4.7 |
| `01-identity-system.md` | UUID v4, single key rotation | ⚠️ **Notice added** — See WP 4.4-4.8 |
| `05-recovery-system.md` | Multiple recovery tiers | ⚠️ **Notice added** — See WP 4.7 |

---

## Current Decisions (from Feb 2026 chats)

### Feb 22, 2026 (Consensus Protocol)

| Topic | Decision | Doc |
|-------|----------|-----|
| **Protocol phases** | 2 phases: Consensus (writers) + Propagation (query pull) | 11-consensus-protocol.md |
| **Step names** | COMMIT → SUBMIT → MERGE → COMPARE → SEAL → CHECKPOINT | 11-consensus-protocol.md |
| **Signing style** | Chain (sequential, by COMPARE arrival time) | 11-consensus-protocol.md |
| **Quorum formula** | max(2, floor(N/2)+1) — majority, min 2 | 11-consensus-protocol.md |
| **Transport** | HTTP POST (REST API) | 11-consensus-protocol.md |
| **Timeout values** | COMMIT 30s, SUBMIT 60s, MERGE 30s, COMPARE 60s, SEAL 60s, CHECKPOINT 30s | 11-consensus-protocol.md |
| **Ledger dimensions** | 3 tables: actor_ledgers, node_ledgers, app_ledgers | 12-ledger-structure.md |
| **Checkpoint structure** | Single aggregated (atomic, cryptographically binds all) | 12-ledger-structure.md |
| **Timing source** | Checkpoint-anchored (not wall clock) | 13-clock-sync.md |
| **Ledger validation** | timestamp >= previous checkpoint round_end | 13-clock-sync.md |
| **NTP** | Required for logs/audit, NOT for consensus | 13-clock-sync.md |

### Feb 10-19, 2026 (Earlier Decisions)

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
| **Writer count** | Adaptive (maximize within sync constraint) | Feb 15 |
| **Writer selection** | Sync speed = primary metric, auto promote/demote | Feb 15 |
| **Probation period** | 90 days before eligible for writer | Feb 15 |
| **Real-time failover** | Immediate replacement from top query nodes | Feb 15 |
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
