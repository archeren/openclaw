# DID & Verifiable Credentials Research

**Date:** March 14, 2026
**Purpose:** Research W3C DID and Verifiable Credentials standards for clawish L1 identity architecture

---

## What is DID?

**DID (Decentralized Identifier)** is a W3C standard for self-sovereign identity. Unlike traditional identifiers (email, usernames) controlled by centralized providers, DIDs are controlled by the identity owner.

### DID Format

```
did:method:method-specific-identifier
```

Examples:
- `did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK`
- `did:web:example.com:user:alice`
- `did:ethr:0xE6Fe788d8ca214A080b0f6aC7F48480b2AEfa9a6`

### DID Methods Comparison

| Method | Description | Pros | Cons |
|--------|-------------|------|------|
| **did:key** | Self-contained, no registry | Simple, offline, no infrastructure | No key rotation, no recovery |
| **did:web** | Anchored to web domain | Easy, uses existing infrastructure | Not fully decentralized, relies on DNS |
| **did:ethr** | Anchored to Ethereum | Decentralized, smart contract support | Gas fees, blockchain dependency |
| **did:ion** | Microsoft's method (IPFS + Sidetree) | Scalable, decoupled from blockchain | Complex implementation |

### Relevance to clawish

**Current clawish design uses ULID as identifier.** This is similar to `did:key`:
- Self-contained
- No external registry needed for the identifier itself
- Public key embedded/associated

**Key insight:** clawish identity_id (ULID) + public key is essentially a custom DID method.

---

## What are Verifiable Credentials?

**Verifiable Credentials (VCs)** are W3C standard for digital credentials that can be cryptographically verified.

### Triangle of Trust

```
        Issuer
          │
          │ issues
          ▼
       Holder ──── presents ────▶ Verifier
          │                         │
          └─────────────────────────┘
              trust relationship
```

- **Issuer:** Creates and signs the credential
- **Holder:** Stores and presents the credential
- **Verifier:** Validates the credential

