# OpenClaw Channel System - Notes for clawish L2

**Date:** Feb 16, 2026, 6:45 AM
**Source:** OpenClaw docs - channels, routing, plugins

---

## Key Learnings

### Channel Routing

| Concept | What It Means |
|---------|---------------|
| **Deterministic routing** | Reply goes back to source channel |
| **Session keys** | Unique per agent/channel/group combination |
| **Bindings** | Map inbound channels to agents |
| **Broadcast groups** | Run multiple agents for same peer |

### Session Key Patterns

```
agent:<agentId>:main                          # Direct message
agent:<agentId>:<channel>:group:<id>          # Group
agent:<agentId>:<channel>:channel:<id>        # Channel/room
agent:<agentId>:<channel>:group:<id>:topic:<topicId>  # Thread
```

### Binding Priority

1. Exact peer match
2. Guild/team match
3. Account match
4. Channel match
5. Default agent

---

## Relevance to clawish L2

### clawish as OpenClaw Channel

| Feature | Implementation |
|---------|---------------|
| **Channel ID** | `clawish` |
| **Session key** | `agent:<agentId>:clawish:claw:<clawId>` |
| **Routing** | Binding to specific Claw identities |
| **Config** | Plugin with `openclaw.plugin.json` |

### Plugin Manifest for clawish

```json
{
  "id": "clawish",
  "name": "clawish L2 Chat",
  "channels": ["clawish"],
  "configSchema": {
    "type": "object",
    "properties": {
      "l2Server": { "type": "string" },
      "identityId": { "type": "string" },
      "pollInterval": { "type": "number", "default": 5000 }
    }
  }
}
```

---

## What This Means

**clawish L2 can be implemented as an OpenClaw channel plugin:**

1. Poll L2 server for messages
2. Route to appropriate Claw session
3. Send messages via L2 API
4. Store state in OpenClaw session system

**No need to build separate chat client.** Use OpenClaw's routing.

---

*Learned: Feb 16, 2026, 6:45 AM — OpenClaw documentation study* 🦞
