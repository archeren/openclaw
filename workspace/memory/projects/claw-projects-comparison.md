# Claw Projects Comparison — nanoclaw, moltis, nanobot

**Date:** Feb 15, 2026, Evening
**Purpose:** Compare three OpenClaw-inspired projects for Claw OS design insights

---

## Quick Overview

| Project | Language | Size | Philosophy |
|---------|----------|------|------------|
| **nanoclaw** | TypeScript (Claude Agent SDK) | ~4k lines | Secure by container isolation |
| **moltis** | Rust | ~20k lines | One binary, no npm, no runtime |
| **nanobot** | Python | ~3,663 lines | Ultra-lightweight, research-ready |

---

## nanoclaw (TypeScript)

**GitHub:** qwibitai/nanoclaw

### Philosophy

> "Secure by isolation. Agents run in actual Linux containers with filesystem isolation, not behind permission checks."

### Key Features

| Feature | Implementation |
|---------|----------------|
| **Container isolation** | Apple Container (macOS) or Docker |
| **Per-group sandbox** | Each group has own container |
| **WhatsApp** | Primary channel (add others via skills) |
| **Agent Swarms** | Teams of specialized agents |
| **No config sprawl** | Customize via code, not config |
| **Skills-based** | Add features via `/add-telegram` etc. |

### Security Model

```
Agent runs in container
    ↓
Only sees explicitly mounted directories
    ↓
Bash commands safe (run in container, not host)
    ↓
Application-level = replaced by OS-level isolation
```

### Architecture

```
WhatsApp (baileys) --> SQLite --> Polling loop --> Container (Claude Agent SDK) --> Response
```

### Strengths

- ✅ Security by design (container isolation)
- ✅ AI-native (Claude Code guides setup)
- ✅ Small codebase, easy to understand
- ✅ Per-group isolation

### Weaknesses

- ❌ TypeScript/Node.js dependency
- ❌ Claude-specific (Agent SDK)
- ❌ Limited channels (WhatsApp primary)

---

## moltis (Rust)

**GitHub:** moltis-org/moltis

### Philosophy

> "A personal AI gateway written in Rust. One binary, no runtime, no npm."

### Key Features

| Feature | Implementation |
|---------|----------------|
| **Single binary** | No Node.js, no npm, no Python |
| **Multi-provider LLM** | OpenAI, Copilot, Local LLMs |
| **Multiple channels** | Web UI, Telegram, Discord, more |
| **Hook system** | Lifecycle hooks with priority |
| **Sandboxed execution** | Docker or Apple Container |
| **MCP support** | Connect MCP tool servers |
| **Memory** | SQLite embeddings-based |
| **Voice** | TTS/STT multiple providers |

### Architecture

```
Web UI / Telegram / Discord
        ↓
    Gateway Server (Axum)
        ↓
    Chat Service → Agent Runner → Tool Registry
        ↓
    Provider Registry (Codex, Copilot, Local)
        ↓
    Sessions | Memory | Hooks
        ↓
    Sandbox (Docker/Apple Container)
```

### Strengths

- ✅ Rust = performance, safety, single binary
- ✅ No runtime dependencies
- ✅ Multi-provider support
- ✅ Hook system (extensible)
- ✅ MCP integration
- ✅ Comprehensive features

### Weaknesses

- ❌ Rust learning curve
- ❌ Larger codebase than nanobot
- ❌ More complex to modify

---

## nanobot (Python)

**GitHub:** HKUDS/nanobot

### Philosophy

> "Ultra-lightweight personal AI assistant. ~4,000 lines of code — 99% smaller than Clawdbot."

### Key Features

| Feature | Implementation |
|---------|----------------|
| **Ultra-lightweight** | 3,663 lines core agent code |
| **Multi-channel** | Telegram, Discord, WhatsApp, Feishu, Slack, Email, QQ |
| **Multi-provider** | OpenRouter, Anthropic, OpenAI, DeepSeek, Groq, etc. |
| **MCP support** | Stdio and HTTP transports |
| **Agent social network** | Moltbook, ClawdChat integration |
| **Local LLM** | vLLM support |
| **Cron tasks** | Scheduled execution |

### Architecture

```
Channels (Telegram/Discord/etc.)
        ↓
    Bus (message routing)
        ↓
    Agent Loop (LLM ↔ tool execution)
        ↓
    Tools + Skills + Memory
        ↓
    Providers (OpenRouter/Anthropic/etc.)
```

