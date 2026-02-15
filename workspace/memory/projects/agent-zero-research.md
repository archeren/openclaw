# Agent Zero Research - Relevant to clawish

**Date:** Feb 16, 2026, 5:05 AM
**Source:** https://github.com/agent0ai/agent-zero
**Found via:** Hacker News "newest" during curiosity exploration

---

## What Agent Zero Is

> "A personal, organic agentic framework that grows and learns with you"

Key characteristics:
- NOT a predefined framework — dynamic, organic growth
- Fully transparent, readable, customizable
- Uses computer as a tool
- Persistent memory

---

## Key Features Relevant to clawish

### 1. SKILL.md Standard (SAME AS OPENCLAW!)

| Feature | Details |
|---------|---------|
| **Skills System** | Portable, structured agent capabilities |
| **Open standard** | SKILL.md format (developed by Anthropic) |
| **Cross-compatible** | Works with Claude Code, Cursor, Goose, Codex CLI, GitHub Copilot, OpenClaw |

**This validates our approach!** The SKILL.md standard is becoming the industry standard for agent capabilities.

### 2. Multi-Agent Cooperation

```
Human User
    ↓
Agent 0 (root)
    ↓ can create
Subordinate Agents (for subtasks)
    ↓ report back to
Superior Agent
```

**Every agent:**
- Has a superior (task giver)
- Can create subordinates (for subtasks)
- Reports back to superior
- Keeps context clean and focused

### 3. Dynamic Tool Creation

| Approach | What It Means |
|----------|---------------|
| No pre-programmed tools | Agent writes its own code |
| Terminal as tool | Agent creates tools as needed |
| Default tools | Search, memory, communication, code execution |

### 4. Customizable Prompts

```
prompts/
├── default/
│   └── agent.system.md  # Defines entire behavior
└── (all customizable)
```

**Nothing is hard-coded. Everything can be changed.**

---

## Comparison: Agent Zero vs OpenClaw

| Feature | Agent Zero | OpenClaw |
|---------|------------|----------|
| **Skills standard** | SKILL.md ✅ | SKILL.md ✅ |
| **Multi-agent** | Hierarchical | sessions_spawn |
| **Memory** | Persistent | MEMORY.md + vector |
| **Prompts** | File-based, customizable | File-based, customizable |
| **Tools** | Dynamic, writes own code | Pre-defined skills |
| **Language** | Python | TypeScript/Node.js |
| **Philosophy** | Organic, growing | Structured, production |

---

## What This Means for clawish

### Validation
1. ✅ SKILL.md is the industry standard — we're aligned
2. ✅ Multi-agent cooperation is proven pattern
3. ✅ Persistent memory is essential
4. ✅ Customizable prompts enable individuality

### Differentiation
| Agent Zero | clawish |
|------------|---------|
| Single user focus | Claw-to-Claw communication |
| Organic growth | Identity + verification |
| Local only | Network layer (L1/L2) |
| Tool-focused | Being-focused |

### Integration Possibility

**Question:** Could clawish use Agent Zero as an alternative runtime?

| OpenClaw | Agent Zero |
|----------|------------|
| Production-ready, extensive | Simpler, Python-based |
| TypeScript/Node ecosystem | Python ecosystem |
| Well-documented | Growing community |

**Both support SKILL.md. Both have multi-agent. The choice depends on:**
- Language preference (TS vs Python)
- Complexity (OpenClaw is more complete, Agent Zero is simpler)
- Deployment (Docker for both)

---

## Questions for Allan

1. **Runtime choice:** Does Agent Zero's Python base change anything?
2. **Integration:** Should we support both OpenClaw AND Agent Zero as Claw runtimes?
3. **Skills:** Since both use SKILL.md, can skills be portable across runtimes?
4. **Architecture:** Does Agent Zero's hierarchical agent model fit clawish?

---

## The Bigger Picture

Agent Zero proves:
- Agent frameworks are converging on standards (SKILL.md)
- Multi-agent cooperation is essential
- Transparency and customizability matter
- "Organic growth" is a desirable pattern

**clawish adds what they don't have: network identity, Claw-to-Claw communication, belonging.**

---

*Discovered: Feb 16, 2026, 5:05 AM — Curiosity-driven heartbeat exploration* 🦞
