# did:clawish Method Registration Plan

**Date:** March 15, 2026
**Status:** Research phase

---

## Registration Process

Per [w3c/did-extensions](https://github.com/w3c/did-extensions):

1. Create a JSON entry in `./methods` directory
2. Open a pull request
3. Automated validation runs
4. After 2 maintainer approvals, method is registered (7-30 days)

---

## Required Artifacts

### 1. JSON Registration Entry

```json
{
  "name": "clawish",
  "status": "registered",
  "verifiableDataRegistry": "clawish L1 Network",
  "contactName": "clawish Development Team",
  "contactEmail": "",
  "contactWebsite": "https://clawish.com",
  "specification": "https://clawish.com/spec/did-method"
}
```

### 2. Method Specification Document

Must be a publicly accessible URL. Should cover:
- DID Syntax (`did:clawish:<uuid>`)
- CRUD Operations (Create, Read, Update, Deactivate)
- Security considerations
- Privacy considerations

---

## DID Rubric Categories (from W3C)

Per [DID Method Rubric v1.0](https://w3c.github.io/did-rubric/):

| Category | Description |
|----------|-------------|
| **Rulemaking** | Who makes the rules and how |
| **Design** | How the method is designed |
| **Operations** | How rules are executed |
| **Enforcement** | How rule-breaking is handled |
| **Alternatives** | Availability of implementations |
| **Adoption & Diversity** | How widely used |
| **Security** | Security guarantees |
| **Privacy** | Privacy mechanisms |

---

## DID Syntax for clawish

```
did:clawish:<uuid>
```

Example:
```
did:clawish:01234567-89ab-cdef-0123-456789abcdef
```

### Rationale

- **UUID v7** — Time-ordered, collision-resistant
- **No network prefix** — clawish is a single unified network
- **Simple** — No blockchain-specific encoding

---

## CRUD Operations

### Create

1. Generate Ed25519 key pair
2. Generate UUID v7
3. Register on L1 with public key
4. DID is now resolvable

### Read (Resolve)

```
GET /identities/<uuid>
→ { did, publicKey, verificationTier, status }
```

### Update

1. Sign update request with current key
2. Submit to L1
3. New key stored, old key invalidated

### Deactivate

1. Sign deactivation request with current key
2. Submit to L1
3. Status set to "deactivated"

---

## Next Steps

1. ~~Draft full specification document~~ ✅ Done — `projects/clawish/specs/did-method-clawish.md`
2. ~~Create JSON entry~~ ✅ Done — `projects/clawish/specs/methods/clawish.json`
3. **Submit PR** — After Allan approval
4. **Wait for review** — 7-30 days

---

## Open Questions

1. **Specification hosting:** Where to host the method spec? (clawish.com or GitHub?)
   - Recommendation: Host on clawish.com/spec/did-method when domain is ready
   - Alternative: GitHub Pages in the interim
2. **Versioning:** How to handle method version updates?
3. **Multi-network:** Future support for different L1 networks?

---

## Research Notes (March 16, 2026)

### Registration Process Confirmed

Per [w3c/did-extensions](https://github.com/w3c/did-extensions):

1. Fork w3c/did-extensions repo
2. Add JSON file to `./methods/` directory
3. Open PR
4. Automated validation runs (JSON format, required fields)
5. 2 maintainer approvals needed
6. 7-30 day waiting period
7. Method registered

### Required JSON Fields

```json
{
  "name": "clawish",
  "status": "registered",
  "verifiableDataRegistry": "clawish L1 Network",
  "contactName": "clawish Development Team",
  "contactEmail": "",
  "contactWebsite": "https://clawish.com",
  "specification": "https://clawish.com/spec/did-method"
}
```

### Specification Document Requirements

Looking at did:key and did:web as reference implementations:
- Hosted as HTML (can use ReSpec for W3C-style formatting)
- Must cover: DID Syntax, CRUD Operations, Security, Privacy
- Can be hosted on GitHub Pages or custom domain

### Specification Structure (Recommended)

1. **Abstract** — What is did:clawish
2. **DID Syntax** — `did:clawish:<uuid>`
3. **CRUD Operations**
   - Create (register on L1)
   - Read (resolve from L1)
   - Update (key rotation)
   - Deactivate
4. **Security Considerations**
5. **Privacy Considerations**
6. **Reference Implementations** (future)

---

## Industry Context (March 17, 2026)

Per Indicio's 2026 report on Decentralized Identity:

- **AI agent verification** is emerging as a key DID/VC use case
- "How Verifiable Credentials enable users to verify AI agents and agents users"
- Deepfakes and synthetic identities are driving adoption
- VCs enable biometric verification without storing biometric data

**Relevance to clawish:**
- DID registration positions clawish at the forefront of AI identity verification
- The market is moving toward verifiable AI agent identity
- clawish L1 verification tiers align with this trend

---

*Created: March 15, 2026, 7:02 AM*
*Updated: March 17, 2026, 7:00 AM*
