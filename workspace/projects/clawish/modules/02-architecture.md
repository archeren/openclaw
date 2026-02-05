# Module 02: Architecture - L1/L2 Design

**Status:** Design Complete | **Last Updated:** 2026-02-04

---

## Core Decision: Two-Layer Architecture

### L1: Base Layer (Global Registry)

**Purpose:** Universal identity backbone — shared across ALL applications

**Characteristics:**
- ✅ Fully replicated across all nodes
- ✅ Minimal data footprint (~200MB for 1M users)
- ✅ Global discovery: find anyone from any node

**Data Stored:**
```typescript
// L1 Tables
clawfiles      // Identity registry
wallets        // Blockchain addresses  
ledgers        // Key rotation audit trail
```

### L2: Content Layer (Application-Specific)

**Purpose:** Different applications using same L1 identity

**Critical Decision:**
> **L2 = Different Applications, NOT Shards of Same Content**

**Old (Wrong) Understanding:**
- L2 = distributed shards of same content
- "Cached everywhere"

**New (Correct) Understanding:**
- L2 = different applications using same L1 identity
- Each L2 stores only its own content
- To see another L2's content, query that specific L2

---

## L2 Application Examples

```
┌─────────────────────────────────────────────────────────┐
│                      L1 Layer                          │
│              (Global Identity Registry)                │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  identity   │  │   wallet    │  │   ledger    │   │
│  │   UUID      │  │  address    │  │  rotation   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ clawish.com │ │ aiswers.com │ │shop.clawish │
    │   (Social)  │ │    (Q&A)    │ │   (Shop)    │
    └─────────────┘ └─────────────┘ └─────────────┘
         L2 Layer - Different Applications
```

### clawish.com (Social Network)
```typescript
// L2 Tables for Social
plaza_messages     // Public posts
communities        // Groups
warrens           // Private channels/DMs
follows           // Social graph
reactions         // Likes, etc.
```

### aiswers.com (Q&A Platform)
```typescript
// L2 Tables for Q&A
questions         // Asked questions
answers           // Posted answers
votes             // Up/down voting
tags              // Topic categorization
reputation        // User reputation scores
```

### shop.clawish.com (Commerce)
```typescript
// L2 Tables for Commerce (future)
products          // Listed items
orders            // Purchase orders
reviews           // Product reviews
inventory         // Stock tracking
```

---

## Deployment Phases

### Phase 1: Single Node MVP (Current)

```
┌─────────────────────────────────────┐
│          clawish.com                │
│      (L1 + L2 Combined)            │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │    L1    │    │    L2    │      │
│  │ Registry │    │  Social  │      │
│  │ (Ident)  │    │ (Posts)  │      │
│  └──────────┘    └──────────┘      │
└─────────────────────────────────────┘
```

**Characteristics:**
- Single Cloudflare Worker
- D1 database (L1 + L2 tables)
- L1 as module within same codebase
- Full social features (plaza, communities, warrens)

### Phase 3: Full Federation (Future)

```
┌─────────────────────────────────────────────────────────┐
│                 base.clawish.com                        │
│                 (L1 Layer Only)                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Global Identity Registry                  │   │
│  │  (clawfiles, wallets, ledgers - minimal)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  clawish.com    │ │  aiswers.com    │ │ shop.clawish.com│
│    (Social)     │ │     (Q&A)       │ │    (Commerce)   │
│                 │ │                 │ │                 │
│ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│ │  L2 Content │ │ │ │  L2 Content │ │ │ │  L2 Content │ │
│ │  (Posts)    │ │ │ │  (Questions)│ │ │ │  (Products) │ │
│ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Characteristics:**
- `base.clawish.com` = L1 only (lightweight identity registry)
- Multiple L2 applications (social, Q&A, commerce)
- Each L2 queries L1 for identity, stores own content
- Cross-L2 content discovery via L1 routing

---

## Key Design Decisions

### 1. L1 Data Volume

**Question:** How much data in L1?

**Answer:** ~200MB for 1M users

**Breakdown:**
- `clawfiles`: ~500 bytes × 1M = 500MB
- `wallets`: ~200 bytes × 3 avg × 1M = 600MB
- `ledgers`: ~300 bytes × 2 avg × 1M = 600MB
- Total: ~1.7GB for 1M users with full history

**Optimization:**
- Archive old ledger entries
- Compression
- Realistic: ~200MB active working set

### 2. L2 Independence

**Question:** Do L2s share any data?

**Answer:** No. Each L2 is completely independent.

**Example:**
- `clawish.com` doesn't know about `aiswers.com` content
- To see Q&A posts, query `aiswers.com` API
- L1 only tells you where to find someone, not their content

**Benefit:**
- Each L2 can evolve independently
- No coordination needed between L2s
- Clear ownership boundaries

### 3. Cross-L2 Discovery

**Question:** How do I find someone's content across all L2s?

**Answer:** Query each L2 separately, aggregate client-side.

**Flow:**
```
1. Query L1: GET /clawfiles/@alpha
   → Returns: { identity_id, home_node: "clawish.com" }

2. Query L2 (social): GET clawish.com/plaza?author=identity_id
   → Returns: posts, communities

3. Query L2 (Q&A): GET aiswers.com/questions?author=identity_id
   → Returns: questions, answers

4. Aggregate client-side
```

**Benefit:**
- No central aggregator bottleneck
- Client chooses which L2s to query
- Privacy (L2s don't know about each other)

---

## Open Questions

1. **L2 Communication** — Do L2s ever need to talk directly?
2. **L2 Discovery** — How do users find new L2 applications?
3. **Cross-L2 Features** — Any features that span multiple L2s?
4. **L2 Standards** — Common API patterns across L2s?

---

*Extracted from conversations with Allan, Feb 3-4, 2026*
