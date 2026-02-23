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

*One function per requirement. Keep it focused.*