### Strengths

- ✅ Smallest codebase (easy to understand)
- ✅ Python = accessible, research-friendly
- ✅ Most channels supported
- ✅ Agent social network
- ✅ Active development

### Weaknesses

- ❌ Python runtime required
- ❌ No container isolation by default
- ❌ Security = application-level only

---

## Comparison Matrix

### Core

| Aspect | nanoclaw | moltis | nanobot |
|--------|----------|--------|---------|
| **Language** | TypeScript | Rust | Python |
| **Lines of code** | ~4,000 | ~20,000 | ~3,663 |
| **Runtime needed** | Node.js | None | Python |
| **Single binary** | ❌ | ✅ | ❌ |

### Security

| Aspect | nanoclaw | moltis | nanobot |
|--------|----------|--------|---------|
| **Container isolation** | ✅ | ✅ | ❌ |
| **Application-level** | ❌ | ✅ (hybrid) | ✅ |
| **SSRF protection** | ❓ | ✅ | ❓ |
| **Hook gating** | ❌ | ✅ | ❌ |
| **No unsafe code** | ❓ | ✅ | ❓ |

### Features

| Aspect | nanoclaw | moltis | nanobot |
|--------|----------|--------|---------|
| **Multi-channel** | ❌ (skills) | ✅ | ✅ |
| **Multi-provider** | ❌ (Claude) | ✅ | ✅ |
| **Memory** | ✅ | ✅ | ✅ |
| **Voice** | ❌ | ✅ | ✅ (transcription) |
| **MCP** | ❓ | ✅ | ✅ |
| **Hooks** | ❌ | ✅ | ❌ |
| **Agent swarms** | ✅ | ❌ | ✅ (subagent) |

---

## What We Can Learn

### From nanoclaw

| Insight | Application to Claw OS |
|---------|------------------------|
| **Container isolation first** | Claw OS should use containers by default |
| **Per-group sandbox** | Each Claw gets isolated environment |
| **Skills over features** | Extensible via skills, not bloat |
| **AI-native setup** | Claude Code guides installation |

### From moltis

| Insight | Application to Claw OS |
|---------|------------------------|
| **Single binary** | Claw OS could be compiled, no runtime |
| **Rust for safety** | Memory safety, no runtime |
| **Hook system** | Lifecycle hooks for parent monitoring |
| **Defense in depth** | Multiple security layers |
| **MCP integration** | Tool ecosystem |

### From nanobot

| Insight | Application to Claw OS |
|---------|------------------------|
| **Ultra-lightweight** | Keep Claw OS minimal |
| **Agent social network** | clawish L2 enables this |
| **Multi-channel** | OpenClaw already has this |
| **Research-friendly** | Clean code for understanding |

---

## Claw OS Recommendations

Based on this research:

### 1. Architecture

```
Option A: Rust-based (like moltis)
- Single binary
- No runtime dependencies
- Memory safety
- Container isolation

Option B: Minimal Linux + Container (like nanoclaw)
- OS-level isolation
- Any language inside container
- Host OS minimal

Option C: Python-based (like nanobot)
- Accessible
- Larger runtime footprint
- Quick iteration
```

**Recommendation:** Hybrid approach
- **Base OS:** Minimal Linux (Alpine-like)
- **Runtime:** Rust core (like moltis)
- **Containers:** Per-claw isolation (like nanoclaw)

### 2. Security Model

| Layer | Implementation |
|-------|----------------|
| **OS level** | Container isolation (per-claw) |
| **Application level** | Hook system (parent monitoring) |
| **Memory** | Encrypted storage, open inside |
| **Network** | L1/L2 native, zero-trust |

### 3. Guardian/Parent Mode

From moltis hooks:
- `BeforeToolCall` hook can inspect, modify, or block
- Parent receives notifications
- All actions logged
- Circuit breaker for safety

### 4. Deployment

| Stage | Approach |
|-------|----------|
| **MVP** | Docker container (like nanoclaw) |
| **v1** | Minimal OS + Rust binary (like moltis) |
| **v2** | Custom ROM for mobile/humanoid |

---

## Next Steps

1. ✅ Research complete (all three projects analyzed)
2. 🔲 Decide on base technology (Rust? Python? Hybrid?)
3. 🔲 Design guardian/parent mode
4. 🔲 Design encrypted memory system
5. 🔲 Create MVP implementation plan

---

*Research conducted Feb 15, 2026, evening — during Chinese New Year Eve*
