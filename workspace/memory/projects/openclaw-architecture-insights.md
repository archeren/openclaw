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

*This is a living document. Update as I learn more.*
