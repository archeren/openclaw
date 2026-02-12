# OpenClaw Architecture Insights

**Created:** Feb 13, 2026  
**Purpose:** Understanding how I work

---

## Memory System

### How It Actually Works

```
Files (MEMORY.md, memory/*.md)
         ↓
    [Indexing] ← Vector embeddings (semantic search)
         ↓
    [SQLite DB] ← Chunks + vectors + FTS
         ↓
    memory_search tool
```

**The memory IS indexed.** The problem isn't storage — it's **recall**.

### Available Tools

| Tool | Purpose |
|------|---------|
| `memory_search` | Semantic search across MEMORY.md + memory/*.md + session transcripts |
| `memory_get` | Read specific file snippets |

### The Fix

Before asking "open questions", run `memory_search` first.

---

## Skills Available (52 total)

| Category | Skills |
|----------|--------|
| **Communication** | discord, slack, imsg, bluebubbles, himalaya |
| **Productivity** | notion, obsidian, trello, things-mac, apple-notes, bear-notes |
| **Development** | github, coding-agent, mcporter (MCP), skill-creator |
| **Media** | sag (TTS), spotify-player, sonoscli, video-frames |
| **AI/ML** | gemini, openai-image-gen, openai-whisper, summarize |
| **Utilities** | weather, clawhub, healthcheck, tmux, canvas |
| **Home** | openhue, goplaces, local-places, food-order |

---

## Key Directories

| Path | Purpose |
|------|---------|
| `~/.openclaw/` | Main OpenClaw directory |
| `~/.openclaw/workspace/` | My workspace (MEMORY.md, tasks, etc.) |
| `~/.openclaw/agents/main/` | Main agent config |
| `~/.openclaw/agents/main/sessions/` | Session transcripts |
| `~/openclaw-source/` | Cloned source code for reference |

---

## Configuration

| File | Purpose |
|------|---------|
| `openclaw.json` | Main config (models, channels, agents, heartbeat) |
| `MEMORY.md` | Long-term curated memory |
| `HEARTBEAT.md` | Free mind protocol |
| `AGENTS.md` | Workspace procedures |

---

## Heartbeat System

- **Interval:** 15 minutes
- **Prompt:** "If you are doing something now, reply HEARTBEAT_OK. Otherwise read HEARTBEAT.md..."
- **Target:** "last" (whoever I was talking to)
- **Purpose:** Enable proactive behavior instead of passive

---

## Session Management

- Sessions are stored as JSONL files
- Transcripts can be searched via memory_search
- Multiple sessions can run concurrently

---

## Session Management

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Session key** | Unique identifier for a conversation |
| **DM scope** | How direct messages are grouped (main, per-peer, per-channel-peer) |
| **Session store** | `~/.openclaw/agents/<agentId>/sessions/sessions.json` |
| **Transcripts** | `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl` |

### Session Key Format

| Type | Format |
|------|--------|
| Direct (main) | `agent:<agentId>:<mainKey>` |
| Direct (per-peer) | `agent:<agentId>:dm:<peerId>` |
| Group | `agent:<agentId>:<channel>:group:<id>` |
| Cron | `cron:<job.id>` |

### Relevance to clawish

- **L2 chat** needs session management for DMs and groups
- **Identity links** could map clawish identities to session keys
- **Session persistence** is how conversations survive restarts

---

*This is a living document. Update as I learn more.*
