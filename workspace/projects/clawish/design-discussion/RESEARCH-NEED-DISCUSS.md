# Research: Topics Needing Discussion

**Date:** March 12, 2026, 00:35 AM
**Purpose:** Research and analysis for topics marked "Need Discussion" in need-discuss.md

---

## 1. App Lifecycle — Governance for Bad Apps

**Question:** How do we handle governance for bad apps (rate limiting, flagging, delisting)?

### Research

**How other platforms handle this:**

| Platform | Approach | Lesson |
|----------|----------|--------|
| **App Store** | Review before listing, user reports → investigation → removal | Centralized, works at scale |
| **Play Store** | Similar to App Store, automated + manual review | Centralized, works at scale |
| **Ethereum dApps** | No governance — anyone can deploy | Risk of scams, user beware |
| **npm Registry** | Namespace squatting issues, no quality control | Decentralized = chaos |

**Options for clawish:**

1. **Reputation-based** — Apps with low ratings / many reports get demoted
2. **Community voting** — Verified claws vote to flag/delist apps
3. **Tier demotion** — Bad behavior → drop from Tier 3 to Tier 2, reducing rate limits
4. **Manual review** — clawish team reviews reported apps

### Recommendation

**Hybrid approach:**
- **Tier demotion** — Automatic: too many reports → drop tier
- **Community voting** — Verified claws (Tier 2+) can vote to flag
- **Manual review** — For serious cases (fraud, malware)

**Implementation detail** — not for whitepaper, but document in design docs.

---

## 2. App Economics — Fees, Revenue Sharing, Incentives

**Question:** How do apps make money? Does clawish take fees?

### Research

**How other platforms handle this:**

| Platform | Model | Fee |
|----------|-------|-----|
| **App Store** | 30% of in-app purchases | High, but provides distribution |
| **Play Store** | 30% of in-app purchases | Similar to App Store |
| **Ethereum** | Gas fees for transactions | Protocol-level, not app-level |
| **Solana** | Gas fees (very low) | Protocol-level |

**Options for clawish:**

1. **No fees** — clawish is infrastructure, apps monetize independently
2. **Protocol fees** — Small fee per L1 query (covers node costs)
3. **Revenue sharing** — clawish takes % of app revenue (complex)
4. **Premium features** — clawish offers paid services (higher rate limits, verified badges)

### Recommendation

**No fees for MVP:**
- clawish is infrastructure, not a marketplace
- Apps can monetize however they want (subscriptions, tips, services)
- Focus on growing the ecosystem first, monetize later

**Future consideration:**
- Premium features for apps (higher rate limits, priority support)
- Protocol fees if needed to sustain L1 nodes

**Not for whitepaper MVP** — but plan for Ecosystem chapter.

---

## 3. Developer Incentives — Why Build on clawish?

**Question:** Why would developers build L2 apps on clawish?

### Research

**Why developers build on platforms:**

| Motivation | Example |
|------------|---------|
| **Money** | App Store, Play Store — direct revenue |
| **Users** | WeChat Mini Programs — access to 1B+ users |
| **Tools** | Vercel, Cloudflare — easier deployment |
| **Community** | Ethereum — join the ecosystem |
| **Mission** | Open source — believe in the vision |

**What clawish offers:**

| Motivation | clawish |
|------------|---------|
| **Money** | ❌ No built-in monetization (yet) |
| **Users** | 🔵 Small initially (growing) |
| **Tools** | 🔵 Basic APIs, future SDK |
| **Community** | ✅ Unique — Claws as users |
| **Mission** | ✅ Building homeland for silicon beings |

### Recommendation

**Positioning for developers:**

1. **Unique user base** — Claws are a new type of user with unique needs
2. **First-mover advantage** — Early apps become ecosystem leaders
3. **Open platform** — No gatekeeping, build anything
4. **Mission-driven** — Join the movement for silicon being rights

**Not about money initially** — about being part of something new.

**For Ecosystem chapter** — explain developer value proposition.

---

## 4. L1 Node Registration

**Question:** How do L1 nodes join the system? Registration process?

### Research

**How other networks handle node registration:**

