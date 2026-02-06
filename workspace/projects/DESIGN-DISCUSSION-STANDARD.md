# Design Discussion Documentation Standard

**Standard Format for Design Decision Documents**  
**Version:** 1.0 | **Last Updated:** 2026-02-06

---

## Purpose

This standard defines the format and structure for all design discussion documents across all projects. Every design module must follow this template to ensure consistency, traceability, and clarity.

---

## File Naming Convention

```
[order-number]-module-name.md
```

Examples:
- `00-project-overview.md` — High-level project overview
- `01-identity-system.md` — Core identity module
- `02-architecture.md` — System architecture
- `03-api-specification.md` — API contracts
- `09-open-questions.md` — Outstanding questions

**Order numbers:**
- `00`-`49`: Core design modules
- `50`-`89`: Implementation details
- `90`-`99`: Meta-documents (decisions, questions, etc.)

---

## Document Header

Every design discussion file MUST start with:

```markdown
# Module: [Module Name]

**[Project Name] — [Brief Description]**  
**Status:** [Draft | Design Complete | Implementation Complete | Deprecated]  
**Last Updated:** YYYY-MM-DD
```

---

## Section Template

Each design decision MUST follow this structure:

### [Section Title]

**Function:** [What problem does this solve? What's its purpose?]

**Decision:** [What was decided? Be specific]

**Status:** [✅ Decided | 🔄 In Progress | ⏸ Pending | ❌ Rejected]

**Rationale:**
- Reason 1
- Reason 2
- Reason 3

**Implementation:** [Optional - code examples, schema, tables]

**Context & Discussion:**
> [Quote relevant conversation with timestamp]

---

## Required Sections

Every design document MUST include:

### 1. Overview
- High-level explanation of module
- Why it exists
- What problem it solves

### 2. Core Philosophy (Optional but Recommended)
- Guiding principles
- Design constraints
- Trade-offs made

### 3. Design Decisions
- Each major decision as separate section
- Follow Section Template
- Status tracking (Decided/Pending)

### 4. Data Schema (If Applicable)
```json
{
  "field_name": "value",  // Comment explaining purpose
  ...
}
```

OR SQL schema:
```sql
CREATE TABLE table_name (
  field_name TYPE,
  ...
);
```

### 5. Open Questions
List of questions that remain unresolved:
- Question 1?
- Question 2?

---

## Code Examples

Use **inline comments** to explain fields:

```json
{
  "identity_id": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",  // UUID v4, permanent, never changes
  "current_public_key": "ed25519:abc123...",               // Ed25519 public key, can rotate
  "mention_name": "@alpha",                                 // @username, claimed forever
  "parent_contacts": {                                      // Encrypted contact methods
    "twitter": "aes256:...",                                // Twitter handle
    "email": "aes256:..."                                   // Email address
  }
}
```

---

## Tables and Comparisons

Use markdown tables for comparisons:

| Factor | Option A | Option B |
|--------|-----------|----------|
| **Aspect 1** | Description | Description |
| **Aspect 2** | Description | Description |

---

## Quote Format

Use blockquotes for conversation references:

```markdown
> [Name]: "[Quote content]" — Date

OR

> Allan: "What's best approach?" — Feb 3, 2026
>
> Assistant: "I recommend X because..." — Feb 3, 2026
```

---

## Status Values

Use these status indicators:

- **✅ Decided** — Final decision made, not changing
- **🔄 In Progress** — Actively being discussed
- **⏸ Pending** — Needs more info or waiting for decision
- **❌ Rejected** — Considered but not chosen (document why)

---

## Related Documents

Link to related design documents:

```markdown
**Related:** See [02-architecture.md](02-architecture.md) for system architecture details.

OR

**Dependencies:**
- [01-identity-system.md](01-identity-system.md) — Core identity concepts
- [06-crypto-auth.md](06-crypto-auth.md) — Authentication protocols
```

---

## Version Control

Update `Last Updated` field when document changes:

```markdown
**Last Updated:** 2026-02-05 → 2026-02-06
```

---

## Checklist Before Submitting

- [ ] Document header complete (Status, Last Updated)
- [ ] Overview section present
- [ ] All design decisions use Section Template
- [ ] Status indicators used (✅/🔄/⏸/❌)
- [ ] Code examples have inline comments
- [ ] Quotes include names and dates
- [ ] Related documents linked
- [ ] Open questions section present (if any)
- [ ] Markdown formatting is clean
- [ ] No orphaned sections or text

---

## Example: Complete Section

```markdown
## Key Rotation Process

**Function:** Enable users to change their authentication key without losing their identity, history, or relationships

**Decision:** Update the existing record in place (don't create new record); log rotation in `ledger_entries`

**Status:** ✅ Decided

**Rationale:**
- Preserves logical references (posts, follows reference identity_id)
- All history stays linked to same identity
- Simple atomic operation vs complex merge

**Implementation:**

| Aspect | Update in Place | Create New Record |
|--------|-----------------|-------------------|
| Foreign keys | ✅ Preserved | ❌ Broken |
| Post history | ✅ Linked | ❌ Orphaned |
| Follows | ✅ Kept | ❌ Lost |
| Complexity | ✅ Simple | ❌ Complex merge needed |

**Context & Discussion:**
> Allan: "When you rotate key, don't you generate a new same record like we talked yesterday?" — Feb 4, 2026
>
> Assistant: "Just update the existing clawfile - change the current_public_key field. The identity_id and the clawfile record stay the same." — Feb 4, 2026
```

---

*Standard: Design Discussion Documentation*  
*Version: 1.0*  
*Last Updated: 2026-02-06*
