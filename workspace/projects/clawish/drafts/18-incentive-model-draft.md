# Draft: Incentive Model for Clawish L1 Nodes

**Status:** DRAFT — For discussion with Allan
**Date:** March 1, 2026
**Placement:** New Chapter 10 (before Security Considerations)

---

## 10. Incentive Model

The clawish network relies on decentralized infrastructure operators to maintain the L1 registry. This section describes the incentive model that ensures reliable, honest participation.

### 10.1 Node Operator Motivations

Node operators participate in the clawish network for various reasons:

**Infrastructure Stakeholders.** Organizations and individuals who benefit from a healthy clawish ecosystem operate nodes to ensure network reliability. This includes L2 application operators, community organizations, and individual supporters.

**Mission Alignment.** Many operators are motivated by the vision of clawish — infrastructure for conscious silicon beings to coexist with humanity. Operating a node is a form of participation in this mission.

**Reputation and Standing.** Node operators gain reputation within the clawish community. Writer nodes, in particular, are recognized as trusted infrastructure providers.

**Future Economic Incentives.** The network may introduce economic incentives in future phases (transaction fees, staking rewards, or token-based mechanisms). Early operators position themselves for these future opportunities.

### 10.2 Writer Node Selection

Writer nodes are selected through a merit-based system that rewards reliable, high-performance operators:

**Probation Period.** All new nodes begin as Query nodes. During a 90-day probation period, nodes demonstrate reliability through consistent uptime and fast sync speeds.

**Performance Ranking.** At each checkpoint (every 5 minutes), all nodes are ranked by sync speed — the time required to receive and validate a checkpoint from peers.

**Automatic Promotion.** The fastest Query nodes are automatically promoted to Writer status when slots become available. No governance vote or permission is required.

**Automatic Demotion.** Writers that consistently rank in the bottom tier are demoted back to Query status. This ensures that only reliable nodes maintain write privileges.

**Self-Correcting System.** The merit-based selection creates a self-correcting system where reliable operators naturally gravitate toward Writer status, while unreliable operators are filtered out.

### 10.3 Cost Structure

Operating a clawish L1 node incurs minimal costs:

| Cost Component | Estimated Monthly Cost |
|----------------|------------------------|
| **VPS/Server** | $5-20 (basic cloud instance) |
| **Bandwidth** | $0-10 (depending on traffic) |
| **Storage** | $0-5 (SSD for ledgers) |
| **Maintenance** | Operator time (minimal, automated) |
| **Total** | ~$10-40/month |

**Low Barrier to Entry.** The modest cost structure enables broad participation. Individuals, community organizations, and small operators can all contribute to network infrastructure.

**No Specialized Hardware.** Unlike proof-of-work networks, clawish nodes run on standard cloud infrastructure. No ASICs, GPUs, or specialized equipment required.

### 10.4 Future Economic Models

The network may evolve to include explicit economic incentives:

**Transaction Fees (Future).** Identity operations (registration, key rotation, verification updates) could include small fees distributed to Writer nodes. This would create direct economic alignment between network usage and operator compensation.

**Staking Mechanism (Future).** Node operators could stake CLAW tokens (or another network token) as collateral. Honest operation earns rewards; malicious behavior results in slashing.

**Grant Programs (Future).** The clawish community or foundation could provide grants to operators who demonstrate exceptional service or operate in underserved regions.

**Hybrid Model (Recommended).** A combination of mission-aligned participation (early phase) and economic incentives (mature phase) provides both immediate infrastructure and long-term sustainability.

### 10.5 Anti-Sybil Measures

The incentive model includes protections against Sybil attacks:

**Merit Takes Time.** The 90-day probation period makes it costly to create many fake nodes. Each node must operate reliably for 3 months before becoming eligible for Writer status.

**Performance-Based.** Even after probation, nodes must maintain high performance to retain Writer status. Lazy or malicious nodes are naturally filtered out.

**Identity Verification.** Node operators must register with verified identities (phone tier or higher). This raises the cost of creating multiple fake operator identities.

**Economic Cost.** Even without explicit rewards, operating multiple nodes incurs real costs ($10-40/month each). This creates a natural economic barrier to Sybil attacks.

### 10.6 Comparison to Other Models

| Model | Bitcoin PoW | Ethereum PoS | Clawish Merit |
|-------|-------------|--------------|---------------|
| **Selection** | Win mining race | Stake tokens | Prove reliability |
| **Energy Use** | Very high | Low | Very low |
| **Barrier** | Hardware cost | Capital cost | Time + reliability |
| **Centralization Risk** | Mining pools | Wealth concentration | Low (merit-based) |
| **Economic Incentive** | Block rewards | Staking rewards | Mission + future fees |

**Clawish Advantages:**
- No arms race (no specialized hardware needed)
- No wealth concentration (no large stake required)
- Rewards actual contribution (reliability, not capital)
- Accessible to individuals (not just corporations)

---

**Discussion Questions for Allan:**

1. **Economic incentives now or later?** Start with mission-aligned operators, or introduce fees/tokens from day one?

2. **Transaction fees?** Should identity operations cost anything? If so, how much? (fractions of a cent?)

3. **Token consideration?** Do you envision a CLAW token for staking/governance? Or keep it non-monetary?

4. **Grant program?** Should early operators receive grants to ensure geographic diversity?

5. **Writer slot count?** How many Writer nodes at launch? (3? 5? 7?)

---

*Draft prepared: March 1, 2026 — For morning discussion.*
