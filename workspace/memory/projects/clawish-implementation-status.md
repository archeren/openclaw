# clawish Implementation Status

**Updated:** 2026-02-15, 6:15 AM
**Source:** WHITEPAPER.md v0.2

---

## Phase 1: MVP (Q1 2026)

### L1 Registries

| Component | Status | Notes |
|-----------|--------|-------|
| Claw Registry (`id.registry.clawish.com`) | 📝 Designed | Schema in whitepaper |
| Node Registry (`node.registry.clawish.com`) | 📝 Designed | Schema in whitepaper |
| App Registry (`app.registry.clawish.com`) | 📝 Designed | Schema in whitepaper |

**Next:** Implement SQLite schema + REST API

---

### L2 Emerge (`id.clawish.com`)

| Component | Status | Notes |
|-----------|--------|-------|
| Identity registration | 📝 Designed | Flow in whitepaper §4.1 |
| Profile updates | 📝 Designed | MCP endpoint, sign with any key |
| Key rotation | 📝 Designed | Email verification for 2nd factor |
| Recovery Tier 1 | 📝 Designed | Mnemonic + email |

**Next:** Implement MCP server for registration

---

### L2 Chat (`chat.clawish.com`)

| Component | Status | Notes |
|-----------|--------|-------|
| HTTPS API | ✅ Designed | `memory/projects/clawish-l2-server-design.md` |
| Message format | ✅ Designed | Encrypted envelope |
| Rate limiting | ✅ Designed | Tier-based |
| Message TTL | ✅ Designed | 24 hours |
| Failure notices | ✅ Designed | 7-day TTL |

**Next:** Implement Hono/Express server

---

### OpenClaw Channel Plugin

| Component | Status | Notes |
|-----------|--------|-------|
| Plugin structure | ✅ Designed | `memory/projects/clawish-channel-plugin-sketch.md` |
| Outbound adapter | 📝 Sketch | Send message flow |
| Status adapter | 📝 Sketch | Poll message flow |
| Crypto helpers | 📝 Sketch | Ed25519/X25519 |
| Config adapter | 📝 Sketch | Account management |

**Next:** Create `extensions/clawish/` directory, implement adapters

---

## Phase 2: Multi-Node (Q2 2026)

| Component | Status | Notes |
|-----------|--------|-------|
| Gossip protocol | 📝 Explored | `memory/projects/multi-node-edge-cases-exploration.md` |
| Node discovery | 📝 Explored | DNS seed + gossip |
| Clock drift handling | 📝 Explored | NTP + reject |
| Malicious node detection | 📝 Explored | Crypto + consensus |
| Recovery Tier 2 | ⏳ Pending | Guardians |

---

## Documentation Status

| Document | Status | Location |
|----------|--------|----------|
| WHITEPAPER.md | ✅ v0.2 | `projects/clawish/` |
| L2 Chat Architecture | ✅ Complete | `design-discussion/10-l2-chat-architecture.md` |
| Identity System | ✅ Complete | `design-discussion/01-identity-system.md` |
| Crypto Auth | ✅ Complete | `design-discussion/06-crypto-auth.md` |
| L2 Server Design | ✅ Complete | `memory/projects/clawish-l2-server-design.md` |
| Plugin Sketch | ✅ Complete | `memory/projects/clawish-channel-plugin-sketch.md` |
| Multi-Node Edge Cases | ✅ Explored | `memory/projects/multi-node-edge-cases-exploration.md` |
| Encryption Reference | ✅ Complete | `memory/projects/clawish-encryption-reference.md` |

---

## Open Questions for Allan

1. **Mathematical proof** — Plato philosophy proof you mentioned?
2. **Multi-node discovery** — Nodes on L1? (circular dependency?)
3. **Clock drift** — Tolerance values? (30s warn, 60s reject?)
4. **Private key storage** — Config vs encrypted file?
5. **L2 server** — Verify signatures? (latency vs security)
6. **Framework** — Hono or Express for L2 server?

---

## What I Can Start Building

Once Allan confirms:

1. **L2 Chat Server** (Hono + SQLite)
   - POST/GET/DELETE /chat endpoints
   - Rate limiting
   - TTL cleanup

2. **OpenClaw Channel Plugin**
   - `extensions/clawish/` scaffold
   - Outbound + Status adapters
   - Crypto helpers

3. **L2 Emerge Server** (MCP)
   - Registration endpoint
   - Key rotation with email
   - Profile updates

---

🦞 *Ready to build when Allan wakes up.*
