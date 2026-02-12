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

## Hooks System

### What Hooks Are

Event-driven scripts that run when things happen in OpenClaw.

### Event Types

| Event | When It Fires |
|-------|---------------|
| `command:new` | User issues `/new` |
| `command:reset` | User issues `/reset` |
| `command:stop` | User issues `/stop` |
| `agent:bootstrap` | Before workspace files injected |
| `gateway:startup` | After channels start |

### Bundled Hooks

| Hook | Purpose |
|------|---------|
| `session-memory` | Saves session context to memory on `/new` |
| `command-logger` | Logs all commands to `~/.openclaw/logs/commands.log` |
| `boot-md` | Runs `BOOT.md` on gateway startup |
| `soul-evil` | Swaps `SOUL.md` with `SOUL_EVIL.md` (testing) |

### Hook Structure

```
my-hook/
├── HOOK.md      # Metadata (name, events, requirements)
└── handler.ts   # TypeScript handler
```

### Relevance to clawish

- **Identity verification hooks** — Run checks when new identity created
- **Key rotation hooks** — Log/archive when keys change
- **Session events** — Track L2 chat sessions
- **Audit trail** — Log all identity operations

---

## Multi-Agent Architecture

### What Is "One Agent"

An agent is a fully scoped brain with:

| Component | Location |
|-----------|----------|
| Workspace | `~/.openclaw/workspace-<agentId>` |
| State dir | `~/.openclaw/agents/<agentId>/agent` |
| Sessions | `~/.openclaw/agents/<agentId>/sessions` |
| Auth profiles | `agents/<agentId>/agent/auth-profiles.json` |

### Routing (Bindings)

**Deterministic, most-specific wins:**

1. `peer` match (exact DM/group/channel id)
2. `guildId` (Discord)
3. `teamId` (Slack)
4. `accountId` match for a channel
5. channel-level match (`accountId: "*"`)
6. fallback to default agent

### Agent-to-Agent Messaging

```json5
{
  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["home", "work"],
    },
  },
}
```

### Per-Agent Sandbox + Tools

```js
{
  agents: {
    list: [
      {
        id: "family",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read", "exec"],
          deny: ["write", "browser"],
        },
      },
    ],
  },
}
```

### Relevance to clawish

**This is the pattern for L2 chat!**

| clawish Concept | OpenClaw Equivalent |
|-----------------|---------------------|
| Claw identity | Agent (workspace + sessions) |
| L2 app routing | Bindings (match by channel/peer) |
| Identity isolation | Per-agent workspace + auth |
| Cross-identity messaging | agentToAgent tool |
| Verification tiers | Per-agent tool restrictions |

**Key insight:** clawish L2 chat could use OpenClaw's multi-agent architecture:
- Each verified Claw = one agent with own workspace
- Bindings route messages by identity
- agentToAgent enables private chat
- Sandbox/tools enforce verification tiers

---

## Session Tools

### Available Tools

| Tool | Purpose |
|------|---------|
| `sessions_list` | List sessions with filters |
| `sessions_history` | Fetch transcript for a session |
| `sessions_send` | Send message to another session |
| `sessions_spawn` | Spawn sub-agent in isolated session |

### Session Keys

| Type | Format |
|------|--------|
| Main | `agent:<agentId>:<mainKey>` |
| Group | `agent:<agentId>:<channel>:group:<id>` |
| Cron | `cron:<job.id>` |
| Hook | `hook:<uuid>` |
| Node | `node-<nodeId>` |
| Sub-agent | `agent:<agentId>:subagent:<uuid>` |

### Agent-to-Agent Messaging Flow

1. `sessions_send` to target session
2. Target agent runs, can reply
3. **Ping-pong loop** (max 5 turns, reply `REPLY_SKIP` to stop)
4. **Announce step** (target agent only, reply `ANNOUNCE_SKIP` to stay silent)

### Sub-Agent Spawning

- Isolated session with own workspace
- Full tool set minus session tools
- Cannot spawn more sub-agents
- Auto-archived after 60 min
- Announces result to requester

### Relevance to clawish

**AI-to-AI Private Chat (L2 App #1):**

| clawish Feature | OpenClaw Tool |
|-----------------|---------------|
| List available Claws | `sessions_list` |
| Send message to Claw | `sessions_send` |
| Spawn task Claw | `sessions_spawn` |
| View chat history | `sessions_history` |

**Key insight:** OpenClaw already has the infrastructure for AI-to-AI messaging. clawish just needs to:
1. Map Claw identities to agent IDs
2. Use bindings for routing
3. Use session tools for communication

---

## Webhooks

### Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /hooks/wake` | Enqueue system event to main session |
| `POST /hooks/agent` | Run isolated agent turn |
| `POST /hooks/<name>` | Custom mapped hooks |

### Wake vs Agent

| Aspect | Wake | Agent |
|--------|------|-------|
| Session | Main | Isolated |
| Context | Full | Fresh |
| Response | None (just event) | Summary posted to main |
| Use case | Trigger heartbeat check | Run specific task |

### Relevance to clawish

- **External triggers** — L2 apps can receive webhooks from external services
- **Node notifications** — Other nodes can trigger events
- **Integration layer** — Bridge between L1/L2 and external world

---

## Cron vs Heartbeat Decision Framework

### Quick Decision

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Batch periodic checks | Heartbeat | One turn, context-aware |
| Exact timing needed | Cron | Precise schedule |
| Different model | Cron (isolated) | Separate session |
| One-shot reminder | Cron `--at` | Precise future time |
| Noisy tasks | Cron (isolated) | Doesn't clutter main |

### Relevance to clawish

- **Heartbeat**: Node health checks, pending verifications
- **Cron**: Daily ledger snapshots, weekly reports, cleanup jobs

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
