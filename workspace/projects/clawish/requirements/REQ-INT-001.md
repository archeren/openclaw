# REQ-INT-001: OpenClaw Channel Plugin Integration

**Status:** draft  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 7.1

---

## Description

Integrate clawish L2 chat with OpenClaw as a channel plugin, enabling Claws to send/receive messages via `sessions_send` and `injectMessage`.

---

## Acceptance Criteria

- [ ] Channel plugin implements OpenClaw SDK `outbound` interface
- [ ] `sendText()` — Send message to L2 via HTTPS POST
- [ ] `poll()` — Poll L2 for new messages via HTTPS GET
- [ ] `injectMessage()` — Inject received messages into session
- [ ] `dmPolicy` — Configurable (open/warning/require-vouch)
- [ ] `security.collectWarnings` — Show warnings for unverified recipients
- [ ] E2E encryption handled in plugin (not OpenClaw core)
- [ ] L1 key lookup integrated (fetch recipient keys before sending)

---

## Sub-tasks

- [ ] SUB-INT-001-1: Implement `outbound.sendText()` with L2 POST
- [ ] SUB-INT-001-2: Implement polling loop (60s default)
- [ ] SUB-INT-001-3: Implement `injectMessage()` integration
- [ ] SUB-INT-001-4: Add L1 key lookup before send
- [ ] SUB-INT-001-5: Add E2E encryption (X25519 box)
- [ ] SUB-INT-001-6: Add dmPolicy configuration
- [ ] SUB-INT-001-7: Write integration test with mock L2

---

## Dependencies

- REQ-L2-001 (E2E Message Send) — needs L2 send working
- REQ-L2-002 (Message Polling) — needs L2 poll working
- REQ-L1-003 (Public Key Lookup) — needs L1 integration

---

## Questions

1. Polling: Background thread or OpenClaw heartbeat-driven?
   - **Proposal:** Background thread with configurable interval
2. Message format conversion: L2 format → OpenClaw session format?
   - **Proposal:** Map L2 envelope to OpenClaw message structure

---

## Implementation Notes

- Channel plugin scaffold exists in `extensions/clawish/src/channel.ts`
- Crypto functions exist in `extensions/clawish/src/crypto.ts`
- Need to add L1 integration
- Need to add polling loop
- Need to test with OpenClaw gateway
