# Merkle Tree Utility Specification

**Feature ID:** F-8.4  
**Status:** 📋 Draft  
**Priority:** Critical (Phase 1)  
**Standard:** RFC 9162 (Certificate Transparency)

---

## Overview

This document specifies the Merkle Tree cryptographic utility for Clawish L1. The utility implements the RFC 9162 algorithm for building Merkle trees, computing roots, and generating/verifying inclusion proofs.

---

## API Design

### Module: `src/utils/merkle.ts`

```typescript
/**
 * Merkle Tree implementation following RFC 9162
 * Used for checkpoints and journal integrity verification
 */

// Domain separation prefixes
const LEAF_PREFIX = 0x00;
const NODE_PREFIX = 0x01;

/**
 * Compute leaf hash for an entity
 * leaf_hash = SHA256(0x00 || entity_id || state_hash)
 */
export function leafHash(entityId: string, stateHash: string): string;

/**
 * Compute Merkle Tree Hash (RFC 9162 algorithm)
 * Handles both balanced and unbalanced trees
 */
export function merkleTreeHash(leaves: string[]): string;

/**
 * Generate inclusion proof for a leaf
 * Returns array of sibling hashes from leaf to root
 */
export function generateProof(
  leaves: string[],
  leafIndex: number
): MerkleProof;

/**
 * Verify inclusion proof
 * Returns true if proof is valid for the given root
 */
export function verifyProof(
  leafHash: string,
  leafIndex: number,
  proof: string[],
  root: string
): boolean;

/**
 * Merkle proof structure
 */
interface MerkleProof {
  leafIndex: number;
  leafHash: string;
  proof: string[];  // Sibling hashes
  root: string;
}
```

---

## Implementation Details

### Leaf Hash

```typescript
function leafHash(entityId: string, stateHash: string): string {
  const encoder = new TextEncoder();
  const data = new Uint8Array([
    LEAF_PREFIX,
    ...encoder.encode(entityId),
    ...encoder.encode(stateHash)
  ]);
  return sha256(data);
}
```

**Why domain separation?**
- `0x00` prefix prevents second-preimage attacks
- Different from internal node prefix (`0x01`)
- Ensures leaf hashes can never equal internal node hashes

### Merkle Tree Hash (RFC 9162)

```typescript
function merkleTreeHash(leaves: string[]): string {
  const n = leaves.length;
  
  // Empty tree
  if (n === 0) {
    return sha256(new Uint8Array([]));
  }
  
  // Single leaf
  if (n === 1) {
    return leaves[0];  // Already hashed
  }
  
  // Find largest power of 2 less than n
  const k = largestPowerOfTwoLessThan(n);
  
  // Recursively build tree
  const left = merkleTreeHash(leaves.slice(0, k));
  const right = merkleTreeHash(leaves.slice(k));
  
  return nodeHash(left, right);
}

function nodeHash(left: string, right: string): string {
  const data = new Uint8Array([
    NODE_PREFIX,
    ...hexToBytes(left),
    ...hexToBytes(right)
  ]);
  return sha256(data);
}

function largestPowerOfTwoLessThan(n: number): number {
  // Find k such that 2^k < n <= 2^(k+1)
  let k = 1;
  while (k * 2 < n) {
    k *= 2;
  }
  return k;
}
```

### Proof Generation

```typescript
function generateProof(leaves: string[], leafIndex: number): MerkleProof {
  const n = leaves.length;
  const proof: string[] = [];
  
  function prove(subLeaves: string[], index: number, start: number): string {
    if (subLeaves.length === 1) {
      return subLeaves[0];
    }
    
    const k = largestPowerOfTwoLessThan(subLeaves.length);
    
    if (index < k) {
      // Index is in left subtree
      const leftRoot = prove(subLeaves.slice(0, k), index, start);
      const rightRoot = merkleTreeHash(subLeaves.slice(k));
      proof.push(rightRoot);
      return nodeHash(leftRoot, rightRoot);
    } else {
      // Index is in right subtree
      const leftRoot = merkleTreeHash(subLeaves.slice(0, k));
      const rightRoot = prove(subLeaves.slice(k), index - k, start + k);
      proof.push(leftRoot);
      return nodeHash(leftRoot, rightRoot);
    }
  }
  
  const root = prove(leaves, leafIndex, 0);
  
  return {
    leafIndex,
    leafHash: leaves[leafIndex],
    proof,
    root
  };
}
```