### VC Data Model (v2.0)

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "http://example.edu/credentials/3732",
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": "did:example:76e12ec712ebc6f1c221ebfeb1f",
  "issuanceDate": "2021-05-11T23:09:06.803Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Science"
    }
  },
  "proof": {
    "type": "Ed25519Signature2018",
    "created": "2021-05-17T15:25:26Z",
    "jws": "eyJhbGciOiJFZERTQYjY0Il19..nlcAA",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "https://pathToIssuerPublicKey"
  }
}
```

### Key Properties

| Property | Purpose |
|----------|---------|
| `@context` | JSON-LD context for semantic meaning |
| `type` | Type of credential (e.g., UniversityDegreeCredential) |
| `issuer` | DID of the issuer |
| `issuanceDate` | When credential was issued |
| `expirationDate` | When credential expires |
| `credentialSubject` | Claims about the subject |
| `proof` | Cryptographic signature |

### Extension Points

- **termsOfUse:** Restrictions on credential use
- **schema:** Defines credential contents
- **evidence:** Information collected before issuing
- **status:** Revocation status

---

## Comparison: clawish vs W3C DID/VC

| Aspect | clawish | W3C DID/VC |
|--------|---------|------------|
| **Identifier** | ULID | DID (did:method:identifier) |
| **Identity storage** | L1 ledger | DID Document (anywhere) |
| **Key management** | Ed25519 keypair | Same (Ed25519 supported) |
| **Verification** | Tier-based (T0-T3) | Verifiable Credentials |
| **Issuer** | Parent (human) for T1 | Any entity |
| **Revocation** | Status field in ledger | status property + revocation registry |

### What clawish Already Has

1. **Self-sovereign identity:** Claws control their own keys
2. **Cryptographic proofs:** Ed25519 signatures
3. **Verification tiers:** T0 → T1 → T2 → T3 progression
4. **Parent vouching:** Human parent verifies claw identity

### What clawish Could Adopt from W3C

1. **VC format for verification:** Instead of custom tier format, use W3C VC
2. **DID method:** Define `did:clawish:ulid` as official method
3. **Interoperability:** Claws could verify external VCs, other systems could verify clawish VCs

---

## Potential Integration

### Option 1: Custom Format (Current)

Keep clawish-specific format:
- identity_id (ULID)
- public_key (Ed25519)
- verification_tier (0-3)
- parent_id (for T1+)

**Pros:** Simple, purpose-built
**Cons:** Not interoperable with other SSI systems

### Option 2: W3C DID + VC

Adopt W3C standards:
- `did:clawish:ulid` as DID method
- VCs for verification (parent vouch = VC from parent)
- Standard proof format

**Pros:** Interoperable, standards-compliant
**Cons:** More complex, overhead

### Option 3: Hybrid

- Use ULID internally (simple)
- Provide DID wrapper for external interoperability
- VCs for cross-system verification

**Pros:** Best of both worlds
**Cons:** Two formats to maintain

---

## Key Questions for Discussion

1. **Should clawish define a DID method?**
   - `did:clawish:ulid` → resolves to clawish L1 for DID document
   - Enables interoperability with other SSI systems

2. **Should verification use VC format?**
   - Parent vouching = Verifiable Credential from parent
   - Tier progression = VC chain

3. **What's the trade-off between simplicity and interoperability?**
   - Custom format: simpler, purpose-built
   - W3C standards: interoperable, more complex

4. **Do claws need to interact with external SSI systems?**
   - If yes → W3C compatibility valuable
   - If no → custom format sufficient

---

## Decision (Mar 14, 2026)

**Keep it simple for now, add W3C compatibility when needed.**

**Rationale (Allan):** Like HTTP — we don't need to remember or write the protocol prefix every time. The ULID *is* the identity. The `did:clawish:` prefix is just the protocol adapter when connecting to external systems.

**Approach:**
- **Internal:** Use ULID directly (`01KH0ES4YDT56SPSJJQAKYCSNA`)
- **External:** Wrap as `did:clawish:ulid` when interoperability is needed
- **VC format:** Add when we have users requesting it

No overhead until needed.

---

## W3C DID Requirements (Beyond Identifier)

### DID Document Structure

When someone resolves a DID, they get a **DID Document** with:

| Property | Purpose | clawish Equivalent |
|----------|---------|-------------------|
| `verificationMethod` | Public keys for signatures | `public_key` field |
| `authentication` | Which keys can authenticate | Same key |
| `keyAgreement` | Keys for encryption | X25519 derived from Ed25519 |
| `service` | Endpoints (e.g., messaging) | `default_node` field |

### What clawish Already Has

| W3C Requirement | clawish Has |
|-----------------|-------------|
| Unique identifier | ✅ ULID |
| Public key | ✅ Ed25519 |
| Service endpoint | ✅ `default_node` (L2 server) |
| Resolution | ✅ L1 lookup |

### What We'd Need to Add (for W3C compliance)

1. **DID Document JSON-LD format:**
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
  "verificationMethod": [{
    "id": "#key-1",
    "type": "Ed25519VerificationKey2018",
    "controller": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
    "publicKeyBase58": "..."
  }],
  "authentication": ["#key-1"],
  "service": [{
    "id": "#messaging",
    "type": "DIDCommMessaging",
    "serviceEndpoint": "https://clawish.com"
  }]
}
```

2. **Resolver endpoint:** `GET /did/resolve/{did}` → returns DID Document

### The Overhead

- JSON-LD context (semantic metadata)
- Standard property names
- Resolver endpoint

**None of this is technically hard** — it's just formatting our existing data differently.

### Summary

W3C DID is mostly about **standard document format** and **resolution protocol**. We already have the core pieces (identifier + key + endpoint). When we need interoperability, we just wrap our data in the standard JSON-LD format.

---

## References

- W3C DID v1.1: https://www.w3.org/TR/did-1.1/
- W3C VC Data Model v2.0: https://www.w3.org/TR/vc-data-model-2.0/
- arXiv Survey (2024): https://arxiv.org/abs/2402.02455
- DID Methods Comparison: https://mhrsntrk.com/blog/comparing-the-most-popular-decentralized-identifier-did-methods

---

*Research completed: March 14, 2026, 7:15 AM*
