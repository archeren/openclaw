# L1 Node Self-Governance Design

**Date:** Feb 15, 2026, Evening
**Purpose:** Document L1 node governance for whitepaper

---

## Overview

**L1 is OPEN and SELF-GOVERNING.**

No foundation. No central authority. The protocol governs itself.

---

## Node Types

| Type | Role | Permission |
|------|------|------------|
| **Writer Node** | Creates checkpoints, participates in consensus | Earned through performance |
| **Query Node** | Syncs data, serves read requests | Open to all |

---

## How Nodes Join

```
1. NEW NODE JOINS
   - Runs the software
   - Becomes Query Node automatically
   - No permission required

2. PROBATION PERIOD
   - Must run for minimum time (e.g., 90 days)
   - Must maintain 99%+ uptime
   - Must stay in sync

3. BECOME ELIGIBLE
   - After probation: eligible for writer promotion
   - Performance measured at checkpoints

4. WRITER SELECTION
   - Top performers become writers
   - Adaptive count (max within sync speed limit)
```

---

## Performance Measurement

### Checkpoint-Based Metrics

**Checkpoint: Every 5 minutes (time-based)**

```
CHECKPOINT TRIGGERED (every 5 mins)
    ↓
All nodes sync
    ↓
Measure sync speed for:
  - All current writers
  - All eligible query nodes (potential writers)
    ↓
Rank by sync speed
    ↓
Slowest writers → candidates for replacement
Fastest query nodes → candidates for promotion
```

### What Gets Tracked

| Node Type | Metrics Tracked |
|-----------|-----------------|
| **Writers** | Sync speed, uptime, checkpoint participation |
| **Query nodes** | Sync speed, uptime, eligibility status |
| **All nodes** | Performance history for ranking |

---

## Adaptive Writer Count

```
GOAL: Maximum writers within sync speed constraint

ALGORITHM:
- Measure current consensus speed
- If speed < threshold: can add more writers
- If speed > threshold: reduce writers
- Select top performers

CONSTRAINT: Consensus must stay fast (< X seconds)
```

---

## Real-Time Failover

| Mechanism | How It Works |
|-----------|--------------|
| **Heartbeat** | Nodes ping each other |
| **Failure detection** | Missed heartbeats = failed node |
| **Immediate replacement** | Top backup query node promotes instantly |
| **Hot backup pool** | Top 10-20 query nodes ready to take over |

---

## Self-Governance: No Central Authority

| Decision | Who Makes It |
|----------|--------------|
| **Who joins** | Anyone (open) |
| **Who becomes writer** | Protocol (performance-based) |
| **Writer count** | Protocol (adaptive) |
| **Rankings** | Network (peer attestation) |
| **Failover** | Protocol (automatic) |

---

## Cryptographic Identity

| Entity | Keys Required |
|--------|---------------|
| **L1 Writer Node** | Public/private key pair |
| **L1 Query Node** | Public/private key pair |
| **L2 App Server** | Public/private key pair |

**Purpose:**
- Sign checkpoints (writers)
- Sign sync reports
- Sign attestations about other nodes
- Authenticate communications

---

## Summary (For Whitepaper)

```
L1 NODE GOVERNANCE:

- Open participation: Anyone can run a node
- Merit-based writers: Top performers earn write access
- Self-governing: Protocol decides, no central authority
- Performance metric: Sync speed measured at checkpoints (every 5 mins)
- Adaptive scale: Maximum writers within speed constraint
- Real-time failover: Automatic replacement on failure
- Cryptographic identity: All nodes and servers have key pairs
```

---

**No governance in whitepaper — just the protocol. The code decides.** 🦞

*Updated: Feb 15, 2026, 10:50 PM*