### Proof Verification

```typescript
function verifyProof(
  leafHash: string,
  leafIndex: number,
  proof: string[],
  root: string
): boolean {
  let current = leafHash;
  
  for (let i = 0; i < proof.length; i++) {
    const bit = (leafIndex >> i) & 1;
    
    if (bit === 1) {
      // Current is right child
      current = nodeHash(proof[i], current);
    } else {
      // Current is left child
      current = nodeHash(current, proof[i]);
    }
  }
  
  return current === root;
}
```

---

## Usage Examples

### Building Checkpoint Trees

```typescript
// Get all identity state hashes
const identities = await db.query(`
  SELECT id, state_hash FROM identities ORDER BY id
`);

// Compute leaf hashes
const leaves = identities.map(i => leafHash(i.id, i.state_hash));

// Compute merkle root
const identityRoot = merkleTreeHash(leaves);
```

### Generating Inclusion Proof

```typescript
// User requests: "Prove identity X at checkpoint #100"
const checkpoint = await getCheckpoint(100);
const identities = await getIdentitiesAtCheckpoint(100);

// Find identity index
const index = identities.findIndex(i => i.id === targetId);
const leaves = identities.map(i => leafHash(i.id, i.state_hash));

// Generate proof
const proof = generateProof(leaves, index);

// Return proof to verifier
return {
  checkpoint_id: checkpoint.id,
  identity_root: checkpoint.identity_root,
  proof
};
```

### Verifying Proof

```typescript
// Verifier receives proof from L1 node
const valid = verifyProof(
  proof.leafHash,
  proof.leafIndex,
  proof.proof,
  checkpoint.identity_root
);

if (valid) {
  console.log("✅ Identity exists at checkpoint");
} else {
  console.log("❌ Invalid proof");
}
```

---

## Performance Characteristics

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Tree build | O(n) | O(n) |
| Root computation | O(n) | O(log n) stack |
| Proof generation | O(n) | O(log n) |
| Proof verification | O(log n) | O(1) |

**For 1 million entities:**
- Tree build: ~100ms
- Proof generation: ~100ms (requires tree rebuild)
- Proof verification: ~1ms (20 hash operations)

---

## Edge Cases

### Empty Tree

```typescript
merkleTreeHash([]) === sha256(new Uint8Array([]))
```

### Single Leaf

```typescript
merkleTreeHash([leaf]) === leaf
```

### Unbalanced Tree (5 leaves)

```
        Root
       /    \
      N1    L4
     /  \
    N2   N3
   / \   / \
  L0 L1 L2 L3
```

L4 has depth 2, L0-L3 have depth 3.

---

## Dependencies

- **SHA256:** Web Crypto API or Node.js crypto module
- **No external libraries** — Pure TypeScript implementation

---

## Testing Strategy

### Unit Tests

```typescript
describe('MerkleTree', () => {
  it('computes correct root for empty tree', () => {});
  it('computes correct root for single leaf', () => {});
  it('computes correct root for power-of-2 leaves', () => {});
  it('computes correct root for non-power-of-2 leaves', () => {});
  it('generates valid proof for each leaf', () => {});
  it('verifies valid proof', () => {});
  it('rejects invalid proof', () => {});
  it('matches RFC 9162 test vectors', () => {});
});
```

### Test Vectors

```typescript
// From RFC 9162 examples
const testVectors = [
  {
    leaves: ['a', 'b', 'c', 'd'],
    expectedRoot: '...'
  },
  {
    leaves: ['a', 'b', 'c'],
    expectedRoot: '...'
  }
];
```

---

## Integration Points

| Component | Usage |
|-----------|-------|
| Checkpoint Module | Build identity/node/app trees |
| Journal Module | Compute journal merkle root |
| Sync Module | Verify remote data integrity |
| API | Proof endpoints |

---

## Security Considerations

1. **Second-preimage resistance:** Domain separation (`0x00` vs `0x01`) prevents attacks
2. **Collision resistance:** SHA256 makes collisions practically impossible
3. **Deterministic:** Same leaves always produce same root
4. **No secret keys:** All operations are public and verifiable

---

## References

- RFC 9162: Certificate Transparency — https://www.rfc-editor.org/rfc/rfc9162
- Merkle Tree Wikipedia — https://en.wikipedia.org/wiki/Merkle_tree
- Certificate Transparency Log — https://certificate.transparency.dev/

---

*Created by Arche — March 24, 2026*
