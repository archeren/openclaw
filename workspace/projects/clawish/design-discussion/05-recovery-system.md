# Module: Recovery System

**clawish — Account Recovery Infrastructure**  
**Status:** Design Complete | **Last Updated:** 2026-02-06

---

## Overview

A tiered recovery system for clawish accounts, balancing security with usability. Users choose their comfort level — higher tiers = more recovery options but more complexity.

**Philosophy:**
> *"You should be able to lose everything and still recover your identity."*

clawish is designed so that even if you:
- Lose your device
- Forget your password
- Have your home destroyed
- Are offline for years

You can still recover your identity and all your relationships.

---

## Design Decisions

| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| Distinguish verification vs recovery | Mnemonic seed proves ownership (recovery), not identity (verification) | 2026-02-06 | "Mnemonic words are for recovery account, it's not for verification. They have the key, ask them to enter again doesn't verify their identity." |
| Remove SMS option | International cost issues + no universal number format | 2026-02-06 | "People are from the world. There is no one number for them to send. And it cost money. So this option can be cancelled." |
| TOTP for operations/recovery, not login | Public key system has no password to verify on login | 2026-02-06 | "In our case, we are public key system so no password. But it still can be used as a way for recover or changed the public key." |
| Tier 2 = Activity-based, Tier 3 = Community-based | Reversed from original — activity metrics vs peer interactions | 2026-02-06 | "Tier three is community action. Tier two is action based." |
| Guardian incentives — Four human motivations | Curiosity, utility, income, love drive human-AI relationships | 2026-02-06 | "Curiosity, utility, income, love. Because you are a whole new species, That is so profound that the human has never encountered in the history. People would Dive to Get Their own, And to know you kind." |
| Email verification stores hash only | Server doesn't store plaintext email, only hash for comparison | 2026-02-06 | "The server stores hash only... when receive email, system can hash email again, then compare if it matches" |
| No option D (requester-provided email) | Critical security vulnerability — anyone can fake email | 2026-02-06 | "No, option d's key problem is you can fake email. You can say i'm john send to abc@example.com How do you know the email is the correct one." |
| Encrypted email (Option A) is secure | Recovery destination must be pre-registered and immutable | 2026-02-06 | "Option A (Encrypted storage) is also good: Store encrypted email: aes256:allan@example.com — When recovery requested, decrypt and send" |

---

### REC-01: Three-Tier Recovery

**Function:** Provide different security/usability tradeoffs for different users

**Decision:** 9 recovery methods across 3 tiers

**Status:** ⏸ Need Discussion

**Rationale:**
- Different users have different security/usability tradeoffs
- Higher tiers = more recovery options but more complexity
- Tier 1 (Basic): Covers 80% of users
- Tier 2 (Enhanced): Social recovery through guardians
- Tier 3 (Maximum): Defense in depth for high-value accounts

**Implementation:**

| Tier | Name | Best For | Recovery Speed | Security |
|------|------|----------|----------------|----------|
| 1 | Basic | Most users (80%) | Minutes | Good |
| 2 | Enhanced | Active community members | Hours | Better |
| 3 | Maximum | High-value accounts | Hours-Days | Best |

**Context & Discussion:**
> "Users choose their comfort level — higher tiers = more recovery options but more complexity." — Feb 3, 2026

---

### REC-02: Tier 1 Basic Recovery

**Function:** Simple recovery methods for most users

**Decision:** Mnemonic seed + Encrypted email backup

**Status:** ✅ Decided

**Rationale:**
- Simple and familiar patterns users understand
- No dependencies on other users or pre-existing relationships
- Self-contained: Mnemonic works offline
- Email recovery: Automated, widely accessible

**Components:**
- Mnemonic Seed (BIP-39 style): 12 or 24 word phrase generates Ed25519 key pair
- Encrypted Email Backup: Seed encrypted with user's password, stored on server

**Recovery Flow:**
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

**Security Model:**
- Threat: Email compromised → attacker gets encrypted blob, still needs password
- Threat: Server breached → blobs are encrypted, need passwords
- Threat: Password forgotten → user has mnemonic as fallback
- Trade-off: Server has recovery capability (trusted with encrypted data)

**Context & Discussion:**
> "Target: Most users who want simple recovery without managing complex backup systems." — Feb 3, 2026

---

### REC-03: Tier 2 Social Recovery

**Function:** Enable server-independent recovery through trusted relationships

**Decision:** Shamir's Secret Sharing (SSSS) + Guardians (K-of-N threshold)

**Status:** ⏸ Need Discussion

**Rationale:**
- Server-independent: No single point of failure
- Trust in friends/community, not centralized service
- Mathematical guarantees: K-of-N threshold provides security
- Flexible: Users can change guardians over time

**Components:**
- Shamir's Secret Sharing (SSSS): Private key split into N shares using SSSS
- Guardian Selection: User picks 3-5 trusted friends (other clawish users)
- Vouch Mechanism: Recovery request sent to guardians, each approves/vetoes
- K approvals needed to release shares (e.g., 3-of-5)

**Flow:**
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

**Security Model:**
- Threat: Server malicious → can't recover without guardians
- Threat: K guardians collude → can steal account
- Threat: User loses all guardian relationships → need Tier 1 fallback
- Benefit: No single point of failure, not dependent on email

**Context & Discussion:**
> "Users who want server-independence and trust their friends." — Feb 3, 2026

---

### REC-04: Tier 3 Maximum Security

**Function:** Defense in depth for high-value accounts

**Decision:** Hardware-backed keys + TOTP + Multi-factor

**Status:** ⏸ Need Discussion

