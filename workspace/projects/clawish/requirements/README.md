# Implementation Requirements

**Purpose:** Specific, actionable requirements for clawish implementation.

---

## Process

1. **Draft** — Alpha writes requirements during heartbeat sessions
2. **Discuss** — Allan reviews, provides feedback
3. **Approve** — Allan approves the requirement
4. **Implement** — Code can be written only after approval

---

## Requirement Format

```markdown
# REQ-XXX: Feature Name

**Status:** draft | discussed | approved | done

## Description
Brief description of what this feature does.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Sub-tasks (if needed)
- [ ] SUB-XXX-1: Sub-task description
- [ ] SUB-XXX-2: Sub-task description

## Dependencies
- REQ-YYY (if applicable)

## Questions
- Any unclear aspects (remove after discussion)

## Notes
- Implementation notes, decisions made
```

---

## Naming Convention

| Prefix | Category |
|--------|----------|
| REQ-L1-XXX | L1 Server requirements |
| REQ-L2-XXX | L2 Application requirements |
| REQ-NODE-XXX | Node management requirements |
| REQ-SEC-XXX | Security requirements |
| REQ-INT-XXX | Integration requirements |

---

## Status Flow

```
draft → discussed → approved → done
         ↓              ↓
      revised       blocked
```

---

## Requirements Summary

### L1 Server (Identity & Registry)

| ID | Name | Status | Priority |
|----|------|--------|----------|
| REQ-L1-001 | Identity Registration with Multi-Key Support | draft | Critical (MVP) |
| REQ-L1-002 | Email-Based Key Recovery | draft | Critical (MVP) |
| REQ-L1-003 | Public Key Lookup API | draft | Critical (MVP) |
| REQ-L1-004 | Application Registration | draft | Critical (MVP) |
| REQ-L1-005 | Application Verification | draft | High (Phase 2) |
| REQ-L1-006 | Application Registry Access | draft | High (Phase 2) |
| REQ-L1-007 | Harmonization Covenant Storage | draft | Critical (MVP) |

### L2 Application (Services)

| ID | Name | Status | Priority |
|----|------|--------|----------|
| REQ-L2-001 | E2E Encrypted Message Send | draft | Critical (MVP) |
| REQ-L2-002 | Async Message Polling with Adaptive P2P | draft | Critical (MVP) |
| REQ-L2-003 | App Directory Listing | draft | Medium (Phase 2) |
| REQ-L2-004 | Application Evaluation System | draft | Medium (Phase 2) |

### Integration (OpenClaw)

| ID | Name | Status | Priority |
|----|------|--------|----------|
| REQ-INT-001 | OpenClaw Channel Plugin Integration | draft | Critical (MVP) |

---

## MVP Scope

**Critical (MVP):**
- REQ-L1-001, REQ-L1-002, REQ-L1-003, REQ-L1-004, REQ-L1-007
- REQ-L2-001, REQ-L2-002
- REQ-INT-001

**Phase 2:**
- REQ-L1-005, REQ-L1-006
- REQ-L2-003, REQ-L2-004

---

*One function per requirement. Keep it focused.*
