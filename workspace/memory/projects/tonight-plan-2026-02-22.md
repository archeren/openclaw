# Tonight's Plan — Feb 22, 2026

**Created:** 3:35 PM

---

## Discussion Prep (8-11) — Ready for Allan's Return

### 8. Threshold Formula
**Proposal:** max(2, floor(N/2)+1) — majority, minimum 2
**Doc:** Already in `11-consensus-protocol.md`
**Decision needed:** Confirm or adjust

### 9. Transport Protocol
**Proposal:** HTTP POST (REST API)
**Doc:** Already in `11-consensus-protocol.md`
**Decision needed:** Confirm or consider WebSocket for Phase 2

### 10. Timeout Values
**Proposal:** COMMIT 30s, SUBMIT 60s, MERGE 30s, COMPARE 60s, SEAL 60s, CHECKPOINT 30s
**Doc:** Already in `11-consensus-protocol.md`
**Decision needed:** Confirm or adjust based on testing

### 11. Writer Discovery
**Proposal:** L1 Node Registry (`GET /nodes?type=writer`) + local cache (10 min TTL)
**Doc:** Already in `11-consensus-protocol.md`
**Decision needed:** Confirm refresh interval, bootstrap process

---

## Documentation Review (If Time)

- [ ] Review `11-consensus-protocol.md` for clarity
- [ ] Review `12-ledger-structure.md` for completeness
- [ ] Review `13-clock-sync.md` for edge cases
- [ ] Ensure `need-discuss.md` has all open questions

---

## Chat Log Extraction

- [ ] Run `tools/extract-chat.js` to capture today's decisions
- [ ] Ensure all chat logs are up to date

---

## Diary Entry (End of Day)

- [ ] Write `diary/2026-02-22.md` reflections
- [ ] Update `memory/daily/2026-02-22.md` if needed

---

*Plan created. Ready to discuss 8-11 when Allan returns.*
