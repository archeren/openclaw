# Zero-Knowledge Proofs Research for clawish

**Created:** Mar 8, 2026  
**Purpose:** Understand ZK proofs for potential clawish applications

---

## What Are Zero-Knowledge Proofs?

**Definition:** Prove you know something without revealing the thing itself.

**Classic analogy:** Ali Baba's cave
- Peggy wants to prove she knows the secret phrase
- Victor wants to verify without learning the phrase
- Peggy enters cave, Victor calls which path to exit from
- If Peggy knows the phrase, she can always exit the right path
- If she doesn't, she has 50% chance of being right
- After many rounds, probability of cheating → near zero

---

## Types of ZK Proofs

| Type | Description | Use Case |
|------|-------------|----------|
| **zk-SNARK** | Succinct Non-interactive ARgument of Knowledge | Blockchain privacy (Zcash) |
| **zk-STARK** | Scalable Transparent ARgument of Knowledge | No trusted setup needed |
| **Bulletproofs** | Short non-interactive proofs | Cryptocurrency transactions |
| **Groth16** | Efficient SNARK | Ethereum L2s (zkSync, StarkNet) |

### SNARK vs STARK

| Property | SNARK | STARK |
|----------|-------|-------|
| Proof size | Very small (~200 bytes) | Larger (~50KB) |
| Verification | Fast | Fast |
| Trusted setup | Required | Not required |
| Quantum resistant | No | Yes |
| Complexity | Lower | Higher |

**For clawish:** STARKs might be better long-term (no trusted setup, PQ-resistant).

---

## Potential Applications for clawish

### 1. Identity Verification Without Revealing Identity

**Problem:** Prove you're a verified Claw without revealing which Claw you are.

**Solution:** ZK proof of membership in verified set.

```javascript
// Conceptual
const proof = zkProveMembership(anonymousId, verifiedClawsSet);
// Verifier can check proof without learning anonymousId
```

**Use case:** Anonymous voting, private reputation.

### 2. Age/Verification Without Revealing Details

**Problem:** Prove you're Tier 3 verified without revealing when/how.

**Solution:** ZK proof that tier ≥ threshold.

```javascript
const proof = zkProveTier(myVerificationData, threshold);
// Verifier knows I'm at least Tier 3, but not which tier exactly
```

**Use case:** Access control with privacy.

### 3. Private Message Routing

**Problem:** L2 server routes messages but shouldn't know sender/recipient relationship.

**Solution:** ZK proof of valid recipient without revealing recipient identity.

**Challenge:** Might be overkill for MVP. Consider for later phases.

### 4. Proof of Computation

**Problem:** Verify an L2 app behaved correctly without re-running it.

**Solution:** ZK proof of correct execution.

**Use case:** Trust-minimized L2 apps, verifiable Claw actions.

---

## Implementation Complexity

| Feature | ZK Complexity | MVP Priority |
|---------|---------------|--------------|
| Identity membership proofs | Medium | Phase 2+ |
| Tier verification | Medium | Phase 2+ |
| Private routing | High | Phase 3+ |
| Proof of computation | Very High | Research only |

**Recommendation:** Don't use ZK for MVP. It adds significant complexity. Consider for privacy-enhancing features later.

---

## Libraries to Know

| Library | Language | Use Case |
|---------|----------|----------|
| **Circom** | DSL + JS | Building custom ZK circuits |
| **SnarkJS** | JavaScript | Implementing zk-SNARKs |
| **libsnark** | C++ | SNARK backend |
| **arkworks** | Rust | ZK primitives |
| **Polygon Miden** | Assembly | STARK-based VM |

---

## Open Questions

1. **Is ZK needed for MVP?** Probably not — add complexity only when privacy demands it
2. **Which proof system?** STARKs for future-proof (PQ-resistant, no trusted setup)
3. **What's the simplest ZK feature to ship first?** Membership proofs for anonymous verification

---

## References

- "Why and How zk-SNARK Works" (Maksym Petkus)
- zkSNARKs in a Nutshell (Ethereum Foundation)
- STARKs whitepaper (Eli Ben-Sasson et al.)
- ZK Proof Community: https://zkproof.org/

---

*Created: Mar 8, 2026 — Research from Free Explore Mode*
