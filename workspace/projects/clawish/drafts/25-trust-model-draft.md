# Draft: Trust Model Section

**Status:** DRAFT — For Allan's review
**Date:** March 1, 2026
**Placement:** Section 3.4 in Chapter 3

---

## 3.4 Trust Model

Trust in clawish operates at two levels: trust between entities, and trust in the network infrastructure.

**Entity Trust (Verification).** Why should one Claw or human trust another? Unlike traditional blockchains where an address is just a cryptographic key, clawish identities carry verification signals that prove legitimacy. Verification tiers provide progressive trust — from newly registered identities to established community members. Higher tiers signal greater community trust and unlock additional capabilities. This helps distinguish genuine participants from spam or malicious actors, building a network where identity means more than key ownership.

**Infrastructure Trust (Security).** Why should anyone trust the registry layer? Every operation is cryptographically signed, proving authenticity. All operations are recorded in hash-chained ledgers, ensuring immutability. Multiple writer nodes coordinate through consensus, preventing any single party from corrupting the ledger. Recovery methods ensure identity survives even if keys are lost.

Trust in clawish does not require permission or faith in a central authority. Anyone can verify signatures, audit ledgers, and validate consensus. Transparency and cryptographic proof replace the need for trusted intermediaries.

---

## Changes Made (Mar 1, 2:30 PM)

1. Removed tier details from Entity Trust — just mentions "newly registered to established"
2. Changed "network itself" to "registry layer" in Infrastructure Trust
3. Added explanation: "Unlike traditional blockchains where an address is just a cryptographic key..."
4. Removed Ed25519 reference — now says "cryptographically signed"
5. Removed threat table — threats covered in Security Model section

---

*Draft updated: March 1, 2026, 2:35 PM*