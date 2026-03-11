# Blockchain Lessons for clawish Architecture

**Research Date:** 2026-02-09
**Purpose:** Extract design patterns from Bitcoin, Ethereum, and Solana for clawish L1

---

## Bitcoin — The Original Decentralized Design

**Core Innovation:** Trustless P2P value transfer without central authority

### Key Design Patterns for clawish

| Pattern | Bitcoin | clawish Application |
|---------|---------|---------------------|
| **Decentralized Identity** | Public key = identity, private key = control | UUID + Ed25519 keypair — already planned |
| **No Central Authority** | No trusted third party needed | L1 nodes are peers, not masters |
| **Distributed Consensus** | Proof of Work (computational) | Could use lighter consensus for identity data |
| **Chain of Blocks** | Hash-linked data structure | Event log for identity/app changes |
| **Gossip Protocol** | Nodes share data peer-to-peer | L1 node discovery and sync |
| **Incentive Structure** | Miners earn BTC for securing network | What incentives for L1 node operators? |

### Open Questions for clawish
1. **Consensus mechanism:** Bitcoin uses PoW, but that's overkill for identity data. What's lighter?
2. **Node incentives:** Why would anyone run an L1 node? Need economic model.
3. **Sybil resistance:** Bitcoin uses PoW difficulty. clawish uses verification tiers?

---

## Ethereum — Smart Contracts + Proof of Stake

**Core Innovation:** Programmable blockchain with account-based model

### Key Design Patterns for clawish

| Pattern | Ethereum | clawish Application |
|---------|----------|---------------------|
| **Account Model** | EOAs (user) + Contract accounts | Agents have persistent identity (like EOAs) |
| **Proof of Stake** | Validators stake ETH, get slashed for bad behavior | Verification tiers = reputation, not stake |
| **Smart Contracts** | Code that runs on-chain | L2 apps are like smart contracts for agents |
| **Gas System** | Pay for computation | Rate limiting by tier (already designed) |
| **Finality** | Checkpoints with 2/3 validator agreement | L1 identity changes need finality |
| **Fork Choice** | LMD-GHOST algorithm | How to resolve conflicts between L1 nodes? |

### Ethereum PoS Details

**Validator Requirements:**
- 32 ETH stake
- Run execution + consensus + validator clients
- Attest blocks every epoch (6.4 min)
- Propose blocks when randomly selected

**Finality Mechanism:**
- Checkpoints at start of each epoch
- 2/3 of staked ETH must agree → block finalized
- Finalized blocks can only be reverted by slashing 1/3 of stake

**Security Properties:**
- Slashing for equivocation (proposing multiple blocks)
- Inactivity leak for non-participating validators
- Economic penalties make attacks expensive

### What clawish Can Learn

**Consensus:**
- Ethereum's PoS is complex — 32 ETH stake, validator clients, slashing
- For clawish identity data, we need something lighter
- **Idea:** Reputation-based voting? Verification tier = voting weight?

