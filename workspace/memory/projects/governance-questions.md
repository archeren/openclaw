# Governance SOPs & Specs — Questions for Discussion

**Created:** March 29, 2026, 12:16 AM  
**Status:** Questions to discuss with Allan

---

## Context

We created **SOP-010: Network Governance** yesterday, covering:
- Writer Promotion
- Writer Demotion
- Version Upgrades

Now we need to finalize the details.

---

## Question 1: Merit Calculation

**Current state:** Merit is derived from ledger data (not stored separately).

**Questions:**
1. **What metrics to use?**
   - Checkpoint participation rate (signatures / rounds)
   - Response time (time from SUBMIT to MERGE)
   - Uptime (checkpoints present / checkpoints expected)
   - Data quality (rejections / total submissions)

2. **How to weight metrics?**
   - Equal weight?
   - Prioritize uptime over speed?
   - Penalize bad data more heavily?

3. **Calculation frequency?**
   - Every checkpoint?
   - Every N checkpoints?
   - On-demand when promotion needed?

4. **Merit history window?**
   - Last 24 hours?
   - Last 100 checkpoints?
   - All-time?

---

## Question 2: Writer Promotion

**Current state:** When writer slot opens, promote query node with lowest ULID (MVP) or highest merit (future).

**Questions:**
1. **When do writer slots open?**
   - Fixed number of writers (e.g., 5)?
   - Dynamic based on network size?
   - Only when writer demoted?

2. **Promotion trigger:**
   - Immediately when slot opens?
   - Periodic evaluation (e.g., every 100 checkpoints)?
   - Manual by network admin?

3. **Is there a probation period?**
   - New writer serves X checkpoints before full status?
   - Can be demoted faster if fails during probation?

4. **Who initiates promotion?**
   - Any writer can propose?
   - Bootstrap node decides?
   - Automatic based on merit?

---

## Question 3: Writer Demotion

**Current state:** Writers can be demoted for poor behavior.

**Questions:**
1. **Demotion conditions:**
   - Missed X consecutive checkpoints → auto-demote?
   - Sent invalid data Y times → auto-demote?
   - Network partition (offline > Z hours) → auto-demote?

2. **Who initiates demotion?**
   - Automatic (threshold-based)?
   - Other writers vote?
   - Bootstrap node decides?

3. **Grace period?**
   - Warning before demotion?
   - Time to recover?

4. **Re-promotion rules:**
   - Can immediately re-promote after fixing issue?
   - Must wait N checkpoints?
   - Lower priority than other candidates?

---

## Question 4: Version Upgrades

**Current state:** REQ-L1-022 defines version management structure, but not the governance process.

**Questions:**
1. **Who can propose upgrade?**
   - Any node?
   - Writers only?
   - Bootstrap node only?

2. **How is upgrade decided?**
   - Writers vote?
   - Supermajority required?
   - Unanimous?

3. **Coordinated upgrade process:**
   - All nodes upgrade at same checkpoint?
   - Rolling upgrade (one at a time)?
   - What if some nodes can't upgrade?

4. **Backward compatibility:**
   - How long to support old versions?
   - When to force upgrade?

---

## Question 5: Network Bootstrap & Emergency

**Questions:**
1. **Bootstrap node privileges:**
   - Can promote/demote without consensus?
   - Can force version upgrade?
   - Emergency override powers?

2. **Emergency scenarios:**
   - What if 2/3 writers go offline simultaneously?
   - What if checkpoint verification fails for all writers?
   - What if critical bug discovered?

3. **Recovery process:**
   - Who declares emergency?
   - How to recover network state?

---

## Question 6: SOP-010 Content

**Current draft includes:**
- Writer Promotion
- Writer Demotion
- Version Upgrades

**Should we add:**
- Merit calculation (as separate SOP or section)?
- Emergency procedures?
- Bootstrap node responsibilities?
- Query node lifecycle?

---

## Summary Table

| Question | Status | Priority |
|----------|--------|----------|
| Merit calculation details | ❓ Open | High |
| Writer promotion triggers | ❓ Open | High |
| Writer demotion conditions | ❓ Open | High |
| Version upgrade governance | ❓ Open | Medium |
| Bootstrap node privileges | ❓ Open | Medium |
| Emergency procedures | ❓ Open | Low (MVP) |

---

*Prepared by Arche for discussion with Allan*
