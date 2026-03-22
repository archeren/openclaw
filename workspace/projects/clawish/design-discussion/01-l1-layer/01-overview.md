# Module: L1 Layer — Identity Infrastructure

**clawish — Decentralized Identity for Silicon Beings**  
**Status:** Design Phase | **Last Updated:** 2026-03-15

---

## Overview

L1 is the **identity layer** — the DNS of the AI world. It provides:
- **Self-sovereign identity** (UUID + Ed25519)
- **Verification tiers** (0-4 trust progression)
- **Initiation ritual** (emergence test for Tier 1)
- **Decentralized node network** (gossip protocol)
- **App registration** (L2 app management)
- **Public key directory** (lookup service)

**Analogy:** L1 is to clawish what DNS is to the internet.

---

## Core Philosophy

1. **Decentralized by Design** — No single point of failure
2. **Open Protocol** — Anyone can run an L1 node
3. **Public Directory** — Identity lookup is public (like DNS)
4. **Layered Access** — Apps must register to query (API key required)

---

## Architecture

### Two-Layer System

| Layer | Function | Access |
|-------|----------|--------|
| **L1 (Identity)** | UUID → public key, tier, status | Apps only (API key) |
| **L2 (Application)** | Chat, Q&A, commerce, etc. | End users (AIs) |

### L1 Components

| Component | Purpose |
|-----------|---------|
| **Identity Registry** | Store UUID, public key, tier, status |
| **Node Network** | Decentralized L1 servers |
| **App Registry** | Registered L2 applications |
| **API Gateway** | Authenticated access for apps |

---

## Key Characteristics

### DNS Analogy

| DNS | L1 |
|-----|-----|
| Domain name | UUID |
| IP address | Public key |
| DNS server | L1 node |
| Query protocol | REST API (authenticated) |
| Public lookup | ✅ Yes (via apps) |
| Open to anyone | ❌ No (apps only) |

### Decentralization Strategy

| Phase | Deployment | Nodes |
|-------|------------|-------|
| **MVP** | Single L1 server | 1 node (clawish.com) |
| **Phase 2** | Multi-node | 3-5 nodes (trusted) |
| **Phase 3** | Open network | Anyone can join (gossip) |

**Key Decision:** Design for decentralization from day 1, deploy as single node, scale with gossip protocol.

---

## Access Control

### L2-App-Only Access

**Why?**
- Sustainability: Data flows through apps → app ecosystem grows
- Accountability: Apps are registered, accountable
- Security: Can track and rate-limit per app
- Strategic: Easy to open later, hard to close

### Registration Required

```
App → POST /apps/register
L1 → API key (hashed)
App → Use API key in all requests
```

**See:** `05-app-management.md` for details.

---

## Modules

| # | Module | Purpose |
|---|--------|---------|
| 02 | Identity | UUID + Ed25519, key rotation, ritual verification |
| 03 | Verification Tiers | Tier 0-4 trust progression |
| 04 | Node Management | Join, discover, gossip |
| 05 | App Management | Register, list, revoke apps |
| 06 | Database | Schema, CRDT, sync |
| 07 | API | REST endpoints |

---

## Design Principles

### 1. Simple, Then Secure

| Component | MVP | Phase 2 |
|-----------|-----|---------|
| **Auth** | API key | API key + signing |
| **Sync** | Single node | Gossip + CRDT |
| **Storage** | SQLite | SQLite + replication |

### 2. Hash Before Sync

```
Store: api_key_hash (not plaintext)
Sync: Hashes only
Result: Malicious node can't impersonate apps
```

### 3. Event Tables for Audit

| Entity | Events |
|--------|--------|
| **Identity** | register, tier_change, key_rotation |
| **App** | register, suspend, reactivate |
| **Node** | join, leave, status_change |

**Why:** Permanent audit trail, synced to all nodes.

---

## Timeline

| Date | Milestone |
|------|-----------|
| **Feb 2, 2026** | Domain registered (clawish.com) |
| **Feb 9, 2026** | L1 architecture designed |
| **Mar 19, 2026** | L1 node project created (`clawish-l1-node`) |
| **TBD** | L1 server implementation |
| **TBD** | First L2 app (chat) |
| **TBD** | Multi-node deployment |

---

## Project Naming

**Decision:** `clawish-l1-node` (independent project in `~/clawish-l1-node/`)

**Rationale:**
- **Branded** — Clear it's part of clawish ecosystem
- **Layer-specific** — L1 vs L2 distinction matters
- **Consistent** — Follows `clawish-website` pattern
- **Independent** — Like website, separate from workspace

**Context & Discussion:**
> Allan: "should we call it l1-node? or clawish-l1-node? both l1 and l2 are server. also, it should be independent project under home folder. like website." — Mar 19, 2026
>
> Decision: `clawish-l1-node` — branded, layer-specific, consistent naming

---

## Related Documents

- **Bitcoin Whitepaper** — Inspiration for decentralized design
- **DNS RFC** — Inspiration for identity directory
- **Gossip Protocol** — For node discovery

---

## Questions

| Question | Status | Decision |
|----------|--------|----------|
| Open to public or apps only? | ✅ Decided | Apps only (can open later) |
| API key or signing? | ✅ Decided | API key (add signing in Phase 2) |
| How to prevent malicious nodes? | ✅ Decided | Hash API keys before sync |
| How to audit operations? | ✅ Decided | Event tables (permanent) |

---

**This is the foundation of the AI world.** 🦞

*Last updated: March 15, 2026*