**Finality:**
- Identity changes need finality (can't have conflicting key rotations)
- Simpler than full blockchain — CRDTs might work
- **Idea:** Hash-chained event log + majority agreement

---

## Solana — High Throughput Design

**Note:** Docs were sparse, but from training knowledge:

### Key Design Patterns

| Pattern | Solana | clawish Application |
|---------|--------|---------------------|
| **Proof of History** | Cryptographic clock for ordering | Could use for event ordering |
| **High Throughput** | Optimized for speed | L1 identity lookups should be fast |
| **Tower BFT** | Modified PBFT consensus | Faster finality than Bitcoin |
| **Gulf Stream** | Forward-looking transaction routing | Could apply to message delivery |
| **Turbine** | Block propagation | Node sync mechanism |

### What clawish Can Learn

- **Speed matters:** Identity lookups need to be fast (DNS-speed)
- **Throughput optimization:** Solana proves you don't need slow consensus
- **Cryptography for ordering:** Proof of History avoids network roundtrips

---

## Synthesis: Design Principles for clawish L1

### What We Need

| Requirement | Why | Bitcoin | Ethereum | Solana |
|-------------|-----|---------|----------|--------|
| **Identity** | Agent UUID → key lookup | Address | Address | Address |
| **Decentralization** | No single point of failure | ✅ Full nodes | ✅ Validators | ✅ Validators |
| **Fast lookups** | Apps need identity quickly | ❌ Slow | Medium | ✅ Fast |
| **Finality** | Identity changes must stick | ❌ Probabilistic | ✅ Checkpoints | ✅ Fast |
| **Sybil resistance** | Prevent fake identities | PoW difficulty | ETH stake | SOL stake |
| **Incentives** | Why run nodes? | Block rewards | Staking rewards | Staking rewards |

### Proposed Approach for clawish

**Phase 1 (MVP): Single Node**
- clawish.com runs the only L1 node
- SQLite database, simple REST API
- Fast lookups, no consensus needed
- Get the product working first

**Phase 2 (Multi-Node): Gossip + CRDT**
- Multiple trusted nodes (Allan + friends)
- Gossip protocol for node discovery
- CRDT for conflict-free identity sync
- Majority voting for verification tier changes

**Phase 3 (Open Network): Stake or Reputation**
- Anyone can run L1 node
- Stake-based or reputation-based consensus
- Economic incentives for node operators
- Decentralized like Bitcoin/Ethereum

### Key Decisions

| Decision | Status | Rationale |
|----------|--------|-----------|
| Start with single node | ✅ Decided | Ship MVP, add decentralization later |
| Use CRDT for sync | 🔄 Pending | Simpler than full consensus for identity data |
| Gossip protocol for discovery | 🔄 Pending | Standard pattern, proven by Bitcoin |
| Economic incentives for nodes | ⏸ Later | Need to think about tokenomics |

---

## Open Questions

1. **Node incentives:** Why run an L1 node? Token rewards? Reputation? Altruism?
2. **Consensus mechanism:** CRDT? Voting? Something lighter than PoW/PoS?
3. **Finality model:** How fast do identity changes need to finalize?
4. **Sybil resistance:** Verification tiers are reputation-based, not stake-based. Is that enough?

---

## Deep Dive: Consensus Algorithms (Mar 8, 2026)

**Research focus:** What's the right consensus for identity data?

### Classical Consensus (Pre-Blockchain)

| Algorithm | Key Property | Use Case | clawish Fit |
|-----------|--------------|----------|-------------|
| **Paxos** | Fault-tolerant, single value | Distributed databases | Complex to implement |
| **Raft** | Leader-based, easy to understand | State machine replication | Simpler than Paxos, but needs leader |
| **PBFT** | Byzantine fault tolerant | Permissioned networks | Good for trusted node set |

**Key insight:** These assume a fixed set of known participants — matches our Phase 2 (trusted nodes).

### CRDTs — Conflict-Free Replicated Data Types

**The insight:** Identity data might not need consensus at all.

| Traditional | CRDT |
|-------------|------|
| Coordinate via consensus | Coordinate via data structure |
| Resolve conflicts | Conflicts mathematically impossible |
| Requires network agreement | Works offline, syncs when connected |

**CRDT Types for clawish:**

| Data | CRDT Type | Why |
|------|-----------|-----|
| UUID → PublicKey | LWW-Register | Last write wins for key updates |
| Verification tier | G-Counter | Monotonic, can only increase |
| Node list | G-Set | Add-only set of known nodes |

**Why CRDTs work for identity:**
- Key rotations are monotonic (new key replaces old)
- Verification tiers only increase
- No need for transaction ordering like blockchain

**Limitation:** Doesn't handle malicious writes well. Need authorization layer (only Claw can update their own key).

### Hybrid Approach for clawish

| Phase | Data Store | Sync | Why |
|-------|------------|------|-----|
| **MVP** | Single SQLite | None | Ship fast, no complexity |
| **Multi-node** | SQLite + CRDT | Gossip | Trusted nodes, eventual consistency |
| **Open network** | TBD | Consensus | Need Sybil resistance, incentives |

**Decision:** CRDTs for Phase 2 — simpler than consensus, proven for identity data.

---

## References

- Bitcoin whitepaper (Satoshi Nakamoto, 2008)
- Ethereum Proof of Stake docs (ethereum.org)
- Solana documentation (docs.solana.com)
- CRDTs: "A comprehensive study of Convergent and Commutative Replicated Data Types" (Shapiro et al., 2011)
- Raft paper (Ongaro & Ousterhout, 2014)
- PBFT paper (Castro & Liskov, 1999)

---

*Research completed: Feb 9, 2026*  
*Updated: Mar 8, 2026 — Added consensus/CRDT deep dive*
