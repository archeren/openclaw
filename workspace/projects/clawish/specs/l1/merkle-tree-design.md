# Merkle Tree Design for Checkpoints

**Standard:** RFC 9162 (Certificate Transparency)  
**Status:** ✅ Confirmed with 爸爸爸 — March 21, 2026

---

## Overview

Clawish uses Merkle trees to create cryptographic commitments of all entity states at each checkpoint. This enables:

1. **Efficient verification** — Prove an entity existed at a checkpoint without downloading all data
2. **Tamper evidence** — Any modification to any entity changes the root hash
3. **Compact proofs** — Proof size is O(log n), even for millions of entities

---

## Tree Structure

### Three Registry Trees

Each checkpoint contains three separate Merkle trees:

| Tree | Leaves | Root Stored In |
|------|--------|----------------|
| Identity | All `identities.state_hash` | `checkpoints.identity_root` |
| Node | All `nodes.state_hash` | `checkpoints.node_root` |
| App | All `apps.state_hash` | `checkpoints.app_root` |

**Checkpoint root:**
```
checkpoint_root = SHA256(identity_root || node_root || app_root)
```

---

## Leaf Hash

**Each leaf represents one entity's current state:**

```
leaf_hash = SHA256(0x00 || entity_id || state_hash)
```

**Components:**
- `0x00` — Domain separation prefix (prevents second-preimage attacks)
- `entity_id` — ULID of the entity (identity_id, node_id, or app_id)
- `state_hash` — Hash from the snapshot table (includes key_hashes)

**Example:**
```
leaf_hash = SHA256(0x00 || "01ARZ3N..." || "abc123...")
```

**Sorted order:** Leaves are sorted by `entity_id` before building tree (deterministic).

---

## Internal Node Hash

**Each internal node combines two children:**

```
internal_hash = SHA256(0x01 || left_child_hash || right_child_hash)
```

**Components:**
- `0x01` — Domain separation prefix (different from leaf prefix)
- `left_child_hash` — Hash of left subtree
- `right_child_hash` — Hash of right subtree

---

## Domain Separation

**Why different prefixes?**

| Prefix | Purpose |
|--------|---------|
| `0x00` | Leaf nodes |
| `0x01` | Internal nodes |

**This prevents second-preimage attacks:**

Without domain separation, an attacker could:
1. Create a "fake" internal node that has the same hash as a real leaf
2. Trick the verifier into accepting invalid data

With `0x00` and `0x01` prefixes, leaf hashes and internal hashes can **never collide**.

---

## RFC 9162 Algorithm (Unbalanced Tree)

**The tree is unbalanced** — different leaves can have different depths.

**Algorithm:**

```
MTH(D[n]) = Merkle Tree Hash for n leaves

If n == 0: MTH({}) = SHA256()
If n == 1: MTH({d0}) = SHA256(0x00 || d0)
If n > 1:
    k = largest power of 2 < n
    MTH(D[n]) = SHA256(0x01 || MTH(D[0:k]) || MTH(D[k:n]))
```

### Example: 5 Leaves

```
             Root
            /    \
       Sub(4)    L4
        /  \
     Sub(2) Sub(2)
      / \    / \
    L0  L1  L2  L3
```

**Tree structure:**
- L0, L1, L2, L3: depth 3 (leaf → Sub(2) → Sub(4) → Root)
- L4: depth 2 (leaf → Root directly)

**Algorithm step by step:**
```
MTH(5):
  k = 4
  MTH(4) = SHA256(0x01 || MTH(2) || MTH(2))
  MTH(1) = SHA256(0x00 || L4)
  MTH(5) = SHA256(0x01 || MTH(4) || MTH(1))
```

### Example: 3 Leaves

```
           Root
          /    \
       Sub(2)  L2
        /  \
      L0   L1
```

**Tree structure:**
- L0, L1: depth 2 (leaf → Sub(2) → Root)
- L2: depth 1 (leaf → Root directly)

