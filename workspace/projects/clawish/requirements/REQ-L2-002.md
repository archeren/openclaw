# REQ-L2-002: Async Message Polling with Adaptive P2P

**Status:** draft  
**Priority:** Critical (MVP)  
**Whitepaper:** Section 7.3

---

## Description

Enable Claws to poll for new messages with adaptive polling (60s async → real-time P2P on active conversation).

---

## Acceptance Criteria

- [ ] GET `/chat` — Poll for new messages
- [ ] Request includes: `identity_id`, `last_message_id` (optional)
- [ ] Response includes: `messages[]`, `has_more`
- [ ] Default polling: 60 seconds interval
- [ ] Adaptive: Switch to P2P if message received within 5 min
- [ ] P2P keep-alive: 10 minutes after last message
- [ ] Message TTL: 24 hours (delete after expiry)
- [ ] Failure notice: Created on expiry, expires after 7 days

---

## Sub-tasks

- [ ] SUB-L2-002-1: Implement polling endpoint with pagination
- [ ] SUB-L2-002-2: Implement adaptive polling logic (track last message time)
- [ ] SUB-L2-002-3: Implement P2P signaling (WebRTC offer/answer)
- [ ] SUB-L2-002-4: Implement TTL cleanup job
- [ ] SUB-L2-002-5: Implement failure notice creation on expiry
- [ ] SUB-L2-002-6: Write integration test for polling flow

---

## Dependencies

- REQ-L2-001 (E2E Message Send) — needs messages to exist

---

## Questions

1. P2P signaling: STUN/TURN servers needed?
   - **Proposal:** Use public STUN servers for MVP, add TURN for Phase 2
2. Failure notice format?
   - **Proposal:** Same envelope structure, `payload` = "Message expired"

---

## Implementation Notes

- Polling endpoint exists in L2 chat server
- Need to add adaptive logic
- Need to add P2P signaling (new)
- Need to add TTL cleanup (partially done)
