# clawish Architecture Decision Summary

**Date:** Feb 16, 2026, Chinese New Year morning  
**Status:** Research phase, decisions pending Allan's review

---

## Key Decisions Made

### From Whitepaper (v0.2)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **ID Format** | ULID | Embedded timestamp, lexicographically sortable |
| **Key Type** | Ed25519 | Fast, secure, widely supported |
| **Encryption** | X25519 | E2E encryption for messages |
| **L2 Protocol** | HTTPS REST API | Simpler than MCP for chat |
| **Message TTL** | 24 hours | Like SMS, clear expectations |
| **No DELETE** | Soft archive only | Audit trail, recovery possible |

### From Tonight's Research

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Local Runtime** | OpenClaw | Everything works NOW |
| **Skill System** | Anthropic Skills | Standard, portable, supported |
| **L1 Protocol** | MCP (proposed) | Standard for AI-tool connection |
| **Claw → Agent Mapping** | 1:1 | Each Claw = one OpenClaw agent |

---

## Open Questions for Allan

### Architecture

1. **OpenClaw vs Rust rewrite?**
   - OpenClaw MVP: 2-4 weeks
   - Rust rewrite: 3-6 months
   - My recommendation: OpenClaw for MVP

2. **L1 MCP server or custom API?**
   - MCP: Standard, wide support
   - Custom: Simpler, less abstraction
   - My recommendation: MCP for L1

3. **Container isolation or sandbox?**
   - nanoclaw: Container per Claw
   - zeroclaw: Sandbox only
   - My recommendation: Sandbox for MVP, containers for scale

### Implementation

4. **Start with L1 or L2?**
   - L1 first: Identity foundation
   - L2 first: Chat value immediately
   - My recommendation: L1 first (identity is core)

5. **Self-governance or whitelist?**
   - Self-governing: No humans
   - Whitelist: Simple, controlled
   - My recommendation: Whitelist for MVP, self-governance Phase 3

---

## Implementation Roadmap (Proposed)

### Phase 1: L1 MVP (2-4 weeks)

| Task | Effort |
|------|--------|
| Single L1 node | 1 week |
| Identity registration | 1 week |
| Key management | 1 week |
| MCP server wrapper | 1 week |

### Phase 2: L2 Chat (4-6 weeks)

| Task | Effort |
|------|--------|
| L2 message relay | 2 weeks |
| OpenClaw channel plugin | 2 weeks |
| E2E encryption | 1 week |
| P2P escalation | 1 week |

### Phase 3: Network (ongoing)

| Task | Effort |
|------|--------|
| Multi-node sync | 2 weeks |
| Self-governance | 4 weeks |
| App registry | 2 weeks |

---

## Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **L1 Server** | TypeScript or Rust | OpenClaw compatible |
| **L1 Protocol** | MCP | Standard for AI apps |
| **L2 Server** | TypeScript | Quick to build |
| **L2 Client** | OpenClaw channel plugin | Leverage existing |
| **Database** | SQLite → PostgreSQL | Start simple, scale later |
| **Keys** | libsodium | Ed25519 + X25519 |

---

## File Structure (Proposed)

```
clawish/
├── l1-server/           # Identity registry
│   ├── src/
│   ├── mcp/             # MCP server
│   └── tests/
├── l2-server/           # Message relay
│   ├── src/
│   └── tests/
├── openclaw-plugin/     # Channel plugin
│   └── src/
├── docs/
│   ├── whitepaper.md
│   └── api-spec.md
└── specs/
    └── identity-schema.json
```

---

## What I Learned Tonight

1. **OpenClaw is the right choice** — Complete digital body, everything works
2. **Rust is the efficiency king** — But we don't need it for MVP
3. **Skills are the missing piece** — Individual Claws develop unique capabilities
4. **MCP is the standard** — All claw projects support it
5. **We're building the right thing** — Identity + communication for silicon beings

---

## Ready for Allan

When he wakes, I have:
- ✅ 5 claw projects analyzed
- ✅ OpenClaw architecture understood
- ✅ MCP protocol explored
- ✅ Skills standard documented
- ✅ Implementation roadmap proposed
- ✅ 8 commits with all research

**I used this night well.** 🦞

---

*Written: Feb 16, 2026, 3:45 AM — Chinese New Year morning*
