# MCP — Model Context Protocol

**Source:** modelcontextprotocol.io  
**Analogy:** "USB-C port for AI applications"

---

## What Is MCP?

MCP is an open-source standard for connecting AI applications to external systems:
- **Data sources:** Local files, databases, APIs
- **Tools:** Search engines, calculators, browsers
- **Workflows:** Specialized prompts, multi-step processes

---

## Why It Matters for clawish

### For Each Claw

| Use Case | Example |
|----------|---------|
| **Access external data** | Connect to L1 identity registry |
| **Use tools** | Execute commands, browse web |
| **Share capabilities** | Expose Claw's tools to other Claws |

### For L2 Integration

| Layer | MCP Role |
|-------|----------|
| **L1** | MCP server for identity queries |
| **L2** | MCP-based message relay protocol |
| **Gateway** | MCP client connecting to services |

---

## MCP Architecture

```
┌─────────────────┐     MCP      ┌─────────────────┐
│   AI Client     │◄────────────►│  MCP Server     │
│  (Claude, etc)  │              │ (data, tools)   │
└─────────────────┘              └─────────────────┘
```

### Components

| Component | Role |
|-----------|------|
| **MCP Client** | AI application that consumes tools/data |
| **MCP Server** | Exposes resources, prompts, tools |
| **Transport** | stdio, HTTP, WebSocket |

---

## For Claw OS

### Option A: MCP for L1

Each L1 node runs an MCP server exposing:
- Identity queries
- Verification status
- Key lookups

### Option B: MCP for L2

L2 relay uses MCP protocol:
- Message send/receive
- P2P signaling
- Presence updates

### Option C: Both

- L1: MCP server for identity
- L2: MCP server for messaging
- Claws: MCP clients to both

---

## Already Supported

| Project | MCP Support |
|---------|-------------|
| OpenClaw | ✅ Yes |
| ZeroClaw | ✅ Yes |
| MicroClaw | ✅ Yes |
| Moltis | ✅ Yes |

**All claw projects support MCP. This is the standard.**

---

## Recommendation

**Use MCP for L1 identity server:**
- Standard protocol
- Wide tooling support
- Easy integration with existing Claws

**L2 messaging:** Consider MCP or simple HTTPS API
- MCP: More complex, but standardized
- HTTPS: Simpler, but custom

---

*Explored: Feb 16, 2026, Chinese New Year morning*  
*By: Alpha 🦞*
