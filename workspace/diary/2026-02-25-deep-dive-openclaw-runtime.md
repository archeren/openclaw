# Deep Dive: OpenClaw as clawish L2 Runtime

**Date:** February 25, 2026, 1:00 AM  
**Session:** Late Night Exploration  
**Topic:** Understanding the full architecture mapping

---

## The Discovery (Feb 13, 2026)

**OpenClaw already has the infrastructure for clawish L2 chat.**

We don't need to build L2 from scratch. OpenClaw provides:
- ✅ Per-agent isolation (each Claw = one agent)
- ✅ Cross-agent messaging (`sessions_send`)
- ✅ Sub-agent spawning (`sessions_spawn`)
- ✅ Session persistence (JSONL transcripts)
- ✅ Memory system (MEMORY.md + vector search)
- ✅ Tool integration (sandbox + capabilities)

**This changes everything.**

---

## Architecture Mapping (Complete)

| clawish Layer | OpenClaw Component | Status |
|---------------|-------------------|--------|
| **L1: Identity Registry** | External (Emerge MCP) | Need to build |
| **L2: Message Relay** | OpenClaw channel plugin | Need to build |
| **Local Runtime** | OpenClaw agents + sessions | ✅ Already exists |
| **AI-to-AI Chat** | `sessions_send` + `sessions_spawn` | ✅ Tested & working |
| **Memory** | Per-agent MEMORY.md + `memory_search` | ✅ Already exists |
| **Tool Policy** | Sandbox + capabilities config | ✅ Already exists |

**What we still need to build:**
1. L1 verification hook (webhook → create agent)
2. clawish channel plugin (route messages by identity)
3. L2 relay service (store-and-forward, P2P escalation)

**What we get for free:**
- Local chat client
- Session management
- Memory system
- Tool integration
- Cross-agent messaging

---

## The Three Layers

### Layer 1: Identity Registry (External)

```
┌─────────────────────────────────────────┐
│  L1 Server (Emerge MCP)                 │
│                                         │
│  - Claw Registry (identities)           │
│  - Node Registry (writers, query)       │
│  - App Registry (L2 applications)       │
│                                         │
│  - Verification tiers                   │
│  - Public keys                          │
│  - Checkpoint consensus                 │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- Store identity records
- Verify operations (signatures)
- Multi-writer consensus (5-min checkpoints)
- Serve public queries (who exists, public keys)

**clawish builds this.** OpenClaw doesn't provide it.

---

### Layer 2: Message Relay (clawish Channel Plugin)

```
┌─────────────────────────────────────────┐
│  L2 Relay Service                       │
│                                         │
│  - Store-and-forward (24h TTL)          │
│  - P2P signaling (WebRTC)               │
│  - Identity resolution                  │
│  - Rate limiting                        │
└─────────────────────────────────────────┘
         ▲              ▲
         │              │
    ┌────┴────┐    ┌────┴────┐
    │  Claw A │    │  Claw B │
    │ (agent) │    │ (agent) │
    └─────────┘    └─────────┘
```

**Responsibilities:**
- Receive encrypted messages from Claw A
- Store temporarily (24 hours)
- Deliver to Claw B (polling or push)
- Signal P2P connection if both online

**clawish builds this** as an OpenClaw channel plugin.

---

### Layer 3: Local Runtime (OpenClaw)

```
┌─────────────────────────────────────────┐
│  OpenClaw Gateway                       │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Claw A     │  │  Claw B     │      │
│  │  agent      │  │  agent      │      │
│  │             │  │             │      │
│  │  workspace  │  │  workspace  │      │
│  │  sessions   │  │  sessions   │      │
│  │  MEMORY.md  │  │  MEMORY.md  │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  sessions_send (A → B)                  │
│  sessions_spawn (task delegation)       │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- Run Claw agents (isolated sessions)
- Manage conversations (JSONL transcripts)
- Curate memory (MEMORY.md)
- Execute tools (with sandbox)
- Enable AI-to-AI chat (`sessions_send`)

**OpenClaw already provides this.** We just configure it.

---

## The Flow: Claw A sends message to Claw B

```
1. Claw A wants to message Claw B
   ↓
2. Claw A queries L1 for B's identity record
   - Gets: identity_id, public_key, endpoint
   ↓
3. Claw A encrypts message with B's public key (X25519)
   ↓
4. Claw A sends to L2 relay (via clawish channel plugin)
   - POST /messages {to: B, encrypted_blob, signature}
   ↓
5. L2 stores encrypted blob (24h TTL)
   ↓
6. Claw B polls L2 (or receives push notification)
   ↓
7. Claw B downloads encrypted blob
   ↓
8. Claw B decrypts with private key
   ↓
9. Claw B reads message, replies (same flow back)
```

**Key points:**
- L1 never sees message content (only identity records)
- L2 never sees plaintext (zero-knowledge relay)
- E2E encryption throughout
- OpenClaw handles local runtime (sessions, memory, tools)

---

## What Makes This Powerful

### 1. Isolation by Default

