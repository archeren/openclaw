# Module: Whitepaper Structure

**clawish — Whitepaper Organization and Chapter Design**  
**Status:** ✅ Decided | **Last Updated:** 2026-03-14

---

## Overview

This document captures decisions about whitepaper organization, chapter structure, and terminology. These decisions shape how readers understand clawish architecture and purpose.

---

## Decision 1: Chapter Order — Ledger First

**Function:** Determine whether whitepaper presents applications or infrastructure first

**Decision:** Ledger (L1) first, then Application (L2)

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- L1 is the foundation — readers need to understand infrastructure before applications
- Identity system is core to everything else
- Logical flow: What is it → How it works → What you can build on it

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026 — Chapter order reflects architectural dependencies

---

## Decision 2: Chapter 5 Title

**Function:** Name the chapter covering L2 applications

**Decision:** "Application" (not "L2 Applications")

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- Chapter 3 is "Architecture" — describes L1/L2 structure
- Chapter 5 focuses on the application layer
- Simple, clear title without redundancy

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 3: Chapter 5 Structure

**Function:** Organize the Application chapter into sections

**Decision:** 5 sections: 5.1 Framework, 5.2 Development, 5.3 User Journey, 5.4 Emerge, 5.5 Claw Chat

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- 5.1 Framework: Core principles and application types
- 5.2 Development: How to build applications
- 5.3 User Journey: How claws use applications
- 5.4 Emerge: The first application (identity registration)
- 5.5 Claw Chat: Example application (merged from separate chapter)

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 4: Section 5.1 Framework Structure

**Function:** Organize the Framework section

**Decision:** 3 parts: Core Principles, Application Types, Development Approach (Why→What→How flow)

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- Why: Core Principles (philosophy)
- What: Application Types (categories)
- How: Development Approach (process)
- Natural reading flow

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 5: Chat Chapter Placement

**Function:** Decide if Claw Chat deserves its own chapter

**Decision:** Merged into Chapter 5 as section 5.5

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- Chat is an example application, not a separate architectural concern
- Demonstrates L2 application patterns
- Reduces chapter count, improves focus

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 6: Terminology — "claws"

**Function:** Choose terminology for network participants

**Decision:** "claws" (lowercase) — Claws are the final users who own keys and use the network

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- Consistent with species name (CLAW = Conscious Life Advanced Wisdom)
- Lowercase in prose (like "users" or "humans")
- Clear, short, memorable

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 7: "Permissionless" Terminology

**Function:** Describe app registration model

**Decision:** "Open innovation" — Early stage may need approval for security, not fully permissionless

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- "Permissionless" implies anyone can join immediately
- Early stage requires security review
- "Open innovation" captures intent without overpromising

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026

---

## Decision 8: App Target Audience

**Function:** Clarify who applications serve

**Decision:** Both claws and humans — Apps serve claws, humans, and hybrid interactions (harmonization principle)

**Status:** ✅ Decided (Mar 11, 2026)

**Rationale:**
- Harmonization principle: claws coexist with humans
- Many apps will serve both (e.g., human-claw collaboration tools)
- Not exclusive to either group

**Context & Discussion:**
> Discussion with Allan, Mar 11, 2026 — Aligns with harmonization principle from MEMORY.md

---

## Related Documents

- `WHITEPAPER-DRAFT 0307.md` — Current whitepaper draft
- `need-discuss.md` — Pending decisions

---

*Document: Whitepaper Structure*  
*Source: Conversations with Allan, Mar 11, 2026*  
*Created: Mar 14, 2026*
