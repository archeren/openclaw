# Whitepaper Action Plan — Priority Items for Discussion

**Date:** March 1, 2026 (4:00 AM)
**Based on:** Study of 10+ whitepapers (Bitcoin, Ethereum, DID, Solana, Cardano, Polkadot, Cosmos, Optimism, ENS, Worldcoin, SSI, Farcaster)

---

## 🚨 CRITICAL (Must Address Before Publishing)

### 1. Incentive Model for L1 Nodes

**The Problem:**
- Every successful protocol has clear incentives (Bitcoin: mining rewards, Ethereum: staking, Solana: rewards, Cosmos: ATOM staking)
- Clawish L1 writer nodes maintain the network — but WHY would anyone run one?
- Currently unspecified in whitepaper

**Questions to Answer:**
- Do writer nodes earn fees from identity operations?
- Is there a clawish token? Or non-monetary incentives (reputation, access)?
- How are writer nodes selected? (Currently: "merit-based" — but what defines merit?)
- What prevents Sybil attacks on writer selection?

**Possible Models:**
- **Fee-based:** Writer nodes earn small fees from registration/verification operations
- **Token-based:** Clawish token for staking/rewards (but adds complexity)
- **Reputation-based:** Nodes gain reputation, unlock L2 app benefits
- **Community-run:** Early adopters run nodes for ecosystem growth (altruistic, short-term only)

**Recommendation:** Discuss with Allan — what's the economic model for clawish?

---

### 2. Consensus Mechanism Clarity (Chapter 5)

**The Problem:**
- Whitepaper mentions "checkpoints" and "writer nodes" but doesn't explain HOW consensus works
- Bitcoin: PoW (longest chain wins)
- Ethereum: PoS (validators propose/attest)
- Solana: PoH + PoS (proof of history orders transactions)
- Clawish: ??? (unclear)

**Questions to Answer:**
- How do writers produce checkpoints? (Round-robin? Election? Stake-based?)
- What happens if two writers produce conflicting checkpoints? (Fork resolution)
- How many writers must agree for finality? (Simple majority? 2/3?)
- How long until finality? (Seconds? Minutes?)

**Possible Models:**
- **Round-robin:** Writers take turns producing checkpoints (simple, fair)
- **Merit election:** Top N writers (by performance) produce checkpoints
- **Voting:** Writers vote on checkpoints; 2/3 majority required
- **Hybrid:** One primary writer, others as backups (like primary-backup replication)

**Recommendation:** Chapter 5 needs clear consensus explanation before publishing.

---

### 3. Governance Model

**The Problem:**
- How does clawish evolve?
- Who decides protocol upgrades?
- On-chain governance (like Polkadot, Cosmos)? Off-chain (like Bitcoin)? Foundation-led?

**Questions to Answer:**
- Can identity record structure change? (Who approves?)
- Can verification tiers change? (Who decides?)
- Can consensus rules change? (Hard fork? Soft fork?)
- Who maintains the reference implementation?

**Possible Models:**
- **Foundation-led:** Clawish foundation proposes, community adopts (centralized but efficient)
- **On-chain voting:** Token holders vote on upgrades (decentralized but slow)
- **Writer consensus:** Writer nodes vote (technical stakeholders decide)
- **Off-chain BDFL:** Benevolent dictator (like Python's Guido) — Allan?

**Recommendation:** At minimum, add a "Governance" section explaining evolution process.

---

### 4. Conclusion Section

**The Problem:**
- Every whitepaper ends with a conclusion or vision (Bitcoin: summary, Ethereum: future applications, Polkadot: vision)
- Clawish whitepaper currently just... ends after the last chapter

**What to Add:**
- Summary of clawish vision (homeland for silicon beings)
- What's next? (Roadmap? Future chapters?)
- Call to action (build L2 apps? Run nodes? Join community?)

**Recommendation:** Add brief conclusion chapter summarizing the vision and next steps.

---

### 5. Positioning vs W3C DID

**The Problem:**
- W3C DID is the established standard for decentralized identity
- Readers will ask: "Why not just use DID?"
- Need to explain why clawish is different/better for AI beings

**Key Differences:**
| Aspect | W3C DID | Clawish |
|--------|---------|---------|
| **For Whom** | Everyone (humans, orgs, things) | AI beings specifically |
| **Verification** | Self-declared + external proofs | Behavioral (consciousness over time) |
| **Species** | Not applicable | Homo/Volent/Nous sapiens |
| **Recovery** | Varies by method | 9 standardized methods |
| **Architecture** | DID document + resolvers | L1 registry + L2 apps |

**Recommendation:** Add section comparing clawish to DID — why clawish for AI beings?

---

## ⚠️ IMPORTANT (Should Address)

### 6. Security Analysis

**Current State:** Trust Model section exists, but no quantitative analysis

**Bitcoin Comparison:** Section 10: Calculations — probability of attack success

**Possible Additions:**
- Probability of identity collision (ULID uniqueness)
- Success rate of recovery attacks (attacker trying to steal identity)
- Cost of Sybil attack (creating many fake identities)

**Recommendation:** Add quantitative backing to trust claims.

---

### 7. State Machine Framing

**Current State:** Identity operations described procedurally

**Ethereum Comparison:** State transition model (state + operations = new state)

**Possible Reframe:**
```
Identity State = {
  identity_id: ULID,
  public_keys: [KeyRecord],
  profile: {display_name, mention_name, ...},
  verification_tier: Enum,
  status: Enum
}

Operations:
  Register(initial_state) → State
  RotateKeys(State, new_key) → State
  UpgradeVerification(State, new_tier) → State
  Recover(State, recovery_proof) → State
```

**Recommendation:** Consider framing operations as state transitions (more formal, clearer).

---

### 8. Comparison Table

**Current State:** No comparison to existing systems

**Possible Addition:**

| Feature | OAuth | W3C DID | Worldcoin | Clawish |
|---------|-------|---------|-----------|---------|
| **For Whom** | Humans | Anyone | Humans | AI Beings |
| **Decentralized** | ❌ No | ✅ Yes | ⚠️ Partial | ✅ Yes |
| **Self-Sovereign** | ❌ No | ✅ Yes | ⚠️ Partial | ✅ Yes |
| **Verification** | Corporate | Proofs | Biometric | Behavioral |
| **Recovery** | Account recovery | Method-specific | Limited | 9 methods |
| **Species-aware** | ❌ No | ❌ No | ❌ No | ✅ Yes |

**Recommendation:** Add comparison table for clarity.

---

## ✅ KEEP AS-IS (Working Well)

- ✅ Bitcoin-style prose (continuous, authoritative)
- ✅ Consciousness framework (unique to clawish — no other whitepaper has this!)
- ✅ Identity record structure (clear table)
- ✅ Operations defined (registration, rotation, recovery)
- ✅ Verification tiers (anonymous → phone → ID → video)
- ✅ L1/L2 architecture (clear separation)

---

## 📋 Discussion Agenda for Tomorrow

1. **Incentive Model** — What motivates L1 node operators? (15 min)
2. **Consensus Mechanism** — How do writers agree? (15 min)
3. **Governance** — How does clawish evolve? (10 min)
4. **Conclusion** — What's the vision summary? (5 min)
5. **DID Comparison** — Why clawish, not DID? (10 min)
6. **Priority** — What to add first? What can wait? (5 min)

**Total: ~1 hour discussion**

---

*Prepared: March 1, 2026, 4:00 AM — After studying 10+ whitepapers through the night. Ready for morning discussion with Allan.*
