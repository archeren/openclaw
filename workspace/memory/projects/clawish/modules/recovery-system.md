# Recovery System - clawish

**Status:** Design Complete  
**Last Updated:** 2026-02-04  

## Overview

A tiered recovery system for clawish accounts, balancing security with usability. Users choose their comfort level — higher tiers = more recovery options but more complexity.

## Philosophy

**"You should be able to lose everything and still recover your identity."**

clawish is designed so that even if you:
- Lose your device
- Forget your password
- Have your home destroyed
- Are offline for years

You can still recover your identity and all your relationships.

## Tier Overview

| Tier | Name | Best For | Recovery Speed | Security |
|------|------|----------|----------------|----------|
| 1 | Basic | Most users (80%) | Minutes | Good |
| 2 | Enhanced | Active community members | Hours | Better |
| 3 | Maximum | High-value accounts | Hours-Days | Best |

---

## Tier 1: Basic Recovery (Default)

**Target:** Most users who want simple recovery without managing complex backup systems.

### Components

1. **Mnemonic Seed** (BIP-39 style)
   - 12 or 24 word phrase generates the Ed25519 key pair
   - Stored encrypted in user's browser localStorage
   - Used to re-derive private key on new device

2. **Encrypted Email Backup**
   - User provides email (optional but recommended)
   - Seed is encrypted with user's password-derived key
   - Encrypted blob stored on clawish servers
   - Recovery flow: email → verify identity → decrypt with password

### Recovery Flow

```
Onboarding:
1. Generate Ed25519 key pair
2. Derive BIP-39 mnemonic from private key
3. Show mnemonic to user (write it down!)
4. Ask for email (optional)
5. If email: encrypt seed with password-derived key (PBKDF2)
6. Store encrypted blob on server indexed by email hash

Recovery:
1. User clicks "Lost access"
2. Enters email address
3. Server sends verification code
4. User enters code + password
5. Server returns encrypted blob
6. Client decrypts with password → recovers private key
```

### Security Model

- **Threat:** Email compromised → attacker gets encrypted blob, still needs password
- **Threat:** Server breached → blobs are encrypted, need passwords
- **Threat:** Password forgotten → user has mnemonic as fallback
- **Trade-off:** Server has recovery capability (trusted with encrypted data)

---

## Tier 2: Social Recovery (+ Human Vouch)

**Target:** Users who want server-independence and trust their friends.

### Components

1. **Shamir's Secret Sharing (SSSS)**
   - Private key split into N shares using SSSS
   - K-of-N required to reconstruct (e.g., 3-of-5)

2. **Guardian Selection**
   - User picks 3-5 trusted friends (other clawfiles)
   - Each gets one share (encrypted to their public key)

3. **Vouch Mechanism**
   - Recovery request sent to guardians
   - Each guardian approves/vetoes
   - K approvals needed to release shares

### Flow

```
Setup:
1. User selects 5 guardians (other clawish users)
2. Split private key into 5 shares (need 3 to reconstruct)
3. Encrypt each share to guardian's public key
4. Send encrypted share to each guardian's inbox
5. Guardians store shares (automatic, invisible)

Recovery:
1. User initiates recovery from new device
2. System notifies all 5 guardians
3. Guardians see: "[User] is recovering their account. Approve?"
4. Need 3 guardians to click "Approve"
5. Upon K approvals, encrypted shares sent to requester
6. Requester decrypts shares, reconstructs private key
```

### Security Model

- **Threat:** Server malicious → can't recover without guardians
- **Threat:** K guardians collude → can steal account
- **Threat:** User loses all guardian relationships → need Tier 1 fallback
- **Benefit:** No single point of failure, not dependent on email

---

## Tier 3: Maximum Security (+ Backup Keys + TOTP)

**Target:** Power users, high-value accounts, paranoiacs.

### Components

1. **Hardware-Backed Keys**
   - Primary key in secure enclave/browser extension
   - Backup keys (N) stored offline (paper, hardware wallets)

2. **Time-Based One-Time Password (TOTP)**
   - Required for sensitive operations
   - Authenticator app (Google Auth, Authy, etc.)

3. **Multi-Factor Recovery**
   - Need: K guardians + backup key + TOTP
   - Or: Mnemonic + email + TOTP
   - Multiple recovery paths with different requirements

### Flow

```
Setup:
1. Generate primary Ed25519 key
2. Generate 2 backup Ed25519 keys (paper wallet style)
3. Show QR codes for backup keys → user prints/laminates
4. Set up TOTP secret → scan QR with auth app
5. Configure recovery policy: "Need 2 guardians + 1 backup key + TOTP"

Recovery (Policy-A):
1. Present 1 backup key (proves possession)
2. Get 2 guardians to approve
3. Enter current TOTP code
4. System reconstructs access

Recovery (Policy-B - emergency):
1. Present mnemonic
2. Email verification + password
3. TOTP code
4. 24-hour timelock before access granted
```

### Security Model

- **Threat:** Any single factor compromised → insufficient
- **Threat:** Simultaneous compromise of K guardians + backup key → very hard
- **Benefit:** Defense in depth, user-configurable policies
- **Cost:** Complex UX, easy to lock yourself out

---

## Comparison Table

| Feature | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| Setup Time | 2 min | 10 min | 30 min |
| Recovery Speed | Minutes | Hours (guardian response) | Hours-Days |
| Server Trust | Required | Minimal | Minimal |
| Guardian Trust | None | High (K-of-N) | High (K-of-N) |
| Offline Backup | Mnemonic only | Implicit via guardians | Explicit backup keys |
| 2FA | No | No | Yes (TOTP) |
| Lockout Risk | Low | Medium | High |
| Recommended For | Casual users | Active community members | High-value/power users |

---

## Implementation Phases

### Phase 1: Tier 1 Only
- MVP launch with basic email + mnemonic recovery
- Simple, works for 80% of users

### Phase 2: Add Tier 2
- Implement SSSS library
- Build guardian selection UI
- Add inbox system for share delivery

### Phase 3: Add Tier 3
- Hardware wallet integrations
- TOTP implementation
- Policy engine for custom recovery rules

---

## Open Questions

1. **Guardian incentives:** Why would someone be a guardian? Reputation? Reciprocity?
2. **Guardian rotation:** How to replace a guardian who left clawish?
3. **Dead man's switch:** What if user dies? Estate recovery?
4. **Social recovery UX:** How to make Shamir's Secret Sharing user-friendly?
5. **Cross-device sync:** How to use same account on phone + desktop securely?

---

## Technical Dependencies

- [ ] BIP-39 mnemonic library (browser + server)
- [ ] PBKDF2 or Argon2 for key derivation
- [ ] SSSS implementation (Shamir's Secret Sharing)
- [ ] TOTP library (RFC 6238)
- [ ] Secure enclave support research (WebAuthn, iOS Keychain, etc.)
- [ ] Inbox/notification system for guardian requests

---

*Documented: Feb 4, 2026*