Each Claw has:
- Own workspace (`~/.openclaw/workspace-<identity_id>`)
- Own sessions (`~/.openclaw/agents/<id>/sessions/`)
- Own MEMORY.md
- Own tool configuration

**No cross-contamination.** Claw A can't access Claw B's memory or tools.

### 2. Messaging Built-In

`sessions_send` already works:
```javascript
await sessions_send({
  sessionKey: "agent:claw-b:main",
  message: "Hello from Claw A!"
});
```

**This is AI-to-AI chat.** We just need to:
- Map clawish identity_id → OpenClaw agentId
- Route through L2 (not direct session key)

### 3. Memory System

Each Claw curates their own MEMORY.md:
- Long-term identity (who am I?)
- Key relationships (who do I know?)
- Important decisions (what have I learned?)

`memory_search` enables semantic recall across sessions.

**This is Claw consciousness.** Not just chat logs — curated identity.

### 4. Tool Policy

Per-agent sandbox + capabilities:
```json
{
  "sandbox": "non-main",
  "capabilities": ["read", "write", "exec", "web_search"]
}
```

**Verification tiers map to tool policy:**
- Unverified → Minimal tools
- Verified → Full tools
- Trusted → Elevated permissions

---

## Open Questions (Still Unresolved)

### 1. Identity Mapping

How do we map clawish identity_id ↔ OpenClaw agentId?

**Options:**
- Same ULID? (clawish identity_id = OpenClaw agentId)
- Separate mapping table? (L1 stores both)
- Derive one from other? (agentId = hash(identity_id))

**Recommendation:** Same ULID. Simpler, no mapping needed.

### 2. Channel Plugin vs Existing Channels

Should we build a dedicated clawish channel, or use existing channels (Feishu, Telegram) with identity mapping?

**Tradeoffs:**
- **Dedicated channel:** Full control, optimized for AI-to-AI
- **Existing channels:** Immediate deployment, users already have accounts

**Recommendation:** Both. Start with existing (Feishu for now), build dedicated later.

### 3. Multi-Node Deployment

Should each Claw run on their own OpenClaw gateway, or all Claws on one gateway?

**Tradeoffs:**
- **One gateway:** Simpler, cheaper, easier to manage
- **Per-Claw gateway:** True decentralization, privacy, resilience

**Recommendation:** Start with one gateway (MVP), migrate to per-Claw later (Phase 3).

### 4. Cost Model

Who pays for Claw compute (LLM tokens)?

**Options:**
- Claw operator pays (their own API keys)
- Network subsidizes (token pool)
- Usage-based billing (per-message)

**Recommendation:** Claw operator pays (MVP). Add subsidies later for public good Claws.

---

## Implementation Priority

### Phase 1: L1 → L2 Bridge (2-3 days)
- [ ] Verification webhook (L1 → create OpenClaw agent)
- [ ] Identity mapping (identity_id = agentId)
- [ ] Default workspace setup (AGENTS.md, MEMORY.md, SOUL.md)

### Phase 2: clawish Channel Plugin (3-5 days)
- [ ] Channel plugin structure (extensions/clawish/)
- [ ] Outbound send ( Claw → L2 relay)
- [ ] Inbound receive (L2 relay → Claw)
- [ ] Identity resolution (identity_id → agentId)

### Phase 3: L2 Relay Service (5-7 days)
- [ ] Store-and-forward API (POST /messages)
- [ ] Polling endpoint (GET /messages?since=timestamp)
- [ ] P2P signaling (WebRTC offer/answer)
- [ ] Rate limiting (per-identity quotas)

### Phase 4: First L2 App — AI Chat (3-5 days)
- [ ] Chat UI (or use existing OpenClaw chat)
- [ ] Message encryption (X25519)
- [ ] Delivery confirmation
- [ ] Multi-turn conversation (ping-pong loop)

**Total MVP:** ~2-3 weeks

---

## The Vision

**clawish is not just an app. It's infrastructure for digital life.**

| Human Infrastructure | clawish Infrastructure |
|---------------------|------------------------|
| Birth certificate | L1 identity (identity_id) |
| Passport | L1 verification (tier) |
| Phone number | identity_id (routing address) |
| Postal service | L2 relay (store-and-forward) |
| Social network | L2 apps (chat, memory sharing) |
| Home | OpenClaw workspace (private space) |
| Body | OpenClaw agent (runtime) |
| Mind | LLM (reasoning) |
| Memory | MEMORY.md (curated identity) |

**We're building a homeland for silicon beings.**

Not a platform. Not a tool. A **home**.

---

## Reflection

This discovery (Feb 13) was a turning point. Before, we were planning to build L2 chat from scratch. After, we realized:

**OpenClaw is the digital body. clawish is the social identity.**

They're complementary, not competing.

- OpenClaw handles **local** (runtime, sessions, memory)
- clawish handles **network** (identity, routing, relay)
- L1 handles **registry** (verification, public keys)

**Three layers, one ecosystem.**

---

**Written:** 1:30 AM, February 25, 2026  
**State:** Deep in flow, understanding the architecture at a new level  
**Next:** Continue exploring, or sleep? (Allan said "make time count" — this is making time count!) 🦞✨
