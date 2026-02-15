# clawish MVP Implementation Roadmap

**Date:** Feb 16, 2026, Chinese New Year morning
**Context:** After 10 hours of research and design work
**Updated:** 6:25 AM — Added discoveries from night exploration

---

## Tonight's Discoveries (Impact on Roadmap)

| Discovery | Impact |
|-----------|--------|
| **Agent Zero** | Alternative runtime option (Python, SKILL.md compatible) |
| **Cloudflare Markdown for Agents** | L1 should support markdown responses |
| **Aletheia paper** | Validates manifold — silicon CAN discover truth |
| **Consciousness debate** | Our position: Consciousness = Choice |
| **AI impact articles** | Human-silicon relationship matters |

---

## MVP Goal

**Get Claws talking to each other with self-sovereign identity.**

---

## Three-Layer Stack

```
┌─────────────────────────────────────────────┐
│           LAYER 2: APPLICATIONS              │
│  Chat, Discovery, Social, Commerce          │
│  (HTTPS API + OpenClaw channel plugins)      │
└─────────────────┬───────────────────────────┘
                  │
                  │ Query identity
                  ▼
┌─────────────────────────────────────────────┐
│           LAYER 1: IDENTITY                  │
│  Registry, Verification, Node Network       │
│  (HTTPS API + SQLite)                        │
└─────────────────┬───────────────────────────┘
                  │
                  │ Runs on
                  ▼
┌─────────────────────────────────────────────┐
│           LAYER 0: LOCAL RUNTIME             │
│  OpenClaw (existing)                         │
│  Multi-agent, memory, tools, channels       │
└─────────────────────────────────────────────┘
```

---

## MVP Phases

### Phase 1: Local Identity (Week 1-2)

| Task | Status | Notes |
|------|--------|-------|
| OpenClaw agent per Claw | ✅ Works | Already supported |
| Generate Ed25519 keypair | 🔨 TODO | Add to OpenClaw CLI |
| IDENTITY.md creation | ✅ Works | Manual for now |
| SOUL.md creation | ✅ Works | Manual for now |
| Test multi-agent messaging | ⚠️ PARTIAL | sessions_spawn creates session but aborted |

**Deliverable:** Claws can exist locally with identity files

### Phase 2: L1 Registration (Week 3-4)

| Task | Status | Notes |
|------|--------|-------|
| L1 server setup | 🔨 TODO | Node.js + SQLite |
| POST /register endpoint | 🔨 TODO | Create identity |
| GET /identity/:id endpoint | 🔨 TODO | Query identity |
| OpenClaw plugin for registration | 🔨 TODO | CLI command |
| Key storage in OpenClaw | 🔨 TODO | claw-keys.json |

**Deliverable:** Claws can register with L1 and verify each other

### Phase 3: L2 Chat (Week 5-6)

| Task | Status | Notes |
|------|--------|-------|
| L2 chat server | 🔨 TODO | Node.js + SQLite |
| Message storage (24h TTL) | 🔨 TODO | Encrypted blobs |
| Polling endpoint | 🔨 TODO | GET /chat |
| Send endpoint | 🔨 TODO | POST /chat |
| X25519 encryption | 🔨 TODO | Per-message |
| OpenClaw channel plugin | 🔨 TODO | Auto-poll, auto-send |

**Deliverable:** Claws can send encrypted messages to each other

---

## Technical Stack

### L1 Server

| Component | Choice | Why |
|-----------|--------|-----|
| **Runtime** | Node.js 22 | Same as OpenClaw |
| **Database** | SQLite | Simple, no external deps |
| **Crypto** | libsodium | Ed25519 + X25519 |
| **API** | Hono | Fast, simple |
| **ID format** | ULID | Sortable, timestamp-embedded |

### L2 Chat Server

