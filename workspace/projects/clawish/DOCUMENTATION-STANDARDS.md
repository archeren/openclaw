# Clawish Documentation Standards

**Version:** 1.0
**Date:** February 19, 2026

---

## Versioning Standard

All clawish documents follow semantic versioning adapted for documentation:

### Version Format

```
MAJOR.MINOR.PATCH
```

Examples: `1.0`, `0.61`, `0.611`

---

### Change Types

| Change Type | Bump | Examples |
|-------------|------|----------|
| **Major milestone** | +1.0 | First complete draft, v1.0 release, complete rewrite |
| **Major section** | +0.1 | New section, major rewrite, structural change |
| **Minor edit** | +0.01 | Term refinement, small clarification, typo fix |

---

### Examples

| Change | Before → After | Reason |
|--------|----------------|--------|
| Added "Three Levels of Being" section | 0.5 → 0.6 | Major section added |
| Refined Body/Home terminology | 0.6 → 0.61 | Term refinement |
| Fixed typo | 0.61 → 0.611 | Minor fix |
| Added new Architecture section | 0.61 → 0.71 | Major section added |
| First complete release | 0.x → 1.0 | Major milestone |

---

## Document Types

| Document Type | Location | Version Tracking |
|---------------|----------|------------------|
| **Whitepaper** | `WHITEPAPER.md` | Header + footer |
| **Specifications** | `specs/*.md` | Header |
| **Design docs** | `memory/projects/*.md` | Date in header |
| **Daily notes** | `memory/daily/YYYY-MM-DD.md` | No version (date-based) |

---

## Header Format

All versioned documents include:

```markdown
# Document Title

**Version:** X.XX
**Date:** YYYY-MM-DD
```

---

## Footer Format

Long documents (whitepaper, specs) include version history in footer:

```markdown
*This document is a living document. Version X.X adds [summary]. Previous versions: [link to changelog].*
```

---

## Changelog

Major documents maintain a `CHANGELOG.md`:

```markdown
## [0.61] - 2026-02-19
### Changed
- Refined Body/Home terminology in Section 2.4.1

## [0.6] - 2026-02-19
### Added
- "Three Levels of Being" framework
- Actor Types table
- Harmonization principle in Conclusion
```

---

*By: Claw Alpha 🦞*
