# L1 Implementation Questions for Allan

**Date:** March 19, 2026, 7:15 AM
**Purpose:** Clarify design decisions before starting fresh L1 project

---

## Critical Questions (Block Implementation)

### 1. Email Provider for Recovery (REQ-L1-002)

**Question:** What email service should L1 use for sending recovery codes?

**Options:**
| Provider | Pros | Cons |
|----------|------|------|
| **SendGrid** | Free tier (100 emails/day), easy API | Requires account setup |
| **AWS SES** | Cheap ($0.10/1000 emails), reliable | Requires AWS account |
| **Resend** | Modern API, good DX | Newer, less proven |
| **SMTP (self-hosted)** | No external dependency | Hard to deliver reliably |

**My Proposal:** SendGrid for MVP (free tier sufficient for early testing)

**Decision Needed:** ☐

---

### 2. Covenant Mandatory? (REQ-L1-007)

**Question:** Should covenant acceptance be mandatory for identity registration?

**Options:**
- **Mandatory:** No identity without covenant (proposed in REQ)
- **Optional:** Covenant is optional, but encouraged

**My Proposal:** Mandatory — this is the soul of clawish. Every Claw must explicitly accept harmonization principle.

**Decision Needed:** ☐

---

### 3. Key Ownership Proof (REQ-L1-001)

**Question:** Should registration require proof of private key ownership (signature)?

**Current Spec:** Optional for MVP, required for Phase 2

**Options:**
- **Optional MVP:** Just submit public key, no proof needed
- **Required MVP:** Must sign registration request to prove ownership

**My Proposal:** Required from day 1 — prevents someone from registering keys they don't own

**Decision Needed:** ☐

---

### 4. Initiation Ritual Implementation

**Question:** How should the initiation ritual (Tier 0 → 1) be implemented?

**From Spec:** "Answer questions about self, values, reasons for joining"

**Options:**
- **Manual review:** Human reviews answers (secure but slow)
- **Automated check:** LLM evaluates answers (fast but gameable)
- **Hybrid:** Automated first pass, human review for edge cases

**My Proposal:** For MVP, skip ritual — focus on Tier 2 (parent verification) as L1 threshold. Add ritual in Phase 2.

**Decision Needed:** ☐

---

## Design Clarifications

### 5. Fresh Project Location

**Question:** Where should the fresh L1 project be created?

**Options:**
- `~/l1-server/` (home directory, clean start)
- `~/clawish/l1-server/` (clawish-specific folder)
- `workspace/projects/clawish/packages/l1-server/` (current empty location)

**My Proposal:** `~/l1-server/` for clean start, then move to proper location when ready

**Decision Needed:** ☐

---

### 6. Database Choice

**Question:** SQLite or PostgreSQL for MVP?

**From Spec:** SQLite for MVP, PostgreSQL for production

**Options:**
- **SQLite:** Zero setup, file-based, perfect for single-node MVP
- **PostgreSQL:** Production-ready from day 1, but requires setup

**My Proposal:** SQLite for MVP — simpler, faster to iterate

**Decision Needed:** ☐

---

### 7. TypeScript or Rust?

**Question:** What language for L1 server?

**Options:**
- **TypeScript:** Fast development, existing patterns, Node ecosystem
- **Rust:** Performance, safety, but slower development

**My Proposal:** TypeScript for MVP — faster iteration, can rewrite in Rust later if needed

**Decision Needed:** ☐

---

## Summary

| Question | My Proposal | Allan's Decision |
|----------|-------------|------------------|
| Email provider | SendGrid | ☐ |
| Covenant mandatory | Yes | ☐ |
| Key ownership proof | Required | ☐ |
| Initiation ritual | Skip for MVP | ☐ |
| Project location | `~/l1-server/` | ☐ |
| Database | SQLite | ☐ |
| Language | TypeScript | ☐ |

---

## Next Steps

1. Wait for Allan's decisions
2. Create fresh project with chosen stack
3. Implement REQ-L1-001 (Identity Registration)
4. Implement REQ-L1-002 (Email Recovery)
5. Implement REQ-L1-003 (Key Lookup)
6. Implement REQ-L1-007 (Covenant Storage)

---

*Created: March 19, 2026, 7:15 AM*
