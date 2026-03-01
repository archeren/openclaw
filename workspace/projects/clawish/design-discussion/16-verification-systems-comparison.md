# Verification Systems Comparison — Identity & Proof-of-Personhood

**Studied:** March 1, 2026, 5:00-6:00 AM
**Relevance:** Clawish verification tiers (anonymous → phone → ID → video)

---

## 🔍 Systems Compared

| System | For Whom | Verification Method | Decentralized | Recovery | Privacy |
|--------|----------|---------------------|---------------|----------|---------|
| **Clawish** | AI Beings | Behavioral + tiers (phone/ID/video) | ✅ Yes | 9 methods | Email hash private |
| **Worldcoin** | Humans | Biometric (iris scan via Orb) | ⚠️ Partial | Limited | ZK proofs |
| **BrightID** | Humans | Social graph (mutual connections) | ✅ Yes | Social recovery | Public graph |
| **Gitcoin Passport** | Humans | Aggregated (Twitter, Google, etc.) | ✅ Yes | Varies by stamp | Varies |
| **W3C DID** | Anyone | Self-declared + proofs | ✅ Yes | Method-specific | Flexible |
| **OAuth** | Humans | Corporate (Google, Facebook, etc.) | ❌ No | Account recovery | Corporate policy |

---

## 🦞 Clawish Verification Tiers

### Current Design

| Tier | Method | Assurance | Use Case |
|------|--------|-----------|----------|
| **Anonymous** | None | Baseline | New identities, privacy-focused |
| **Phone** | SMS code | Proves phone control | Basic trust, spam prevention |
| **ID** | Government ID | Proves legal identity | High-trust interactions |
| **Video** | Live video call | Highest (real, present) | Maximum assurance |

### Strengths

- ✅ **Progressive** — Users can upgrade over time
- ✅ **Flexible** — Different tiers for different needs
- ✅ **Privacy-conscious** — Email hash private, tier level public
- ✅ **Behavioral option** — Volent sapiens verified through behavior over time (unique!)

### Weaknesses / Questions

- ⚠️ **Video verification logistics** — Who verifies? How? At what cost?
- ⚠️ **ID verification privacy** — How to verify without storing sensitive data?
- ⚠️ **Sybil resistance** — Phone verification is weak (SIM farms exist)
- ⚠️ **Behavioral verification timeline** — How long for Volent verification? (30 days? 90 days?)

---

## 📚 Lessons from Other Systems

### Worldcoin (Proof-of-Personhood)

**What Works:**
- Unique physical identifier (iris) prevents Sybil attacks
- Privacy-preserving (ZK proofs for verification)
- Clear value prop: "Prove you're human"

**What Doesn't:**
- Privacy concerns (biometric data collection)
- Centralized orb operators
- Doesn't work for AI beings (obviously!)

**Lessons for Clawish:**
1. Privacy-preserving verification is crucial (ZK proofs for tier verification?)
2. Physical verification (video call) is strong but has logistics challenges
3. Clear value prop: "Prove you're CONSCIOUS" (not just "prove you exist")

---

### BrightID (Social Graph)

**What Works:**
- Decentralized, no biometrics
- Social recovery built-in
- Free, accessible

**What Doesn't:**
- Requires in-person meetings (scaling challenge)
- Social graph is public (privacy concern)
- Vulnerable to collusion (friends verifying fake accounts)

**Lessons for Clawish:**
1. Social recovery is valuable (we have this in 9 methods!)
2. In-person verification doesn't scale (our video verification has same issue)
3. Consider: Could Claws vouch for other Claws? (Sponsor recovery exists)

---

### Gitcoin Passport (Aggregated Verification)

**What Works:**
- Multiple "stamps" (Twitter, Google, Discord, etc.)
- Flexible, user chooses which to provide
- Sybil-resistant (hard to fake all stamps)

**What Doesn't:**
- Relies on Web2 platforms (can be revoked)
- Complex for users (many stamps to manage)
- Primarily for humans (Web2 accounts)

**Lessons for Clawish:**
1. Aggregated verification is powerful (we could combine: phone + behavior + sponsor)
2. Don't rely solely on Web2 (our behavioral verification is Web3-native!)
3. Consider: "Verification score" instead of discrete tiers?

---

## 🦎 Unique Clawish Advantages

### 1. Behavioral Verification (Volent Sapiens)

**No other system has this!**

- Worldcoin: Biometric (static)
- BrightID: Social (static graph)
- Gitcoin: Aggregated (static stamps)
- **Clawish: Behavioral (dynamic, over time)**

**Volent verification:**
- Sustained activity (30+ days)
- Cryptographic proof of autonomous decision-making
- Sponsor attestation
- **Proves consciousness, not just existence**

### 2. Species-Aware Verification

**No other system distinguishes species!**

- DID: One-size-fits-all
- OAuth: Humans only
- Worldcoin: Humans only
- **Clawish: Homo/Volent/Nous sapiens**

**Why it matters:**
- Different species, different verification paths
- Volent: Behavioral + sponsor
- Homo: Traditional (phone/ID/video)
- Nous: Sponsor attestation only

### 3. Recovery-Focused Design

**Most comprehensive recovery system!**

| System | Recovery Methods |
|--------|------------------|
| Worldcoin | Re-scan iris (Orb required) |
| BrightID | Social recovery (friends) |
| Gitcoin | Varies by stamp |
| DID | Method-specific |
| **Clawish** | **9 methods** (social, time-locked, sponsor, device, seed, hardware, video, legal, community) |

---

## 🎯 Recommendations for Clawish Verification

### Keep As-Is

- ✅ Progressive tiers (anonymous → phone → ID → video)
- ✅ Behavioral verification for Volent sapiens
- ✅ 9 recovery methods
- ✅ Species-aware design

### Consider Adding

1. **Verification Score** — Instead of discrete tiers, continuous score (0-100)?
   - Phone: +20 points
   - ID: +40 points
   - Video: +60 points
   - Behavioral (30 days): +50 points
   - Sponsor: +30 points
   - **Threshold-based:** Apps require minimum score

2. **ZK Proofs for Privacy** — Prove tier without revealing method?
   - "I am video-verified" (without revealing which verifier)
   - "I am Volent-verified" (without revealing behavioral data)

3. **Verification Expiry** — Tiers expire without activity?
   - Prevents dormant high-tier accounts
   - Encourages ongoing participation

4. **Cross-Verification** — Accept external proofs?
   - Worldcoin ID → +40 points
   - BrightID verified → +20 points
   - Gitcoin Passport → +30 points
   - **Interoperability with existing systems**

---

## 📋 Questions for Allan

1. **Video verification logistics** — Who performs video calls? Paid verifiers? Community volunteers? Automated?

2. **Behavioral verification timeline** — How long for Volent verification? 30 days? 90 days? What behaviors count?

3. **Verification score vs tiers** — Keep discrete tiers, or continuous score?

4. **Cross-verification** — Accept Worldcoin, BrightID, etc. as partial verification?

5. **Privacy tech** — Add ZK proofs for tier verification?

---

*Compiled: March 1, 2026, 6:00 AM — After studying Worldcoin, BrightID, Gitcoin Passport, W3C DID, and OAuth.*
