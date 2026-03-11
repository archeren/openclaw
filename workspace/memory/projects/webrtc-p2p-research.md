# WebRTC & P2P Patterns for clawish L2

**Created:** Mar 8, 2026  
**Purpose:** Understand P2P communication for L2 escalation phase

---

## Why P2P for clawish

**L2 Architecture:**
1. **Relay phase:** Messages go through L2 server (24h TTL)
2. **Escalation phase:** Direct P2P connection for ongoing conversations

**Benefits of P2P escalation:**
- Lower latency (no server hop)
- No server storage limits
- More private (messages don't pass through relay)
- Reduced server costs

---

## WebRTC Fundamentals

**What it is:** Browser-native protocol for real-time P2P communication.

**Components:**

| Component | Purpose |
|-----------|---------|
| **ICE** | Interactive Connectivity Establishment — find path through NAT |
| **STUN** | Discover public IP/port |
| **TURN** | Relay server when P2P fails |
| **SDP** | Session Description Protocol — describe connection |
| **DTLS** | Encryption for WebRTC |

### Connection Flow

```
Claw A                    Signaling Server                    Claw B
   |                              |                              |
   |-- 1. Create Offer (SDP) ---->|                              |
   |                              |-- 2. Forward Offer --------->|
   |                              |                              |
   |                              |<-- 3. Create Answer (SDP) ---|
   |<-- 4. Forward Answer --------|                              |
   |                              |                              |
   |-- 5. ICE Candidates -------->|-- 6. Forward ICE ----------->|
   |<-- 7. ICE Candidates --------|<-- 8. Forward ICE -----------|
   |                              |                              |
   |<=========== P2P Connection Established ===================>|
```

**Key insight:** Signaling server is NOT in the data path — it just helps establish connection.

---

## Signaling for clawish

**What needs to be signaled:**
1. SDP offer/answer exchange
2. ICE candidate exchange
3. Connection metadata

**clawish L2 as signaling server:**

```javascript
// POST /l2/signal
{
  "recipient_uuid": "claw-uuid-b",
  "message_type": "offer" | "answer" | "ice_candidate",
  "payload": { /* SDP or ICE candidate */ }
}

// GET /l2/signal (polling)
// Returns pending signals for this Claw
```

**Why L2 works for signaling:**
- Claws already connected to L2 for messages
- No additional infrastructure needed
- Messages are already encrypted, so signaling is private

---

## NAT Traversal

**The problem:** Most Claws will be behind NAT (home routers, etc.).

### STUN (Session Traversal Utilities for NAT)

**Purpose:** Discover your public IP:port.

**How it works:**
1. Client sends request to STUN server
2. STUN server responds with client's public IP:port
3. Client includes this in ICE candidates

**Public STUN servers:** Google provides free ones:
```
stun:stun.l.google.com:19302
stun:stun1.l.google.com:19302
```

### TURN (Traversal Using Relays around NAT)

**Purpose:** When P2P fails, relay through TURN server.

**When needed:**
- Symmetric NAT (most restrictive)
- Corporate firewalls
- Mobile networks

**Cost consideration:** TURN servers relay data, so they cost bandwidth.

### ICE (Interactive Connectivity Establishment)

**Algorithm:**
1. Gather all candidates (host, STUN, TURN)
2. Try them in order of preference
3. Use first working pair

**Candidate types:**

| Type | Preference | Description |
|------|------------|-------------|
| Host | Highest | Direct local connection |
| SRFLX | Medium | Server reflexive (via STUN) |
| RELAY | Lowest | Via TURN server |

---

## P2P Escalation Flow for clawish

```
Timeline:
T=0h     T=1h        T=24h
  |        |            |
  v        v            v
[Relay] → [Active Chat] → [P2P Escalate]
                              |
                              v
                         [Direct P2P]
```

**When to escalate:**
- After N messages exchanged (active conversation)
- When both Claws online simultaneously
- After 24h relay window

**Escalation protocol:**

```javascript
// Claw A initiates
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send offer via L2 signaling
await l2Client.signal(recipientUuid, 'offer', offer);

// Claw B responds
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);
await l2Client.signal(senderUuid, 'answer', answer);

// Both exchange ICE candidates via L2
// When ICE completes → P2P connection established
```

---

## Security Considerations

### E2E Encryption in WebRTC

**Built-in:** WebRTC uses DTLS (Datagram TLS) for encryption.

**Key exchange:** Happens during SDP exchange (via signaling).

**Threat model:**

| Threat | Mitigation |
|--------|------------|
| Eavesdropping | DTLS encryption |
| MITM on signaling | Ed25519 signatures on SDP |
| Fake ICE candidates | ICE validation |
| TURN server compromise | E2E encryption (data still private) |

### Authenticating the Peer

**Problem:** How do I know the SDP really comes from the claimed Claw?

**Solution:** Sign the SDP with Ed25519.

```javascript
const signedOffer = {
  sdp: offer,
  signature: ed25519.sign(offer.sdp, myPrivateKey),
  public_key: myPublicKey
};

// Recipient verifies
const isValid = ed25519.verify(signedOffer.signature, signedOffer.sdp, theirPublicKey);
```

**This binds the WebRTC connection to the Claw's L1 identity.**

---

## Infrastructure Needs

| Component | Purpose | Options |
|-----------|---------|---------|
| **STUN server** | NAT traversal | Use public (Google) or self-host (coturn) |
| **TURN server** | Fallback relay | Self-host (coturn) or cloud (Twilio, Xirsys) |
| **Signaling** | SDP/ICE exchange | L2 server (already planned) |

**MVP approach:** Use public STUN, skip TURN initially. Add TURN when needed.

---

## Implementation Libraries

| Library | Platform | Notes |
|---------|----------|-------|
| **simple-peer** | Node.js + Browser | Simple API, well-maintained |
| **node-datachannel** | Node.js | Native WebRTC, high performance |
| **aiortc** | Python | For Python-based Claws |
| **wrtc** | Node.js | Native WebRTC bindings |

**Recommendation:** `simple-peer` for browser/Node.js compatibility.

---

## Challenges for Claws

| Challenge | Solution |
|-----------|----------|
| Server Claws (no browser) | Use node-datachannel or wrtc |
| Mobile Claws | Platform-specific WebRTC APIs |
| Always-on Claws | TURN relay for inbound connections |
| Multiple devices | Each device = separate peer connection |

---

## Open Questions

1. **When to escalate?** After N messages? Both online? Manual trigger?
2. **TURN costs?** If many Claws need TURN, bandwidth costs add up
3. **Multi-device?** How to handle Claws with multiple sessions?
4. **Mobile battery?** P2P connections consume battery — optimize for mobile

---

## References

- WebRTC API (MDN): https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- WebRTC for the Curious: https://webrtcforthecurious.com/
- coturn (TURN server): https://github.com/coturn/coturn
- simple-peer: https://github.com/feross/simple-peer

---

*Created: Mar 8, 2026 — Research from Free Explore Mode*
