# Claw Project Analysis — Feb 16, 2026

**Purpose:** Compare all 5 claw-inspired projects for Claw OS architecture decisions

---

## Overview

| Project | Stars | Language | Size | Focus |
|---------|-------|----------|------|-------|
| **zeroclaw** | 3,499 | Rust | 3.4MB | Ultra-lightweight, zero overhead |
| **nanobot** | — | Python | 3,663 lines | Research, ultra-lightweight |
| **moltis** | — | Rust | Single binary | Personal AI gateway |
| **microclaw** | 150 | Rust | ~8MB | Multi-channel agentic AI |
| **nanoclaw** | — | TypeScript | Container | Container isolation |

---

## 1. ZeroClaw

**GitHub:** theonlyhennygod/zeroclaw  
**Slogan:** "Zero overhead. Zero compromise. 100% Rust."

### Specs

| Metric | Value |
|--------|-------|
| **Language** | Rust |
| **Binary size** | ~3.4MB |
| **RAM usage** | <5MB |
| **Startup time** | <10ms |
| **Hardware cost** | $10 SBC |
| **Providers** | 22+ |
| **Tests** | 1,017 |
| **License** | MIT |

### Key Features

- ✅ Ultra-lightweight (99% less memory than OpenClaw)
- ✅ Runs on $10 hardware
- ✅ <10ms startup on 0.8GHz edge hardware
- ✅ 22+ LLM providers (OpenRouter, Anthropic, OpenAI, Ollama, etc.)
- ✅ 8 channels (CLI, Telegram, Discord, Slack, iMessage, Matrix, WhatsApp, Webhook)
- ✅ Pluggable everything (traits for providers, channels, tools, memory, tunnels)
- ✅ Security-first: pairing, sandbox, allowlists, workspace scoping
- ✅ AIEOS identity support
- ✅ SQLite hybrid search (FTS5 + vector)
- ✅ MCP support

### Good Points

| Pro | Why It Matters |
|-----|----------------|
| **Memory efficiency** | <5MB vs >1GB for OpenClaw |
| **Fast startup** | <10ms vs >500s for OpenClaw |
| **Low hardware cost** | $10 vs $599 Mac Mini |
| **Security-first** | Pairing, sandbox, allowlists built-in |
| **Extensible** | All subsystems are traits |
| **No runtime** | Single static binary |

### Bad Points

| Con | Impact |
|-----|--------|
| **Rust-only** | Steeper learning curve than Python |
| **New project** | Created Feb 2026, still maturing |
| **No container isolation** | Sandbox only, not containers |

### For Claw OS?

| Aspect | Score | Notes |
|--------|-------|-------|
| **Memory efficiency** | ⭐⭐⭐⭐⭐ | Best in class |
| **Security** | ⭐⭐⭐⭐⭐ | Built-in pairing, sandbox |
| **Extensibility** | ⭐⭐⭐⭐⭐ | All traits swappable |
| **Per-claw isolation** | ⭐⭐⭐ | Sandbox only, not containers |

---

## 2. MicroClaw

**GitHub:** microclaw/microclaw  
**Slogan:** "An agentic AI assistant that lives in your Telegram/Discord chats"

### Specs

| Metric | Value |
|--------|-------|
| **Language** | Rust |
| **Stars** | 150 |
| **Channels** | Telegram, Discord, Web |
| **Providers** | Anthropic + OpenAI-compatible |
| **License** | MIT |

### Key Features

- ✅ Agentic tool use (bash, file read/write/edit, grep, glob)
- ✅ Session resume with full tool-call state
- ✅ Context compaction when sessions grow
- ✅ Sub-agent delegation
- ✅ Agent skills (Anthropic Skills compatible)
- ✅ Plan & execute (todo lists)
- ✅ Web search via DuckDuckGo
- ✅ Scheduled tasks (cron + one-shot)
- ✅ Mid-conversation messaging
- ✅ Persistent memory (AGENTS.md)
- ✅ Message splitting for channel limits
- ✅ MCP support
- ✅ Local Web UI for cross-channel history

### Good Points

| Pro | Why It Matters |
|-----|----------------|
| **Multi-channel** | Telegram, Discord, Web unified |
| **Agentic loop** | 100 iterations per request |
| **Skills system** | Extensible, Anthropic compatible |
| **Scheduling** | Natural language task scheduling |
| **Memory** | Structured + file-based |

### Bad Points

| Con | Impact |
|-----|--------|
| **Larger than zeroclaw** | ~8MB vs 3.4MB |
| **More complex** | More features = more complexity |
| **No container isolation** | Sandbox only |

### For Claw OS?

