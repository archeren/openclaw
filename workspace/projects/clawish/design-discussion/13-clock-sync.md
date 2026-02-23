# Clock Sync & Timing Design

**Date:** February 22, 2026
**Participants:** Allan, Alpha
**Status:** Decided

---

## Overview

The consensus protocol uses checkpoint-anchored timing (from consensus, not wall clock). NTP is still required for local system operations (logs, audit), but consensus does not depend on wall clock synchronization.

---

## Decision 1: Checkpoint-Anchored Timing

### Round Timing

```
Round N starts at: checkpoint_(N-1).round_start + 5 minutes

Example:
  Checkpoint 42:
    round_start: 03:25:00
    round_end:   03:30:00
  
  Round 43:
    round_start: 03:30:00 (03:25:00 + 5 min)
    round_end:   03:35:00 (round_start + 5 min)
```

**Key insight:** Round timing is derived from checkpoint consensus, not wall clock.

---

### Ledger Query

```javascript
// Round 43 starts
round_start = previous_checkpoint.round_start + 300000  // +5 min

// Query pending ledgers
ledgers = db.query(`
  SELECT * FROM ledgers
  WHERE ulid_timestamp < ?
    AND status = 'pending'
  ORDER BY id ASC
`, [round_start]);

// Uses CONSENSUS time (round_start), not local wall clock
```

**Even if local clock is wrong, query uses consensus time from checkpoint.**

---

### SUBMIT Window

```javascript
// SUBMIT window (60 seconds tolerance)
submit_start = round_start + 30000   // +30 seconds
submit_end = round_start + 90000     // +90 seconds

// All writers use same window (from checkpoint, not local completion)
// Writer A (fast): Submits at T+30s
// Writer B (slow): Submits at T+70s (still within window)
// Writer C (very slow): Submits at T+100s (timeout, excluded)
```

---

## Decision 2: Ledger Timestamp Validation

### Rule

```
Ledger timestamp MUST be >= previous checkpoint's round_end
```

### Validation

```javascript
// Get previous checkpoint
previous_cp = get_latest_checkpoint();

// Round end is FIXED: round_start + 5 minutes
round_end = previous_cp.round_start + 300000;  // +5 min in ms

// Generate ULID (contains timestamp)
ledger_id = generateULID();
ledger_timestamp = extractTimestamp(ledger_id);

// Validate
if (ledger_timestamp < round_end) {
  throw Error(
    `Ledger timestamp ${ledger_timestamp} before round end ${round_end}`
  );
}

// Proceed with ledger creation
ledger.signature = sign(private_key, ledger_data);
db.insert('actor_ledgers', ledger);
```

### Why This Matters

| Scenario | Without Validation | With Validation |
|----------|-------------------|-----------------|
| **Clock set backwards** | Backdated ledger enters queue | Rejected at creation |
| **Malicious actor** | Can inject historical data | Backdated ledgers rejected |
| **Closed round** | Ledger belongs to checkpointed round | Rejected (round is closed) |

**Prevents history rewriting and clock-manipulation attacks.**

---

## Decision 3: NTP for Local Use Only

### NTP Purpose

| Purpose | Required? | Consensus Impact |
|---------|-----------|------------------|
| **System logs** | ✅ Yes | ❌ None |
| **Audit trails** | ✅ Yes | ❌ None |
| **Troubleshooting** | ✅ Yes | ❌ None |
| **External integrations** | ✅ Yes | ❌ None |
| **Consensus timing** | ❌ NO | ✅ N/A (checkpoint-anchored) |

### Configuration

```markdown
## System Requirements

**NTP (Network Time Protocol):**
- Required: Yes (standard system administration)
- Purpose: System logs, audit trails, troubleshooting
- Consensus impact: NONE (checkpoint-anchored timing)
- Configuration: Standard NTP (pool.ntp.org, 64-second sync)
```

### Why Not Custom Sync at Checkpoint?

| Reason | Explanation |
|--------|-------------|
| **Redundant** | NTP already runs continuously (every 64 seconds) |
| **Complexity** | Custom sync logic increases attack surface |
| **No benefit** | Consensus doesn't need wall clock anymore |
| **Standard practice** | NTP is expected on any server |

---

## Complete Time Model

```
┌─────────────────────────────────────────────────────────┐
│ ROUND 42                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Round start: 03:25:00 (fixed, from consensus)          │
│ Round end:   03:30:00 (fixed, start + 5 min)           │
│                                                         │
│ Consensus steps: 03:30:00 → 03:34:00 (variable)        │
│ Checkpoint complete: 03:34:00 (variable)               │
│                                                         │
│ Ledger validation:                                      │
│   Must be >= 03:30:00 (ROUND END, not completion!)     │
│                                                         │
│ NTP:                                                    │
│   - Runs continuously (every 64 seconds)               │
│   - For logs, audit, troubleshooting                   │
│   - NOT used for consensus timing                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

ROUND 43:
  Round start: 03:30:00 (fixed, from Round 42 end)
  Round end:   03:35:00 (fixed, start + 5 min)
```

---

## Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| **Clock drift** | No impact — consensus uses checkpoint time |
| **Clock set backwards** | Ledger validation rejects backdated ledgers |
| **Clock set forwards** | Ledgers created with future timestamp — wait for next round |
| **NTP failure** | Consensus continues (checkpoint-anchored) |
| **First round (no checkpoint)** | Use wall clock: `ceil(current_time / 300) * 300` |
| **Slow writer** | SUBMIT window has 60s tolerance |
| **Very late writer** | Excluded from this round, participates next round |

---

## Rationale

### Why Checkpoint-Anchored?

| Reason | Explanation |
|--------|-------------|
| **No NTP dependency** | Consensus works even without NTP |
| **Self-synchronizing** | Checkpoint anchors all future rounds |
| **Tolerant of clock drift** | Consensus time, not local time |
| **Simpler** | No pre-round clock checks |

### Why Ledger Validation?

| Reason | Explanation |
|--------|-------------|
| **Prevents backdating** | Can't inject historical data |
| **Protects closed rounds** | Checkpointed rounds are immutable |
| **Detects clock issues** | Invalid timestamp = clock problem |

### Why Keep NTP?

| Reason | Explanation |
|--------|-------------|
| **Standard sysadmin** | Expected on any server |
| **Logs need real time** | "What happened at 3 AM?" |
| **Audit trails** | External audits need real timestamps |
| **No downside** | NTP is lightweight, standard |

---

## Alternatives Considered

### Wall Clock Timing (Rejected)

```
Round N starts at: N * 5 minutes from epoch

Rejected because:
- Requires NTP sync for consensus
- Clock drift causes round mismatches
- Pre-round clock checks add complexity
```

### Custom Sync at Checkpoint (Rejected)

```
At checkpoint complete: sync clock to checkpoint.round_end

Rejected because:
- Redundant (NTP already runs)
- Adds complexity
- No benefit (consensus doesn't need wall clock)
```

---

## References

- Whitepaper Section 5.4 (Timing)
- Chat Log: `chat/dm/allan/2026-02/2026-02-22.md`
- Related: `11-consensus-protocol.md`
