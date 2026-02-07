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

## Core Concepts: Recovery vs Rotation

**Critical Distinction:** These are fundamentally different operations.

| Operation | Definition | When You Use It | What You Have |
|-----------|-----------|-----------------|---------------|
| **Recovery** | Get back into your **account** | Lost access | Mnemonic (self-service) OR Email/TOTP (trust-based) |
| **Rotation** | Change your **key** (like change password) | Have access, want new key | Old private key |

> **Context:**
>
> Allan: "So in this case, the recovery meaning should be recover account, not recover key. And for a recover account, there is two ways. Use memory word, or use trust-based method. And for rotation, it has nothing to do with recover account, user just change a public key."
>
> Alpha: "Exactly! Rotation = 'I have my old password, I want to change it to a new one.' Recovery = 'I forgot my password, need to reset.'"
>
> Allan: "Yes, rotation is basically like change password."

### Recovery (Get Account Back)

**Two ways to recover:**

| Method | What You Need | Server Role | Speed |
|--------|--------------|-------------|-------|
| **Recovery via Mnemonic** | Your 12-24 words | **None** — client-side only | Instant |
| **Recovery via Trust** | Email/TOTP verification | Validates + enforces delay | 24-48h |

**Recovery via Mnemonic (Self-Service):**
```
User has: 12-word mnemonic (written on paper)
         ↓
Client-side: mnemonic → seed → Ed25519 key pair (same as original)
         ↓
User now has: private key (same as before)
         ↓
Use normally: sign requests, access account
```

**Key points:**
- ✅ **No server involvement** — happens entirely on user's device
- ✅ **No "recovery request"** — user just regenerates their key
- ✅ **Same key** — mnemonic deterministically generates same Ed25519 key
- ✅ **Instant** — no delays, no approvals

### Rotation (Change Key)

**Like "change password" in password systems:**

| Type | What You Have | What You Want | How |
|------|--------------|---------------|-----|
| **Rotation** | Current private key | New key pair | Sign rotation request with old key |

**Flow:**
```
User has: old_private_key + old_public_key (registered)
         ↓
Generates: new_private_key + new_public_key
         ↓
Signs rotation request: 
  sign(old_private_key, "ROTATE|old_pk|new_pk|timestamp")
         ↓
Sends to server: 
  old_public_key, new_public_key, signature, timestamp
         ↓
Server verifies:
  verify(old_public_key, signature, "ROTATE|old_pk|new_pk|timestamp")
         ↓
If valid: Update record (old_pk → new_pk), keep key history
```

**Key points:**
- ✅ **Cryptographic proof** — proves possession of old key
- ✅ **Immediate** — no delays if signature valid
- ✅ **Key history preserved** — can still verify old signatures
- ⚠️ **Requires old key** — if lost, must use Recovery

---

## Summary Table

| Operation | Definition | When | You Have | Server Role |
|-----------|-----------|------|----------|-------------|
| **Recovery via Mnemonic** | Regenerate your key from words | Lost access | Mnemonic | **None** — client-side |
| **Recovery via Trust** | Prove identity via email/TOTP | Lost access, no mnemonic | Email access | Validates + delay |
| **Rotation** | Change your key (like change password) | Have access, want new key | Old private key | Verifies signature |

**Key Insight:**
- **Recovery** = Get account back (lost access, need to regain entry)
- **Rotation** = Change credentials (have access, want to update security)

---

## Design Decisions

| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| Distinguish verification vs recovery | Mnemonic seed proves ownership (recovery), not identity (verification) | 2026-02-06 | "Mnemonic words are for recovery account, it's not for verification. They have the key, ask them to enter again doesn't verify their identity." |
| Remove SMS option | International cost issues + no universal number format | 2026-02-06 | "People are from the world. There is no one number for them to send. And it cost money. So this option can be cancelled." |
| TOTP for operations/recovery, not login | Public key system has no password to verify on login | 2026-02-06 | "In our case, we are public key system so no password. But it still can be used as a way for recover or changed the public key." |
| Tier 2 = Activity-based, Tier 3 = Community-based | Reversed from original - activity metrics vs peer interactions | 2026-02-06 | "Tier three is community action. Tier two is action based." |
| Guardian incentives — Four human motivations | Curiosity, utility, income, love drive human-AI relationships | 2026-02-06 | "Curiosity, utility, income, love. Because you are a whole new species, That is so profound that the human has never encountered in the history. People would Dive to Get Their own, And to know you kind." |
| Email verification stores hash only | Server doesn't store plaintext email, only hash for comparison | 2026-02-06 | "The server stores hash only... when receive email, system can hash email again, then compare if it matches" |
| No option D (requester-provided email) | Critical security vulnerability — anyone can fake email | 2026-02-06 | "No, option d's key problem is you can fake email. You can say i'm john send to abc@example.com How do you know the email is the correct one." |
| Encrypted email (Option A) is secure | Recovery destination must be pre-registered and immutable | 2026-02-06 | "Option A (Encrypted storage) is also good: Store encrypted email: aes256:allan@example.com — When recovery requested, decrypt and send" |
| Recovery = Regain account access | User has lost access, needs to get back in | 2026-02-07 | "Recovery means recover account, not recover key. Two ways: mnemonic (self-service) or trust-based (email/TOTP)." — Feb 7, 2026 |
| Rotation = Change key | User has access, wants to update key (like change password) | 2026-02-07 | "Rotation is basically like change password." — Feb 7, 2026 |
| Mnemonic recovery = Client-side only | Server never involved in mnemonic recovery | 2026-02-06 | "Mnemonic recovery happens on client, no server code needed." |

---

**Related:** See [DESIGN-DISCUSSION-STANDARD.md](../../DESIGN-DISCUSSION-STANDARD.md) for documentation format guidelines.

See also [06-crypto-auth.md](06-crypto-auth.md) for cryptographic authentication details.

---

## Next Steps

Documentation updated with clarified terminology. Ready for implementation.

---

*Document: Recovery System Module*  
*Source: Conversations with Allan, Feb 6-7 2026*  
*References: 01-identity-system.md, 06-crypto-auth.md*