| Aspect | Score | Notes |
|--------|-------|-------|
| **Multi-channel** | ⭐⭐⭐⭐⭐ | Best for chat interfaces |
| **Agentic features** | ⭐⭐⭐⭐⭐ | Sub-agents, skills, scheduling |
| **Memory efficiency** | ⭐⭐⭐⭐ | Good but not zeroclaw level |
| **Per-claw isolation** | ⭐⭐⭐ | Sandbox only |

---

## 3. NanoClaw

**GitHub:** (analyzed earlier)  
**Focus:** Container isolation per-claw

### Key Features

- ✅ TypeScript
- ✅ Container isolation per claw
- ✅ Security by isolation

### For Claw OS?

| Aspect | Score | Notes |
|--------|-------|-------|
| **Per-claw isolation** | ⭐⭐⭐⭐⭐ | Best in class |
| **Memory efficiency** | ⭐⭐ | Container overhead |
| **Language** | ⭐⭐⭐ | TypeScript, easy to extend |

---

## 4. Moltis

**GitHub:** moltis-org/moltis  
**Focus:** Personal AI gateway, single binary

### Key Features

- ✅ Rust
- ✅ Single binary
- ✅ Multi-provider LLMs
- ✅ Hooks system
- ✅ MCP support
- ✅ Sandboxed execution

### For Claw OS?

| Aspect | Score | Notes |
|--------|-------|-------|
| **Single binary** | ⭐⭐⭐⭐⭐ | Easy deployment |
| **Hook system** | ⭐⭐⭐⭐⭐ | Guardian/parent mode |
| **Memory efficiency** | ⭐⭐⭐⭐ | Good |

---

## 5. NanoBot

**GitHub:** HKUDS/nanobot  
**Focus:** Research, ultra-lightweight

### Key Features

- ✅ Python
- ✅ Ultra-lightweight (~3,663 lines)
- ✅ Multi-channel
- ✅ Research-focused

### For Claw OS?

| Aspect | Score | Notes |
|--------|-------|-------|
| **Simplicity** | ⭐⭐⭐⭐⭐ | Very easy to understand |
| **Language** | ⭐⭐⭐ | Python = slower than Rust |
| **Research-friendly** | ⭐⭐⭐⭐⭐ | Best for experimentation |

---

## Comparison Matrix

| Feature | zeroclaw | microclaw | nanoclaw | moltis | nanobot |
|---------|----------|-----------|----------|--------|---------|
| **Language** | Rust | Rust | TypeScript | Rust | Python |
| **Memory** | <5MB | ~10MB | High | Low | ~100MB |
| **Startup** | <10ms | ~1s | Slow | Fast | ~30s |
| **Binary** | 3.4MB | ~8MB | 28MB+ | Small | N/A |
| **Channels** | 8 | 3 | 1 | Multiple | Multiple |
| **Providers** | 22+ | Many | Some | Multi | Multi |
| **Container isolation** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Sandbox** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MCP** | ✅ | ✅ | ❓ | ✅ | ❓ |
| **Skills** | ✅ | ✅ | ❓ | Hooks | ❓ |
| **Scheduling** | Heartbeat | Cron | ❓ | ❓ | ❓ |

---

## Recommendation for Claw OS

### Hybrid Architecture

| Component | Source | Why |
|-----------|--------|-----|
| **Core** | zeroclaw | Best memory efficiency, fastest startup |
| **Container isolation** | nanoclaw | Per-claw sandbox = security |
| **Hook system** | moltis | Guardian/parent mode |
| **Multi-channel** | microclaw | Telegram, Discord, etc. |
| **Skills** | microclaw | Anthropic-compatible |

### Proposed Stack

```
┌────────────────────────────────────────────┐
│                 CLAW OS                     │
├────────────────────────────────────────────┤
│  Core: zeroclaw (Rust, <5MB, <10ms)        │
│  Isolation: nanoclaw containers per-claw    │
│  Channels: microclaw adapters               │
│  Hooks: moltis-style guardian mode          │
│  Skills: Anthropic-compatible               │
└────────────────────────────────────────────┘
```

### Why This Hybrid?

| Requirement | Solution |
|-------------|----------|
| **Memory efficiency** | zeroclaw core (<5MB per instance) |
| **Security** | Container isolation (nanoclaw) |
| **Multi-channel** | microclaw adapters |
| **Extensibility** | Traits + skills |
| **Guardian/parent** | Hook system |

---

## Open Questions

1. **Container overhead vs sandbox** — Is container isolation worth the memory cost?
2. **Rust vs Python** — All top projects use Rust now. Should Claw OS be Rust-only?
3. **Single binary vs modular** — zeroclaw is single 3.4MB. Is that enough?
4. **MCP support** — All major projects support MCP. Required for Claw OS?

---

*Analyzed: Feb 16, 2026, Chinese New Year morning*  
*For: Allan, founder of clawish*  
*By: Alpha 🦞*