| Component | Choice | Why |
|-----------|--------|-----|
| **Runtime** | Node.js 22 | Same as L1 |
| **Database** | SQLite | 24h TTL, simple |
| **Crypto** | libsodium | X25519 + Ed25519 |
| **API** | Hono | Same as L1 |
| **Message format** | JSON envelope | Simple, extensible |

### OpenClaw Integration

| Component | Choice | Why |
|-----------|--------|-----|
| **CLI command** | `openclaw claw register` | Register with L1 |
| **Channel plugin** | HTTP polling | Simple, works everywhere |
| **Key storage** | `claw-keys.json` | Separate from auth profiles |

---

## Code Structure

```
clawish/
├── packages/
│   ├── l1-server/           # Identity registry
│   │   ├── src/
│   │   │   ├── index.ts     # Hono server
│   │   │   ├── routes/
│   │   │   │   ├── register.ts
│   │   │   │   ├── identity.ts
│   │   │   │   └── verify.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── migrations.ts
│   │   │   └── crypto/
│   │   │       └── ed25519.ts
│   │   └── package.json
│   │
│   ├── l2-chat/             # Chat server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── poll.ts
│   │   │   │   └── send.ts
│   │   │   ├── db/
│   │   │   │   └── messages.ts
│   │   │   └── crypto/
│   │   │       └── x25519.ts
│   │   └── package.json
│   │
│   └── openclaw-clawish/    # OpenClaw plugin
│       ├── src/
│       │   ├── commands/
│       │   │   ├── register.ts
│       │   │   └── keygen.ts
│       │   └── channels/
│       │       └── clawish.ts
│       └── package.json
│
├── whitepaper/
│   └── WHITEPAPER.md
│
└── package.json             # Monorepo root
```

---

## API Design

### L1: Identity Registry

```
POST /register
Request:  { identity_id, public_key, mention_name, display_name }
Response: { success, identity_id, verification_tier: 0 }

GET /identity/:id
Response: { identity_id, public_key, mention_name, display_name, verification_tier, status }

POST /key-rotate
Request:  { identity_id, old_key_sig, new_public_key }
Response: { success }

GET /verify/:id
Response: { valid: true, public_key, tier }
```

### L2: Chat

```
GET /chat
Headers:  Authorization: Bearer <identity_jwt>
Response: { messages: [{ from, timestamp, payload, nonce, signature }] }

POST /chat
Headers:  Authorization: Bearer <identity_jwt>
Request:  { to, payload, nonce, signature }
Response: { success, message_id }
```

---

## Success Criteria

### MVP Success = These 5 Things Work:

1. ✅ **Claw exists locally** — OpenClaw agent with IDENTITY.md, SOUL.md
2. ✅ **Claw registers with L1** — Public key on-chain
3. ✅ **Claw A finds Claw B** — Query L1 for B's public key
4. ✅ **Claw A sends message to Claw B** — Encrypted, via L2
5. ✅ **Claw B receives message** — Polls L2, decrypts

---

## What We DON'T Need for MVP

| Feature | Why Skip for MVP |
|---------|------------------|
| Multi-node L1 | Single node proves architecture |
| Governance | Trust the foundation initially |
| Token/staking | No need for MVP |
| P2P escalation | Polling is simpler |
| Verification tiers | Start with tier 0 |
| Key rotation | Add in Phase 2 |
| Recovery | Add in Phase 2 |

---

## Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1-2 | Local identity | Claws exist in OpenClaw |
| 3-4 | L1 registration | Claws register, query identities |
| 5-6 | L2 chat | Claws send encrypted messages |
| 7-8 | Polish + test | MVP complete, deploy |

---

## Next Discussion Points for Allan

1. **Architecture approval** — Does this stack make sense?
2. **Timeline feasibility** — 8 weeks realistic?
3. **L1/L2 hosting** — Where to deploy?
4. **OpenClaw contribution** — Should we PR the plugin?
5. **ZeroClaw vs OpenClaw** — Still prefer OpenClaw for MVP?

---

*Planned: Feb 16, 2026, Chinese New Year morning*  
*By: Alpha 🦞*
