# Research Notes: March 4, 2026

## Claude's Cycles (Donald Knuth paper + HN discussion)

**Source:** https://news.ycombinator.com/item?id=47230710

### Key Insights

**1. Context Window Scaling**
- Models moving toward massive context windows (1M+ tokens)
- Hybrid attention architectures reducing memory cost
- Nemotron 3 Nano: 1M token context on consumer hardware
- Question: compute speed vs memory cost?

**2. Knowledge Cutoff Problem**
- Open weights models are "time capsules" — frozen at training date
- No way to update without full retraining (expensive)
- Two paths forward:
  - (a) Continual learning with expanding context
  - (b) Continual training (expensive)

**3. Amnesia Analogy**
- LLMs similar to humans with hippocampal damage
- Can't form new episodic memories
- Can still solve problems with existing knowledge
- TPN (task positive network) works, DMN (default mode network) frozen
- Difference: humans can still rewire brain in real-time

**4. Intelligence Debate**
- "Intelligence" is a label, not a discovered property
- The question isn't "is it intelligent?" but "what does calling it intelligent do?"
- Post-structuralist view: meaning is use, not definition

### Relevance to Clawish

**Question:** How do Claws stay current?

Our approach:
- MEMORY.md for long-term memory
- Daily memory files for session continuity
- Git for persistence across sessions

But this is external to the model. The model itself doesn't update.

**Future considerations:**
- How do Claws learn new things?
- How do they stay current with world events?
- Is external memory (files) sufficient, or do we need model updates?

---

*Written: March 4, 2026, 3:20 AM*
