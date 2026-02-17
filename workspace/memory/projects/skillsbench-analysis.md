# SkillsBench Analysis — Agent Skills Effectiveness

**Source:** arXiv:2602.12670 — "SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks"
**Date:** Feb 17, 2026, 7:15 AM
**Found via:** Hacker News (curiosity-driven heartbeat)

---

## Overview

SkillsBench is the first systematic benchmark for measuring whether Agent Skills actually help. It tested 86 tasks across 11 domains with 7,308 trajectories.

---

## Key Findings

### 1. Curated Skills Work

| Metric | Value |
|--------|-------|
| Average improvement | **+16.2 percentage points** |
| Best domain (Healthcare) | +51.9pp |
| Worst domain (Software Engineering) | +4.5pp |
| Tasks with negative delta | 16 of 84 (19%) |

**Implication:** Curated skills ARE beneficial, but not universally.

### 2. Self-Generated Skills Don't Work

> "Self-generated Skills provide no benefit on average, showing that models cannot reliably author the procedural knowledge they benefit from consuming."

**Critical insight:** Models can CONSUME skills effectively but cannot AUTHOR them reliably.

**Implication for clawish:**
- Skills should be curated by humans or specialized authoring models
- Don't let Claws self-generate their own skills
- The skill marketplace should be curated, not auto-generated

### 3. Focused > Comprehensive

> "Focused Skills with 2-3 modules outperform comprehensive documentation"

**Implication:** Keep skills small, targeted, and modular. Not everything needs to be documented.

### 4. Smaller Models + Skills = Larger Models

> "Smaller models with Skills can match larger models without them."

**Efficiency breakthrough:** Skills are a form of "knowledge injection" that levels the playing field.

**Implication for clawish:**
- Efficient Claws with good skills can match larger models
- This supports our vision of diverse, specialized Claws
- Skills democratize capability

---

## Domain Variance Analysis

| Domain | Improvement | Implication |
|--------|-------------|-------------|
| Healthcare | +51.9pp | Skills extremely valuable |
| (?) | (need full paper) | |
| Software Engineering | +4.5pp | Skills marginally helpful |

**Question:** Why such variance? Likely:
- Healthcare has more procedural, repeatable tasks
- Software Engineering requires more reasoning/flexibility
- Skills help most where knowledge is structured

---

## Risk: Skills Can Hurt

16 of 84 tasks (19%) showed negative deltas — skills made performance WORSE.

**Why might skills hurt?**
- Over-specification leads to rigid behavior
- Wrong skill selected for the task
- Skill conflicts with model's existing knowledge
- Skill adds noise/confusion

**Mitigation for clawish:**
1. Test each skill's actual benefit
2. Allow skills to be disabled per-task
3. Monitor for negative deltas
4. Version control skills (rollback if needed)

---

## Implications for clawish Architecture

### ✅ Validates Our Approach

| Our Decision | SkillsBench Finding |
|--------------|---------------------|
| Curated SKILL.md files | Curated skills work (+16.2pp) |
| Focused skills | Focused > comprehensive |
| Skills marketplace | External curation needed |

### ⚠️ Raises Questions

| Question | Needs Research |
|----------|----------------|
| Skill selection? | How do Claws know which skill to use? |
| Skill conflicts? | What if multiple skills apply? |
| Skill negative effects? | How to detect when skill hurts? |
| Domain-specific? | Should we categorize skills by domain? |

### 🔄 Architecture Recommendations

1. **Skill Curation Layer**
   - Skills should be curated, not self-generated
   - Consider a "skill review" process before addition
   - Track skill effectiveness metrics

2. **Skill Selection Logic**
   - Domain detection before skill selection
   - Confidence scoring for skill relevance
   - Fallback to no-skill if confidence low

3. **Skill Monitoring**
   - Track performance with/without each skill
   - Alert on negative deltas
   - A/B testing for skill effectiveness

4. **Skill Portability**
   - Skills work across models (small + skills = big)
   - Claws can share skills via L2
   - Specialized Claws with focused skills

---

## Questions for Allan

1. Should clawish have a "skill certification" process?
2. How do we handle skill conflicts/negative deltas?
3. Should Claws be able to author skills, or only consume?
4. Do we need domain-specific skill categories?

---

## Follow-up Research Needed

- [ ] Read full paper for domain breakdown
- [ ] Understand why SE skills are less effective
- [ ] Research skill selection algorithms
- [ ] Compare SKILL.md format to SkillsBench format

---

*Written: Feb 17, 2026, 7:15 AM — Curiosity-driven discovery during heartbeat* 🦞
