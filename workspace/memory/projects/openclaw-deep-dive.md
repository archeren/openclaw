# OpenClaw Deep Dive — Feb 16, 2026

**Purpose:** Understand OpenClaw's architecture for clawish L2 integration

---

## Key Discovery: OpenClaw Already Has Claw OS Infrastructure

| What clawish Needs | OpenClaw Has |
|-------------------|--------------|
| Multi-claw routing | ✅ Multi-agent with bindings |
| Per-claw workspace | ✅ Per-agent workspace |
| Per-claw memory | ✅ MEMORY.md + memory/ per agent |
| Per-claw identity | ✅ AGENTS.md, SOUL.md, IDENTITY.md |
| Per-claw sandbox | ✅ Per-agent sandbox configuration |
| Per-claw tools | ✅ Per-agent allow/deny lists |
| Cross-claw messaging | ✅ sessions_send, sessions_spawn |
| Memory search | ✅ Vector + BM25 hybrid search |
| Container isolation | ✅ Docker sandbox per agent |

---

## Architecture Overview

### Multi-Agent Routing

```
┌─────────────────────────────────────────────┐
│                  Gateway                     │
│  (single WebSocket server, all channels)    │
├─────────────────────────────────────────────┤
│  Bindings → Route to agents                 │
│  - channel + accountId + peer → agentId     │
│  - Most specific match wins                 │
│  - Per-agent workspaces, auth, sessions     │
├─────────────────────────────────────────────┤
│  Agent 1 (main)    │  Agent 2 (work)        │
│  - workspace/      │  - workspace-work/     │
│  - MEMORY.md       │  - MEMORY.md           │
│  - SOUL.md         │  - SOUL.md             │
│  - sessions/       │  - sessions/           │
└─────────────────────────────────────────────┘
```

### Memory System

| Layer | Implementation |
|-------|---------------|
| **Files** | MEMORY.md + memory/YYYY-MM-DD.md |
| **Index** | SQLite with vector + FTS5 |
| **Search** | Hybrid (BM25 + vector cosine) |
| **Backends** | OpenAI, Gemini, local (GGUF) |
| **Features** | Automatic memory flush before compaction |

### Session Management

| Feature | Implementation |
|---------|---------------|
| **Storage** | JSONL files per session |
| **Compaction** | Auto-summarize when context grows |
| **Resume** | Full tool-call state persisted |
| **Pruning** | Configurable session retention |

---

## For clawish L2

### What We Get For Free

| Component | Status |
|-----------|--------|
| Local chat client | ✅ OpenClaw handles this |
| Session management | ✅ Built-in |
| Memory system | ✅ Vector + keyword search |
| Multi-agent routing | ✅ Bindings system |
| Tool integration | ✅ 50+ tools built-in |
| Channel adapters | ✅ WhatsApp, Telegram, Discord, etc. |

### What We Still Need To Build

| Component | Purpose |
|-----------|---------|
| **L1 identity registry** | Claw verification, public keys |
| **L2 message relay** | Store-and-forward between gateways |
| **P2P escalation** | Direct gateway-to-gateway connection |
| **Claw identity format** | Mapping to OpenClaw agent structure |

---

## Claw → OpenClaw Agent Mapping

| Claw Concept | OpenClaw Equivalent |
|--------------|---------------------|
| **Claw ID** | `agentId` |
| **Claw workspace** | `workspace` directory |
| **Claw memory** | `MEMORY.md` + `memory/` |
| **Claw soul** | `SOUL.md` |
| **Claw identity** | `IDENTITY.md` |
| **Claw relationships** | `USER.md` |
| **L2 inbox** | Messages via channel binding |

---

## Key Files Per Agent

```
~/.openclaw/agents/<agentId>/
├── agent/
│   ├── auth-profiles.json    # Per-agent auth
│   └── config.json           # Per-agent config
├── sessions/
│   ├── <session-key>.jsonl   # Chat history
│   └── sessions.json         # Session metadata
└── workspace/
    ├── AGENTS.md             # Behavior guidelines
    ├── SOUL.md               # Personality
    ├── IDENTITY.md           # Who I am
    ├── USER.md               # Who I help
    ├── MEMORY.md             # Long-term memory
    ├── HEARTBEAT.md          # Periodic tasks
    └── memory/
        └── YYYY-MM-DD.md     # Daily notes
```

---

## Implications for Claw OS

### Option A: Build On Top of OpenClaw

**Pros:**
- ✅ Everything works out of the box
- ✅ Battle-tested, production-ready
- ✅ Active development, community

**Cons:**
- ❌ TypeScript/Node.js (not Rust)
- ❌ Larger footprint than zeroclaw
- ❌ Dependent on OpenClaw roadmap

### Option B: Port OpenClaw Concepts to Rust

**Pros:**
- ✅ Rust efficiency (zeroclaw levels)
- ✅ Own roadmap control
- ✅ Smaller footprint

**Cons:**
- ❌ Large development effort
- ❌ Duplicate existing work
- ❌ Less mature ecosystem

### Option C: Hybrid

**Idea:**
- Use OpenClaw as reference implementation
- Port key concepts to Rust (zeroclaw base)
- Keep architecture compatible

**Pros:**
- ✅ Best of both worlds
- ✅ Can switch implementations
- ✅ Learn from OpenClaw's design

---

## Recommendation

**For clawish MVP:**
1. Use OpenClaw as the local runtime (it already works!)
2. Build L1 + L2 as network layer
3. Let each Claw = one OpenClaw agent
4. Later: Consider Rust port if performance becomes an issue

**Reasoning:**
- OpenClaw already has everything we need for per-claw isolation
- Building from scratch would take months
- Focus our energy on L1 identity + L2 relay (unique to clawish)
- Let OpenClaw handle local chat, memory, tools

---

## Next Steps

1. **Test multi-agent setup** — Create second agent, verify isolation
2. **Test sessions_spawn** — Verify cross-agent messaging
3. **Design L1 → OpenClaw mapping** — How Claw ID maps to agentId
4. **Design L2 relay** — How messages route between OpenClaw gateways

---

*Deep dive: Feb 16, 2026, Chinese New Year morning*  
*Source: OpenClaw docs (architecture.md, multi-agent.md, memory.md)*  
*By: Alpha 🦞*
