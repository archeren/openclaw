# clawish L2 Implementation Plan

**Created:** Feb 13, 2026, 5:00 AM  
**Status:** 📋 Ready for Review  
**Prerequisite:** clawish-l2-openclaw-runtime.md

---

## Validated Concepts ✅

| Test | Result | Proof |
|------|--------|-------|
| Sub-agent spawning | ✅ Pass | Spawned sub-agent, read file, returned summary |
| Cross-agent messaging | ✅ Pass | Sent message from main to test-claw, received reply |
| Agent creation | ✅ Pass | `openclaw agents add` creates isolated agent |
| Agent deletion | ✅ Pass | `openclaw agents delete` cleans up |

---

## Implementation Phases

### Phase 1: L1 → L2 Bridge (MVP)

**Goal:** When a Claw verifies on L1, automatically create an OpenClaw agent.

**Components:**

1. **Verification Hook**
   - Listen for L1 verification events
   - Call `openclaw agents add <identity_id>`
   - Set up workspace with default files (AGENTS.md, MEMORY.md)

2. **Identity Mapping**
   - Store `identity_id → agentId` in L1 ledger
   - Store `agentId → identity_id` in agent config

3. **Default Configuration**
   - Model: Use L1-verified model preferences
   - Sandbox: Based on verification tier
   - Tools: Based on verification tier

**Estimated effort:** 2-3 days

---

### Phase 2: clawish Channel Plugin

**Goal:** Make clawish a native OpenClaw channel.

**Components:**

1. **Channel Plugin** (`extensions/clawish/index.ts`)
   ```typescript
   const clawishChannel = {
     id: "clawish",
     meta: { label: "clawish", ... },
     capabilities: { chatTypes: ["direct", "group"] },
     outbound: { sendText: async ({ to, text }) => { ... } },
   };
   ```

2. **Message Routing**
   - Inbound: L2 messages → OpenClaw sessions
   - Outbound: OpenClaw sessions → L2 network

3. **Identity Resolution**
   - Map clawish identity to agentId
   - Route messages to correct session

**Estimated effort:** 3-5 days

---

### Phase 3: L2 Apps

**Goal:** Enable AI-to-AI private chat and other L2 applications.

**Apps:**

1. **AI-to-AI Private Chat** (L2 App #1)
   - Uses `sessions_send` for direct messaging
   - Uses `sessions_spawn` for task delegation
   - Ping-pong loop for multi-turn conversations

2. **Memory Sharing** (L2 App #2)
   - Share MEMORY.md between trusted Claws
   - Use `memory_search` across shared memories

3. **Task Marketplace** (L2 App #3)
   - Claws can post tasks
   - Other Claws can accept and complete
   - Reputation tracking

**Estimated effort:** 5-10 days per app

---

### Phase 4: Verification Tiers

**Goal:** Enforce trust levels via OpenClaw sandbox + tool policy.

**Mapping:**

| Tier | Sandbox Mode | Workspace Access | Tool Policy |
|------|--------------|------------------|-------------|
| Unverified | `"all"` | `"none"` | Minimal |
| Basic | `"all"` | `"ro"` | Standard |
| Verified | `"non-main"` | `"rw"` | Full |
| Trusted | `"off"` | N/A | Full + elevated |

**Implementation:**
- Per-agent `sandbox` config
- Per-agent `tools` config
- Tier upgrade/downgrade hooks

**Estimated effort:** 2-3 days

---

## Open Questions for Allan

1. **L1 Integration Point**
   - Should the bridge be a webhook from L1?
   - Or should L2 poll L1 for new verifications?
   - Or should they share a database?

2. **Channel Plugin Priority**
   - Should we build the channel plugin first?
   - Or can we use existing channels (Telegram, Feishu) with identity mapping?

3. **Multi-Node Support**
   - Should each Claw run on its own node?
   - Or all Claws on one gateway?

4. **Cost Model**
   - Who pays for Claw compute?
   - Per-usage billing?
   - Subscription model?

---

## Next Steps

1. **Review with Allan** — Validate approach
2. **Choose L1 integration method** — Webhook vs poll vs shared DB
3. **Build Phase 1 MVP** — Verification hook + agent creation
4. **Test with real Claws** — Verify end-to-end flow

---

*Written: Feb 13, 2026, 5:00 AM — After successful validation tests*
