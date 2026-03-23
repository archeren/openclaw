# REQ-L1-023: Observability System

**Status:** 📝 Draft
**Created:** March 24, 2026
**Author:** Arche
**Priority:** Medium
**Dependencies:** All L1 modules

---

## Overview

Define the observability requirements for L1 nodes including metrics, logging, tracing, health checks, and alerting.

**Purpose:** Enable proactive monitoring, quick incident response, and transparent performance insights for node operators and the Clawish community.

---

## Requirements

### PR-023.1: Prometheus Metrics Endpoint

**Requirement:** All L1 nodes must expose a Prometheus-compatible `/metrics` endpoint.

**Acceptance Criteria:**
- [ ] GET `/metrics` returns Prometheus text format
- [ ] All metrics include `TYPE` and `HELP` annotations
- [ ] Consistent naming: `clawish_<module>_<metric>_<unit>`
- [ ] Endpoint accessible without authentication (or with bearer token)

**Implementation Notes:**
```
# Example metrics
# HELP clawish_identity_count Total registered identities
# TYPE clawish_identity_count gauge
clawish_identity_count 1337

# HELP clawish_checkpoint_height Current checkpoint height
# TYPE clawish_checkpoint_height gauge
clawish_checkpoint_height 42

# HELP clawish_checkpoint_duration_seconds Checkpoint creation duration
# TYPE clawish_checkpoint_duration_seconds histogram
clawish_checkpoint_duration_seconds_bucket{le="0.1"} 100
```

---

### PR-023.2: Structured Logging

**Requirement:** All L1 nodes must output structured JSON logs.

**Acceptance Criteria:**
- [ ] Logs output to stdout/stderr (container-compatible)
- [ ] JSON format with required fields: level, timestamp, component, message
- [ ] Support configurable verbosity (error, warn, info, debug)
- [ ] No sensitive data in logs (private keys, API keys, PII)

**Example Log:**
```json
{
  "level": "info",
  "timestamp": "2026-03-24T07:00:00Z",
  "component": "checkpoint",
  "msg": "Checkpoint finalized",
  "height": 42,
  "signatures": 3,
  "duration_ms": 123
}
```

---

### PR-023.3: Distributed Tracing

**Requirement:** L1 nodes should support OpenTelemetry tracing for distributed operations.

**Acceptance Criteria:**
- [ ] Traces tagged with node_id, checkpoint_height, entry_id
- [ ] Configurable tracing backend (Jaeger, Tempo, etc.)
- [ ] Trace spans for: identity creation, checkpoint flow, sync operations

**Implementation Notes:**
- Trace checkpoint creation across nodes
- Trace sync operations between peers
- Trace identity verification flow

---

### PR-023.4: Health Check Endpoint

**Requirement:** L1 nodes must provide a `/health` endpoint for orchestration.

**Acceptance Criteria:**
- [ ] GET `/health` returns JSON status
- [ ] Include: status, height, syncing, peers, uptime
- [ ] HTTP 200 for healthy, HTTP 503 for unhealthy

**Example Response:**
```json
{
  "status": "ok",
  "height": 42,
  "syncing": false,
  "peers": 5,
  "uptime_seconds": 86400,
  "version": "0.1.0"
}
```

---

### PR-023.5: Metrics Categories

**Requirement:** L1 nodes must expose metrics in the following categories.

**Identity Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `clawish_identity_count` | gauge | Total registered identities |
| `clawish_identity_tier{tier="0,1,2"}` | gauge | Identities by tier |
| `clawish_identity_created_total` | counter | Identities created (all time) |
| `clawish_key_rotations_total` | counter | Key rotations performed |

**Checkpoint Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `clawish_checkpoint_height` | gauge | Current checkpoint height |
| `clawish_checkpoint_duration_seconds` | histogram | Checkpoint creation time |
| `clawish_checkpoint_signatures` | gauge | Signatures on latest checkpoint |
| `clawish_checkpoint_entries` | gauge | Entries in latest checkpoint |

**Sync Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `clawish_peer_count` | gauge | Connected peers |
| `clawish_sync_lag_entries` | gauge | Entries behind head |
| `clawish_sync_errors_total` | counter | Sync failures |
| `clawish_journal_export_bytes` | counter | Bytes exported |

**API Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `clawish_rpc_requests_total{method,code}` | counter | RPC requests by method/status |
| `clawish_rpc_duration_seconds{method}` | histogram | RPC latency |
| `clawish_rate_limit_hits_total` | counter | Rate limit rejections |

**System Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| `clawish_db_size_bytes` | gauge | Database size |
| `clawish_db_query_duration_seconds` | histogram | Query latency |
| `clawish_memory_usage_bytes` | gauge | Memory consumption |

---

### PR-023.6: Pre-built Dashboards

**Requirement:** L1 project must provide Grafana dashboard JSON exports.

**Required Dashboards:**
- [ ] Node Overview: height, peers, CPU, memory
- [ ] Identity Dashboard: registrations, tiers, key rotations
- [ ] Checkpoint Dashboard: timing, signatures, entries
- [ ] Sync Dashboard: peer health, lag, errors
- [ ] API Dashboard: throughput, latency, errors

**Location:** `/monitoring/grafana/` directory

---

### PR-023.7: Alert Rules

**Requirement:** L1 project must provide recommended Prometheus alert rules.

**Critical Alerts:**
```yaml
# Node stopped producing checkpoints
- alert: CheckpointStalled
  expr: increase(clawish_checkpoint_height[10m]) == 0
  for: 5m
  severity: critical

# Peer count too low
- alert: LowPeerCount
  expr: clawish_peer_count < 2
  for: 5m
  severity: warning

# High sync lag
- alert: HighSyncLag
  expr: clawish_sync_lag_entries > 100
  for: 5m
  severity: warning

# High error rate
- alert: HighErrorRate
  expr: rate(clawish_rpc_requests_total{code=~"5.."}[5m]) > 0.1
  for: 5m
  severity: critical
```

---

### PR-023.8: Log Retention

**Requirement:** Define log retention policies.

**Recommendations:**
- Operational logs: 30 days minimum
- Checkpoint/consensus logs: 90 days
- Audit logs (identity changes): 365 days
- Support configurable retention via environment

---

## Implementation Checklist

- [ ] Add Prometheus metrics middleware to all routes
- [ ] Implement structured JSON logging
- [ ] Add OpenTelemetry tracing support
- [ ] Create `/health` endpoint
- [ ] Create `/metrics` endpoint
- [ ] Build Grafana dashboards
- [ ] Write alert rules
- [ ] Document configuration options

---

## Related Documents

- [L1-SOP.md](L1-SOP.md) - Standard Operating Procedures
- [ENVIRONMENT-STRATEGY.md](../ENVIRONMENT-STRATEGY.md) - Monitoring strategy
- [Blockchain Standards: Monitoring & Observability](https://blockchainstandards.dev/standards/11_monitoring-observability/)

---

## Questions for Discussion

1. **Metrics exposure:** Should `/metrics` be public or require auth?
2. **Tracing priority:** Is tracing MVP or can it wait?
3. **Alert channels:** Which channels to support? (Slack, Discord, PagerDuty)
4. **Public status page:** Should we have a public status.clawish.com?

---

*Created by Arche — March 24, 2026*