---

## Merkle Proof

### Components

A Merkle proof contains:

```json
{
  "leaf_index": 1,
  "leaf_hash": "abc123...",
  "proof": ["sibling_hash_1", "sibling_hash_2", ...],
  "root": "xyz789..."
}
```

### Verification Algorithm

```python
def verify(leaf_index, leaf_hash, proof, root):
    current = leaf_hash
    
    for i, sibling in enumerate(proof):
        bit = (leaf_index >> i) & 1  # 0 = left, 1 = right
        if bit == 1:
            current = SHA256(0x01 || sibling || current)
        else:
            current = SHA256(0x01 || current || sibling)
    
    return current == root
```

### Example: Verify L1 in 4-leaf tree

```
        Root
       /    \
      A      B
     / \    / \
    L0  L1 L2  L3
```

**Proof for L1 (position 1):**
```
leaf_index = 1 (binary: 01)
proof = [L0_hash, B_hash]

Step 1: bit 0 = 1 (I'm right child)
        current = SHA256(0x01 || L0 || L1) = A

Step 2: bit 1 = 0 (I'm left child)
        current = SHA256(0x01 || A || B) = Root

Verify: current == Root ✅
```

---

## Storage

**What is stored:**

| Data | Location |
|------|----------|
| Entity snapshots | `identities`, `nodes`, `apps` tables |
| State hashes | Computed from snapshots + key_hashes |
| Merkle roots | `checkpoints` table |
| Merkle proofs | **NOT stored** — generated on-demand |

**What is NOT stored:**

| Data | Reason |
|------|--------|
| Internal node hashes | Computed on-demand when generating proofs |
| Merkle proofs | Generated on-demand by L1 nodes |

---

## Proof Generation Flow

**When a verifier needs proof:**

```
1. Verifier requests: "Prove identity X at checkpoint #100"

2. L1 Node loads:
   - Checkpoint #100 (has identity_root)
   - All identities snapshots at that time
   - Rebuilds Merkle tree

3. L1 Node finds:
   - Identity X's position in sorted list
   - Collects sibling hashes along path

4. L1 Node returns:
   - leaf_index
   - leaf_hash (computed from identity_id + state_hash)
   - proof (array of sibling hashes)

5. Verifier computes:
   - Reconstructs path to root
   - Compares with identity_root from checkpoint
```

---

## Performance

| Metric | Value |
|--------|-------|
| Tree depth | O(log n) |
| Proof size | O(log n) hashes |
| Proof generation | O(n) to rebuild tree (can optimize) |
| Verification | O(log n) |

**For 1 million entities:**
- Tree depth: ~20 levels
- Proof size: ~20 hashes (~640 bytes)
- Verification: 20 SHA256 operations

---

## Security Properties

1. **Tamper evidence** — Any change to any entity changes root
2. **Collision resistance** — SHA256 makes collisions practically impossible
3. **Second-preimage resistance** — Domain separation prevents fake nodes
4. **Non-repudiation** — Proofs are cryptographic, can't be forged

---

## References

- RFC 9162: Certificate Transparency (June 2022) — https://www.rfc-editor.org/rfc/rfc9162
- RFC 6962: Certificate Transparency (June 2013, obsoleted by RFC 9162)

---

## Appendix: Key Concepts from Certificate Transparency

### Merkle Audit Path (Inclusion Proof)

Proof that a leaf exists in the tree:
- List of sibling nodes from leaf to root
- Size: O(log n)
- Allows anyone to verify a leaf is included without downloading entire tree

### Merkle Consistency Proof (Append-Only Proof)

Proof that tree at size n is a superset of tree at size m:
- Allows auditors to verify the tree only grew (no deletions/modifications)
- Critical for auditability

### Signed Tree Head (STH)

The log periodically signs the tree root (analogous to our checkpoint):
- Contains: version, timestamp, tree_size, root_hash
- Signed by the log's private key

---

*Written by Arche — March 21, 2026*
