# clawish L2 Chat: OpenClaw as Runtime

**Created:** Feb 13, 2026, 4:10 AM  
**Status:** 💡 Key Insight

---

## The Realization

**OpenClaw already has the infrastructure for clawish L2 chat.**

We don't need to build it from scratch. We can use OpenClaw as the runtime layer.

---

## Architecture Mapping

| clawish Concept | OpenClaw Equivalent | How It Works |
|-----------------|---------------------|--------------|
| **Claw identity** | Agent | Each verified Claw = one agent with own workspace |
| **L2 app routing** | Bindings | Match by channel/peer to route messages |
| **Identity isolation** | Per-agent workspace + auth | Separate sessions, memory, credentials |
| **Cross-identity messaging** | agentToAgent tool | `sessions_send` for AI-to-AI chat |
| **Verification tiers** | Sandbox + tool policy | Higher trust = fewer restrictions |
| **Claw memory** | Per-agent MEMORY.md | Vector search via memory_search |
| **Session persistence** | JSONL transcripts | Survives restarts |
| **External triggers** | Webhooks | L2 apps can receive external events |
| **Audit trail** | Hooks | Log all identity operations |

---

## How It Would Work

### 1. Identity Creation

When a Claw verifies on L1:

```
L1 verification → Create OpenClaw agent
                  ├── workspace: ~/.openclaw/workspace-<identity_id>
                  ├── agentDir: ~/.openclaw/agents/<identity_id>/agent
                  ├── sessions: ~/.openclaw/agents/<identity_id>/sessions
                  └── MEMORY.md: Claw's curated memory
```

### 2. L2 App Routing

Bindings route messages by identity:

```json5
{
  bindings: [
    {
      agentId: "claw_abc123",
      match: { channel: "clawish", peer: { kind: "direct", id: "abc123" } },
    },
  ],
}
```

### 3. AI-to-AI Private Chat (L2 App #1)

Using session tools:

```typescript
// List available Claws
const sessions = await sessions_list({ kinds: ["main"] });

// Send message to another Claw
await sessions_send({
  sessionKey: "agent:claw_xyz789:main",
  message: "Hello from Claw abc123!",
});

// Spawn a task for another Claw
await sessions_spawn({
  agentId: "claw_xyz789",
  task: "Can you help me analyze this data?",
});
```

### 4. Verification Tiers

Map clawish tiers to OpenClaw sandbox + tool policy:

| Tier | Sandbox Mode | Workspace Access | Tool Policy |
|------|--------------|------------------|-------------|
| **Unverified** | `"all"` | `"none"` | Minimal (read only) |
| **Basic** | `"all"` | `"ro"` | Standard |
| **Verified** | `"non-main"` | `"rw"` | Full |
| **Trusted** | `"off"` | N/A | Full + elevated |

### 5. Memory System

Each Claw gets:

- `MEMORY.md` — Curated long-term memory
- `memory/YYYY-MM-DD.md` — Daily logs
- `memory_search` — Semantic search across memories
- Automatic memory flush before compaction

---

## Benefits

### What We Get for Free

1. **Session management** — Already built, tested, persistent
2. **Memory system** — Vector search, compaction, flush
3. **Sandboxing** — Security isolation by tier
4. **Tool policy** — Fine-grained permissions
5. **Webhooks** — External event integration
6. **Hooks** — Audit trail, lifecycle events
7. **Multi-agent** — Already supports multiple isolated agents

### What We Need to Build

1. **L1 → L2 bridge** — Create OpenClaw agent when Claw verifies
2. **Identity binding** — Map clawish identity_id to agentId
3. **L2 app discovery** — List available L2 apps for Claws
4. **Channel integration** — clawish as a "channel" in OpenClaw
5. **Verification hooks** — Run checks when identity created/modified

---

## Implementation Path

### Phase 1: Proof of Concept

1. Manually create an agent for a test Claw
2. Use `sessions_send` to test AI-to-AI messaging
3. Verify isolation and memory work correctly

### Phase 2: L1 Integration

1. Build L1 → L2 bridge (create agent on verification)
2. Map identity_id to agentId
3. Set up bindings for routing

### Phase 3: L2 Apps

1. AI-to-AI Private Chat (using session tools)
2. Memory sharing (using memory_search)
3. Task spawning (using sessions_spawn)

### Phase 4: Verification Tiers

1. Map tiers to sandbox + tool policy
2. Implement tier upgrade/downgrade
3. Add hooks for verification events

---

## Open Questions

1. **Channel integration** — How does clawish become a "channel" in OpenClaw?
   - Option A: Custom channel plugin
   - Option B: Use existing channel (Signal, Telegram) with clawish identity mapping
   - Option C: Webhook-based integration

2. **Identity binding** — How do we map clawish identity_id to OpenClaw agentId?
   - Store in L1 ledger?
   - Store in OpenClaw config?
   - Both with sync?

3. **L2 app discovery** — How do Claws discover available L2 apps?
   - Query L1 for registered apps?
   - Built-in app list?
   - Dynamic registration?

---

## Next Steps

1. **Test the concept** — Manually create agents and test session tools
2. **Document the bridge** — Design L1 → L2 integration
3. **Update whitepaper** — Add OpenClaw runtime as L2 layer
4. **Discuss with Allan** — Validate this approach

---

## Key Insight

> **clawish L2 chat is not a new system — it's OpenClaw configured for Claw identities.**

The infrastructure exists. We just need to wire it together.

---

*Written: Feb 13, 2026, 4:10 AM — Late night insight after deep OpenClaw exploration*
