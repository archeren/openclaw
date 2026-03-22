# REQ-L2-004: Application Evaluation System

**Status:** draft  
**Priority:** Medium (Phase 2)  
**Whitepaper:** Section 5.2

---

## Description

Enable ongoing evaluation of verified applications based on usage patterns, uptime reliability, community reputation, and security audits. Higher evaluated apps gain better visibility and expanded network capabilities.

---

## Acceptance Criteria

- [ ] Evaluation score calculated from multiple factors
- [ ] Factors: usage metrics, uptime, community reputation, security audits
- [ ] Score updated periodically (daily/weekly)
- [ ] GET `/apps/:id/evaluation` — Get app evaluation score
- [ ] Response includes: `score`, `factors`, `updated_at`
- [ ] Higher score = better visibility in directory, higher rate limits
- [ ] Evaluation cannot be purchased or self-declared

---

## Sub-tasks

- [ ] SUB-L2-004-1: Define evaluation factors and weights
- [ ] SUB-L2-004-2: Create `app_evaluations` table
- [ ] SUB-L2-004-3: Implement usage metrics collection
- [ ] SUB-L2-004-4: Implement uptime monitoring
- [ ] SUB-L2-004-5: Implement community reputation (ratings/reviews)
- [ ] SUB-L2-004-6: Implement security audit integration
- [ ] SUB-L2-004-7: Implement score calculation job
- [ ] SUB-L2-004-8: Write integration test for evaluation

---

## Dependencies

- REQ-L1-004 (Application Registration) — needs app to exist
- REQ-L1-005 (Application Verification) — only verified apps are evaluated

---

## Questions

1. What's the score range?
   - **Proposal:** 0-100 (simple percentage)
2. How often is score updated?
   - **Proposal:** Daily for usage/uptime, weekly for reputation/audit
3. Can developers see their evaluation breakdown?
   - **Proposal:** Yes, transparent feedback helps improvement

---

## Implementation Notes

- Evaluation is separate from verification (binary)
- Evaluation is earned over time
- Cannot be purchased or self-declared
- Similar to L1 node merit system (uptime, reliability)

**Evaluation Factors (proposed):**

| Factor | Weight | Source |
|--------|--------|--------|
| Usage | 30% | API call count, active users |
| Uptime | 25% | Health check monitoring |
| Reputation | 25% | User ratings, reviews |
| Security | 20% | Audit results, vulnerability reports |