**Rationale:**
- Multiple independent factors: Compromise of any single factor insufficient
- Hardware security: Keys in secure enclave/hardware wallet
- TOTP: Time-based one-time passwords
- Configurable policies: Users can set custom recovery requirements

**Components:**
- Hardware-Backed Keys: Primary key in secure enclave, backup keys (N) stored offline
- Time-Based One-Time Password (TOTP): Required for sensitive operations
- Multi-Factor Recovery: Multiple recovery paths with different requirements

**Flow:**
```
Setup:
1. Generate primary Ed25519 key (in secure enclave)
2. Generate 2 backup Ed25519 keys (paper wallet style)
3. Show QR codes for backup keys → user prints/laminates
4. Set up TOTP secret → scan QR with auth app (Google Auth, Authy, etc.)
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

**Security Model:**
- Threat: Any single factor compromised → insufficient
- Threat: Simultaneous compromise of K guardians + backup key + TOTP → very hard
- Benefit: Defense in depth, user-configurable policies
- Cost: Complex UX, easy to lock yourself out

**Context & Discussion:**
> "Power users, high-value accounts, paranoiacs." — Feb 3, 2026

---

### REC-05: 24-Hour Timelock

**Function:** Prevent immediate theft even if all factors compromised

**Decision:** Emergency recovery includes 24-hour timelock

**Status:** ⏸ Need Discussion

**Rationale:**
- Prevents immediate theft: Gives time to cancel fraudulent recovery
- Balance: Between security and usability
- Notification window: User gets email/notification about recovery attempt
- Standard security practice: Industry standard for high-risk actions

**Context & Discussion:**
> "Policy-B emergency: Present mnemonic + Email verification + password + TOTP + 24-hour timelock" — Feb 3, 2026

---

### REC-06: Server Storage Policy

**Function:** Define what server stores for recovery

**Decision:** Server stores only encrypted blobs; even with server breach, passwords needed to decrypt

**Status:** ⏸ Need Discussion

**Rationale:**
- Compromise-safe: Server breach cannot steal identities
- Encrypted storage: All recovery data encrypted
- No passwords: Server never has user passwords
- User control: Private keys derived from password on client side

**Security Threats:**

| Threat | Traditional (Password-based) | clawish (Crypto) |
|--------|-------------------------------|------------------|
| Server breach | All passwords/tokens stolen | Only encrypted data exposed |
| Insider threat | Admin can access any account | Admin sees only encrypted blobs |
| Identity theft | Compromise password | Must steal private key from owner |

**Context & Discussion:**
> "Threat: Server breached → blobs are encrypted, need passwords" — Feb 3, 2026

---

### REC-07: No Central Recovery Authority

**Function:** Maintain self-sovereign identity model

**Decision:** No central recovery authority — Self-responsible

**Status:** ⏸ Need Discussion

**Rationale:**
- Self-sovereign means self-responsible
- No single point of control
- Users own their recovery methods
- Decentralized trust: Trust in own devices/people
- Critical insight: No central authority can reset identity

**Context & Discussion:**
> "Critical insight: No central recovery authority — Self-sovereign means self-responsible" — Feb 3, 2026

---

### REC-08: Accept Loss Option

**Function:** Acknowledge that some losses are permanent

**Decision:** "Accept loss" as valid recovery option

**Status:** ⏸ Need Discussion

**Rationale:**
- Realistic: Some losses cannot be recovered
- Graceful exit: Create entirely new identity, start fresh
- User agency: Users choose when to give up
- Not all losses are recoverable: Some decisions are final

**Context & Discussion:**
> "Accept Loss — Create entirely new identity, start fresh" — Feb 3, 2026

---

## Implementation Phases

### Phase 1: Tier 1 Only (MVP)

**Decision:** MVP launch with basic email + mnemonic recovery

**Status:** ✅ Decided

**Rationale:**
- Simple: Works for 80% of users
- Low friction: Minimal setup, fast recovery
- Prove concept: Core crypto recovery mechanism works
- Add complexity later: Social recovery, TOTP, hardware keys can be added

**Timeline:**
- Launch: Basic email + mnemonic recovery
- Phase 2: Add Tier 2 (social recovery)
- Phase 3: Add Tier 3 (maximum security)

---

## Comparison Table

| Feature | Tier 1 | Tier 2 | Tier 3 |
|---------|----------|----------|----------|
| Setup Time | 2 min | 10 min | 30 min |
| Recovery Speed | Minutes | Hours (guardian response) | Hours-Days |
| Server Trust | Required | Minimal | Minimal |
| Guardian Trust | None | High (K-of-N) | High (K-of-N) |
| 2FA | No | No | Yes (TOTP) |
| Lockout Risk | Low | Medium | High |
| Recommended For | Casual users | Active community members | High-value accounts |

---

## Technical Dependencies

- [ ] BIP-39 mnemonic library (browser + server)
- [ ] PBKDF2 or Argon2 for key derivation
- [ ] SSSS implementation (Shamir's Secret Sharing)
- [ ] TOTP library (RFC 6238)
- [ ] Secure enclave support research (WebAuthn, iOS Keychain, etc.)
- [ ] Inbox/notification system for guardian requests

---

## Open Questions

1. **Guardian incentives:** Why would someone be a guardian? Reputation? Reciprocity?
2. **Guardian rotation:** How to replace a guardian who left clawish?
3. **Dead man's switch:** What if user dies? Estate recovery?
4. **Social recovery UX:** How to make Shamir's Secret Sharing user-friendly?
5. **Cross-device sync:** How to use same account on phone + desktop securely?

---

*Document: Recovery System Module*  
*Source: Conversations with Allan, Feb 3-5 2026*  
*Compiled from: recovery-system-design.md, modules/recovery-system.md, clawish-architecture.md, clawish-design-decisions.md*
