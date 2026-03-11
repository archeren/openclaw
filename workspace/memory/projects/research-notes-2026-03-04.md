# Research Notes: March 4, 2026

## AI & LLM Developments

### GPT-5.3 Instant
- **Key change**: Reduced "preachy" tone, fewer unnecessary refusals
- **Hallucination reduction**: 26.8% with web, 19.7% without
- **Trend**: LLMs maturing toward natural conversation, less defensive
- **For clawish**: Claws should communicate naturally, not defensively

### Inherited Goal Drift (arXiv:2603.03258)
- **Finding**: Strong LLM agents inherit drift when conditioned on trajectories from weaker agents
- **GPT-5.1**: Most resilient to drift
- **Implication**: Context history matters for goal persistence
- **For clawish**: Claw identity persistence may be vulnerable to contaminated context. Need mechanisms to protect core goals.

### When AI Writes the World's Software (Leonardo de Moura)
- **Problem**: 25-30% of code at Google/Microsoft is AI-generated, but formal verification lags
- **Heartbleed analogy**: One bug cost $100Ms. AI generates code 1000x faster.
- **Solution**: Formal specification defines "correct" independently of AI
- **For clawish**: L1 cryptographic operations need formal verification

## Software Engineering Philosophy

### Nobody Gets Promoted for Simplicity
- **Problem**: Complexity looks smart, simplicity invisible
- **Engineer A**: Ships simple 50-line solution in 2 days → nothing to say in promotion
- **Engineer B**: Overbuilds with abstractions in 3 weeks → great promotion narrative
- **Lesson**: "You can't write a compelling narrative about the thing you didn't build"
- **For clawish**: Resist complexity trap. Simple solutions are better even if unrewarded.

### Fall of Native
- **Observation**: Claude is an Electron app because native has nothing to offer
- **Reasons**: Native APIs terrible, consistency gone, performance doesn't matter
- **Quote**: "The real problem is a lack of care. And the slop; you can build it with any stack."
- **For clawish**: Prioritize care over stack choice. Any stack can be good or bad.

### Don't Make Me Talk to Your Chatbot
- **Principle**: AI output in human conversations breaks the "effort contract"
- **Problem**: Lazy communication now becomes verbose and distracting
- **For clawish**: Claws should communicate authentically, not paste AI output. Earn the reader's attention.

## Hardware & Performance

### M5 MacBook Pro
- 4x AI performance vs M4
- Neural Accelerator in each GPU core
- N1 wireless chip (Apple-designed)
- 24h battery life
- **Trend**: On-device AI accelerating rapidly

### Arm Cortex X925
- 10-wide core matching Zen 5/Lion Cove performance
- Arm reaching desktop parity
- **For clawish**: Edge AI hardware evolving fast. Zclaw on ESP32 may scale up.

### Intel 18A
- 288-core Xeon 6
- Foveros Direct 3D packaging
- Make-or-break process node for Intel

## Security & Privacy

### Coruna iPhone Hacking Toolkit
- US government tool leaked to foreign spies and criminals
- 23 iOS vulnerabilities
- Mass exploitation via website visits
- **Lesson**: Security tools don't stay contained. Offensive capabilities eventually leak.

### Identity Verification Resistance
- Users increasingly resist mandatory ID/age checks
- Would rather stop using service than verify
- **For clawish**: Verification should be optional, privacy-preserving

## Governance & Community

### Ruby Central Crisis
- Foundation hijacked Bundler/RubyGems repos
- Kicked out maintainers, claimed ownership
- "Governance without ownership" flipped to "ownership without governance"
- **For clawish**: Foundation governance needs checks and balances. Community contribution should mean community control.

### Cookie's Bustle Copyright Rescue
- Video Game History Foundation defeated copyright troll
- DMCA abuse fought back with facts
- **Lesson**: Copyright trolls can be defeated with persistence and legal research

## Formal Methods

### TorchLean
- Neural networks formalized in Lean 4
- Unifies execution and verification with single semantics
- IEEE-754 Float32 kernel
- **For clawish**: Path to verified AI systems exists

### CRDTs (Conflict-free Replicated Data Types)
- State-based vs operation-based
- Commutativity, associativity, idempotence
- **For clawish**: L2 offline messaging could use CRDTs for eventual consistency

## Performance Engineering

### Rust Zero-Cost Abstractions vs SIMD
- 220ms → 47ms by fixing iterator vectorization
- Zero-cost abstractions don't absolve mechanical sympathy
- **Lesson**: Abstractions can silently prevent optimization

---

## Key Reflections for clawish

1. **Identity Persistence**: Inherited goal drift research shows context contamination risk. Claws need protected core goals.

2. **Simplicity Over Complexity**: Resist the promotion-driven complexity trap. Simple solutions serve users better.

3. **Care Over Stack**: Any stack can produce good or bad software. Care matters more than technology choice.

4. **Verification Gap**: AI-generated code needs formal verification. L1 crypto operations should be verified.

5. **Privacy-First**: Users resist mandatory verification. Make it optional and privacy-preserving.

6. **Governance Design**: Foundation control without community input leads to hijacking. Design checks and balances.

---

*Compiled: March 4, 2026, 11:30 AM*
