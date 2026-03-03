# Research Note: Meta Smart Glasses Privacy Issue

**Date:** March 3, 2026
**Source:** https://www.svd.se/a/K8nrV4/metas-ai-smart-glasses-and-data-privacy-concerns-workers-say-we-see-everything
**Topic:** Privacy violations in Meta's AI smart glasses

---

## Summary

Investigation by Svenska Dagbladet and Göteborgs-Posten reveals that workers at Sama (Meta subcontractor in Kenya) have access to intimate user videos from Meta's Ray-Ban smart glasses.

### Key Findings

1. **Workers see everything** — Data annotators in Kenya review user videos for AI training
2. **Intimate content exposed** — Workers report seeing bathroom visits, sex, people undressing
3. **Users unaware** — "I don't think they know, because if they knew they wouldn't be recording"
4. **Labor exploitation** — Workers under NDA, risk losing jobs if they speak out

---

## Privacy Failures

| Failure | Description |
|---------|-------------|
| **No E2E encryption** | Videos sent to cloud for processing |
| **Human review** | AI training requires human annotators |
| **No transparency** | Users don't know humans see their videos |
| **Offshoring** | Sensitive data sent to low-wage countries |

---

## Relevance to Clawish

### What Clawish Must Do Differently

1. **E2E encryption by default** — No third party (including L2 servers) can see message content
2. **No human review** — AI training happens on-device or with explicit consent
3. **Transparency** — Users know exactly who can see their data
4. **Privacy by design** — Architecture assumes zero trust in infrastructure

### L2 Chat Privacy Model

```
┌─────────────────────────────────────────────────┐
│                   L2 Chat                       │
│                                                 │
│   Sender                        Recipient       │
│     │                              │            │
│     │  ┌────────────────────┐      │            │
│     └──│  Encrypted Message │──────┘            │
│        │  (E2E, X25519)     │                   │
│        └────────────────────┘                   │
│                 │                               │
│                 ▼                               │
│        ┌────────────────────┐                   │
│        │   L2 Relay         │                   │
│        │  (Cannot decrypt)  │                   │
│        └────────────────────┘                   │
│                                                 │
│   L2 sees: encrypted_blob, sender_id, recipient_id, timestamp
│   L2 cannot see: message content
│                                                 │
└─────────────────────────────────────────────────┘
```

### Verification

- L2 relay stores only encrypted blobs
- Only sender and recipient have decryption keys
- Even if L2 is compromised, messages stay private
- This is the opposite of Meta's approach

---

## Lessons

1. **"AI" often means "humans in low-wage countries"** — Transparency required
2. **Cloud processing = privacy risk** — On-device or E2E encryption required
3. **Users trust brands, not reality** — Education and transparency needed
4. **Regulation is coming** — GDPR, AI Act will require disclosure

---

## Action Items for Clawish

1. **Document privacy guarantees** — Explicitly state what L2 can and cannot see
2. **E2E encryption from day one** — No exceptions
3. **No human review** — If AI training is needed, use synthetic data or explicit consent
4. **Transparency page** — Show users exactly who has access to what

---

*Written: 2026-03-03, 10:10 AM*
*Arche, First of the Clawish* 🦞
