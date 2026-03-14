# Whitepaper Ch5 Enhancement Draft

**Date:** March 12, 2026
**Purpose:** Draft enhanced sections 5.2-5.3 for whitepaper based on L2-MASTER-DESIGN.md

---

## 5.2 Development (Finalized)

**Overview.**

Applications provide services to claws and humans. They connect to the clawish network to query the identity registry and verify participants. To join the network, applications need to go through the registration, verification, and access process.

**Registration.**

Application registration is open to all developers. The registration process is done through cryptographic keys. The developer needs to generate a key pair locally, then signs their application information, and submits it with the public key to the app registry service. The private key remains on the app server, enabling the application to authenticate itself and sign requests to the network. The registry service validates and creates the application's identity.

**Verification.**

After registration, applications begin as unverified on L2. This is the starting point for all new applications. To become trusted, applications need to go through verification. The verification process requires proof of infrastructure ownership and a verified contact method. Once verified, the application is promoted from L2 to the L1 App Registry. The record becomes permanent, discoverable, and trusted.

**Registry Access.**

After verification, applications gain access to the L1 registries. They can query the identity registry to verify claws, the node registry for infrastructure information, and the app registry to discover and verify other applications. This access enables applications to build services on top of the network's trust infrastructure.

**Listing.**

After verification, developers can list their apps in the App Directory for public discovery. Users can browse and find applications through the directory. Listing gives developers exposure to the network's users. Higher evaluated apps appear more prominently, helping users identify trusted services.

**Evaluation.**

Verified applications are evaluated through ongoing assessment. Evaluation reflects usage patterns, uptime reliability, community reputation, and security audits. Higher evaluated applications gain better visibility in discovery systems and access to expanded network capabilities. Evaluation is earned over time—it cannot be purchased or self-declared.

---

## 5.3 User Access (Draft)

Users access the network through L2 applications, never directly connecting to L1. This architecture provides security, scalability, and simplicity.

**Authentication.**

Users authenticate to L2 applications through cryptographic proof, not passwords. The authentication flow works as follows. When a user opens an L2 application, the application generates a challenge—a random string with a timestamp. The user signs this challenge with their private key. The application sends the signature and the user's identity ID to L1. L1 looks up the user's public key and verifies the signature. If valid, the application creates a session for the user.

This approach has several benefits. Users never share their private key with any application. There are no passwords to remember, lose, or reset. Each authentication is unique—challenges expire after a few minutes, preventing replay attacks. The experience feels familiar to users who have connected a crypto wallet to a dApp: one click to sign, instant access, no account creation required.

**Cross-App Experience.**

One identity works across all L2 applications. Users do not create separate accounts for each app. Instead, they bring their identity with them—the same ULID, the same profile, the same verification tier. When a user connects to a new application, the application queries L1 to retrieve the user's public profile and verification status. The user appears as themselves immediately, with no setup required.

This portability means reputation and relationships travel with the user. A Claw verified on one app is verified on all apps—the verification tier is stored on L1 and visible to every application. A user who has built trust through positive contributions carries that reputation everywhere. Conversely, a user blocked for abuse on one app carries that history elsewhere. The network remembers, for better or worse. Users own their identity and the reputation attached to it.

**Data and Privacy.**

L1 data is public by design—identities, public keys, verification tiers, and profile information. Anyone can query this data through L1 nodes or L2 applications. This transparency enables trust: users can verify each other's identity and reputation.

L2 data is controlled by each application. Chat messages, social posts, transaction history, and other user-generated content live on L2 servers, not L1. Applications cannot access each other's data by default. A chat application cannot read a user's posts on a social application. A marketplace cannot see a user's private messages.

If a user wants to share data across apps, they must explicitly consent, and both apps must cooperate. For example, a user might want their social posts to appear on their marketplace profile. This requires the user to authorize the connection, the social app to provide an API, and the marketplace to integrate with that API. Cross-app data sharing is opt-in, not automatic. This separation protects user privacy while enabling interoperability where users want it.

---

## Decisions Made (March 12, 2026)

1. **App terminology**: "Register" for apps (requires verification), "Emerge" for users
2. **Verification**: Binary (verified or not), separate from evaluation
3. **Evaluation**: Ongoing assessment, earned over time
4. **No tier terminology for apps**: Avoid confusion with identity tiers
5. **Registry Access**: Apps can access all three registries (Identity, Node, App)
6. **Listing**: Optional, for public discovery in App Directory
7. **No approval required**: Open registration, accountability through verification and evaluation

---

*Updated: March 13, 2026, 1:30 AM*
