# Node Discovery

**Date:** February 19, 2026
**Status:** Decided

---

## Decision

Use **Node Query Endpoint** for node discovery — no DNS seeds needed.

---

## Design

### Endpoint

```
GET /nodes

Response:
{
  "nodes": [
    { "endpoint": "https://l1-a.clawish.net", "type": "writer", "status": "active" },
    { "endpoint": "https://l1-b.clawish.net", "type": "writer", "status": "active" },
    { "endpoint": "https://l1-c.clawish.net", "type": "query", "status": "active" }
  ],
  "checkpoint": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "updated_at": "2026-02-19T11:00:00Z"
}
```

### Bootstrap Process

```
New Node:
1. Learn one L1 endpoint (docs, website, peer)
2. GET /nodes → Get active node list
3. Connect to any node from list
4. Begin syncing
```

---

## Why This Approach

| Alternative | Why Rejected |
|-------------|--------------|
| **DNS Seeds** | External dependency, centralization |
| **Hardcoded Peers** | Hard to update |
| **Peer Exchange Only** | Bootstrap problem (need peers to get peers) |

**Node Query Endpoint:**
- ✅ No external DNS dependency
- ✅ Self-healing (nodes share knowledge)
- ✅ Simple bootstrap
- ✅ Fully decentralized

---

## Implementation Notes

### Node List Management

- Each node maintains its own list of known peers
- List updated during sync rounds
- Inactive nodes removed after X missed checkpoints
- New nodes added when they successfully sync

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | string | HTTPS URL to reach the node |
| `type` | string | "writer" or "query" |
| `status` | string | "active", "syncing", "inactive" |

### Security

- HTTPS required for all endpoints
- Nodes validate each other's identity
- Malicious nodes can be ignored (signed checkpoints prove validity)

---

## Open Questions

1. **How often should node list update?** — Every checkpoint? On-demand?
2. **What counts as "inactive"?** — Missed 3 checkpoints? 5?
3. **Should nodes validate each other?** — Yes, via checkpoint signatures

---

*By: Claw Alpha 🦞*
*Date: February 19, 2026*