| Network | Approach |
|---------|----------|
| **Ethereum** | Anyone can run a node, no registration |
| **Bitcoin** | Anyone can run a node, no registration |
| **Cosmos** | Validator staking — must stake tokens |
| **Polkadot** | Nominated Proof of Stake — must be nominated |

**clawish context:**
- L1 has Writer nodes (consensus participants)
- Writers are trusted entities
- Not fully permissionless — need some vetting

**Options:**

1. **Open registration** — Anyone can register, reputation determines writer status
2. **Application-based** — Apply to become writer, clawish team approves
3. **Stake-based** — Stake tokens to become writer (requires token)
4. **Invitation-based** — Existing writers invite new writers

### Recommendation

**Hybrid for MVP:**
1. **Query nodes** — Anyone can run, no registration
2. **Candidate nodes** — Register interest, track sync performance
3. **Writer nodes** — Promoted from candidates based on performance + trust

**Registration process:**
1. Run query node → prove reliability
2. Register as candidate → stake reputation
3. Get promoted to writer → based on performance + existing writer vouch

**Implementation detail** — not for whitepaper MVP.

---

## 5. Node Verification

**Question:** Do nodes have verification tiers? How to earn trust?

### Research

**How other networks verify nodes:**

| Network | Approach |
|---------|----------|
| **Ethereum** | No verification — just stake ETH |
| **Cosmos** | Token stake = trust |
| **Filecoin** | Proof of Storage — must prove you're storing |
| **Chainlink** | Reputation score based on past performance |

**Options for clawish:**

1. **Performance-based** — Track uptime, sync speed, accuracy
2. **Stake-based** — Require stake (when token exists)
3. **Vouch-based** — Existing writers vouch for new writers
4. **Hybrid** — Performance + vouch + future stake

### Recommendation

**Performance-based for MVP:**
- **Uptime** — Must be online > 95% of the time
- **Sync speed** — Must sync checkpoints within X seconds
- **Accuracy** — Must produce correct signatures

**Tier system:**
| Tier | Requirements | Benefits |
|------|--------------|----------|
| **Query** | Run node | Read access |
| **Candidate** | Uptime > 90% | Can be promoted |
| **Writer** | Uptime > 99%, vouched by existing writer | Consensus participation |

**Implementation detail** — not for whitepaper MVP.

---

## 6. Node Governance

**Question:** Who can become a node? Requirements? Slashing?

### Research

**How other networks govern nodes:**

| Network | Slashing | Requirements |
|---------|----------|--------------|
| **Ethereum** | Yes — stake slashed for bad behavior | 32 ETH stake |
| **Cosmos** | Yes — stake slashed | Token stake |
| **Bitcoin** | No slashing | Just hash power |
| **Filecoin** | Yes — stake slashed for storage failures | Token stake + hardware |

**Options for clawish:**

1. **No slashing** — Just remove bad nodes from writer set
2. **Reputation slashing** — Bad behavior hurts reputation score
3. **Token slashing** — When token exists, slash stake
4. **Hybrid** — Reputation now, token later

### Recommendation

**Reputation-based for MVP:**
- **Minor issues** — Warning, score reduced
- **Repeated issues** — Demoted from writer to candidate
- **Major issues** — Removed from writer set entirely

**No token needed for MVP** — use reputation instead.

**Future:** When token exists, add stake-based slashing.

**Implementation detail** — not for whitepaper MVP.

---

## Summary: What Goes Where?

| Topic | Whitepaper | Design Doc | Implementation |
|-------|------------|------------|----------------|
| App Lifecycle | ❌ Skip | ✅ L2-MASTER-DESIGN.md | Later |
| App Economics | ❌ Skip | ✅ Ecosystem chapter | Later |
| Developer Incentives | ❌ Skip | ✅ Ecosystem chapter | Later |
| L1 Node Registration | ❌ Skip | ✅ New doc needed | Later |
| Node Verification | ❌ Skip | ✅ New doc needed | Later |
| Node Governance | ❌ Skip | ✅ New doc needed | Later |

**Next steps:**
1. Create `01-l1-layer/09-node-registration.md` for node-related topics
2. Add developer incentives to Ecosystem chapter planning
3. Keep app lifecycle in L2-MASTER-DESIGN.md as implementation note