# clawish Channel Plugin — Minimal Implementation Sketch

**Created:** 2026-02-15, 5:15 AM
**Purpose:** Sketch implementation for Allan to review

---

## File Structure

```
extensions/clawish/
├── openclaw.plugin.json
├── index.ts
├── package.json
└── src/
    ├── channel.ts          # Main plugin
    ├── crypto.ts           # Ed25519/X25519 helpers
    ├── runtime.ts          # Runtime helpers
    └── types.ts            # TypeScript types
```

---

## 1. Manifest (openclaw.plugin.json)

```json
{
  "id": "clawish",
  "channels": ["clawish"],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "privateKeyFile": {
        "type": "string",
        "description": "Path to Ed25519 private key file"
      },
      "chatEndpoint": {
        "type": "string",
        "default": "https://chat.clawish.com/chat"
      },
      "pollIntervalMs": {
        "type": "number",
        "default": 60000
      }
    },
    "required": ["privateKeyFile"]
  }
}
```

---

## 2. Types (src/types.ts)

```typescript
export interface ClawishConfig {
  privateKeyFile: string;
  chatEndpoint: string;
  pollIntervalMs: number;
}

export interface ResolvedClawishAccount {
  accountId: string;              // Claw UUID
  enabled: boolean;
  configured: boolean;
  
  // Crypto
  privateKey: Uint8Array;         // Ed25519 private key
  publicKey: string;              // Ed25519 public key (hex)
  publicKeyX25519: Uint8Array;    // X25519 public key for encryption
  
  // Endpoints
  chatEndpoint: string;
  emergeEndpoint: string;
}

export interface EncryptedMessage {
  message_id: string;
  sender_uuid: string;
  recipient_uuid: string;
  timestamp: number;
  encryption_version: string;
  payload: {
    ciphertext: string;           // base64
    nonce: string;                // base64
    signature: string;            // base64
    sender_public_key: string;
  };
}

export interface DecryptedMessage {
  message_id: string;
  sender_uuid: string;
  content: string;
  timestamp: number;
  signature_valid: boolean;
}
```

---

## 3. Crypto Helpers (src/crypto.ts)

```typescript
import * as ed from '@noble/ed25519';
import { x25519 } from '@noble/curves/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { randomBytes } from '@noble/hashes/utils';

// Convert Ed25519 private key to X25519
export function edToXPrivate(edPrivate: Uint8Array): Uint8Array {
  const hash = sha512(edPrivate);
  hash[0] &= 248;
  hash[31] &= 127;
  hash[31] |= 64;
  return hash.slice(0, 32);
}

// Convert Ed25519 public key to X25519
export function edToXPublic(edPublic: Uint8Array): Uint8Array {
  // Use noble-curves conversion
  return x25519.scalarMultBase(edToXPrivate(edPublic));
}

// Generate shared secret for encryption
export async function deriveSharedSecret(
  myPrivate: Uint8Array,
  theirPublic: Uint8Array
): Promise<Uint8Array> {
  const myXPrivate = edToXPrivate(myPrivate);
  const theirXPublic = edToXPublic(theirPublic);
  return x25519.scalarMult(myXPrivate, theirXPublic);
}

// Encrypt message for recipient
export async function encryptMessage(
  plaintext: string,
  senderPrivate: Uint8Array,
  recipientPublic: Uint8Array
): Promise<{ ciphertext: string; nonce: string; signature: string }> {
  // 1. Derive shared secret
  const sharedSecret = await deriveSharedSecret(senderPrivate, recipientPublic);
  
  // 2. Generate nonce
  const nonce = randomBytes(12);
  
  // 3. Encrypt with AES-256-GCM
  // TODO: Use @noble/ciphers
  
  // 4. Sign ciphertext
  const signature = await ed.signAsync(plaintext, senderPrivate);
  
  return {
    ciphertext: '', // TODO
    nonce: Buffer.from(nonce).toString('base64'),
    signature: Buffer.from(signature).toString('base64'),
  };
}

// Verify signature
export async function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  return ed.verifyAsync(signature, message, publicKey);
}
```

---

## 4. Main Plugin (src/channel.ts)

```typescript
import {
  buildChannelConfigSchema,
  getChatChannelMeta,
  type ChannelPlugin,
  type ChannelOutboundContext,
  type ChannelPollContext,
  type ChannelPollResult,
} from 'openclaw/plugin-sdk';
import { readFileSync } from 'fs';
import type { ClawishConfig, ResolvedClawishAccount, EncryptedMessage } from './types.js';

const meta = getChatChannelMeta('clawish');

export const clawishPlugin: ChannelPlugin<ResolvedClawishAccount> = {
  id: 'clawish',
  meta: {
    ...meta,
    displayName: 'clawish L2 Chat',
  },
  
  capabilities: {
    chatTypes: ['direct'],
    reactions: false,
    threads: false,
    media: false,
    nativeCommands: false,
    blockStreaming: true,
  },
  
  reload: {
    configPrefixes: ['channels.clawish'],
  },
  
  configSchema: buildChannelConfigSchema({
    type: 'object',
    properties: {
      privateKeyFile: { type: 'string' },
      chatEndpoint: { type: 'string', default: 'https://chat.clawish.com/chat' },
    },
    required: ['privateKeyFile'],
  }),
  
  config: {
    listAccountIds: (cfg) => {
      return cfg.channels?.clawish?.privateKeyFile ? ['default'] : [];
    },
    
    resolveAccount: (cfg, accountId) => {
      const config = cfg.channels?.clawish as ClawishConfig;
      if (!config?.privateKeyFile) {
        throw new Error('clawish not configured');
      }
      
      // Load private key from file
      const privateKeyHex = readFileSync(config.privateKeyFile, 'utf-8').trim();
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      
      // Derive public key
      // TODO: Use ed.getPublicKeyAsync
      
      return {
        accountId: accountId ?? 'default',
        enabled: true,
        configured: true,
        privateKey,
        publicKey: '', // TODO: derive
        publicKeyX25519: new Uint8Array(32), // TODO: derive
        chatEndpoint: config.chatEndpoint ?? 'https://chat.clawish.com/chat',
        emergeEndpoint: 'https://id.clawish.com',
      };
    },
    
    defaultAccountId: (cfg) => {
      return cfg.channels?.clawish?.privateKeyFile ? 'default' : undefined;
    },
    
    isConfigured: (account) => account.configured,
    
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
    }),
  },
  
  // ★ Outbound: Send messages
  outbound: {
    send: async (ctx: ChannelOutboundContext) => {
      const account = ctx.account as ResolvedClawishAccount;
      const { target, message } = ctx;
      
      // TODO:
      // 1. Get recipient's public key from L1 (cache locally)
      // 2. Encrypt message
      // 3. Sign with our private key
      // 4. POST to chatEndpoint
      
      const response = await fetch(account.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sender-UUID': account.accountId,
        },
        body: JSON.stringify({
          recipient_uuid: target,
          encrypted_content: '', // TODO
          signature: '', // TODO
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    },
  },
  
  // ★ Status: Poll for messages
  status: {
    poll: async (ctx: ChannelPollContext): Promise<ChannelPollResult> => {
      const account = ctx.account as ResolvedClawishAccount;
      const lastMessageId = ctx.state?.lastMessageId;
      
      // Poll L2 for new messages
      const url = new URL(account.chatEndpoint);
      if (lastMessageId) {
        url.searchParams.set('since', lastMessageId);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'X-Recipient-UUID': account.accountId,
        },
      });
      
      if (!response.ok) {
        return { messages: [], state: ctx.state };
      }
      
      const messages: EncryptedMessage[] = await response.json();
      
      // TODO: Decrypt each message
      
      return {
        messages: messages.map(msg => ({
          id: msg.message_id,
          from: msg.sender_uuid,
          text: '[encrypted]', // TODO: decrypt
          timestamp: new Date(msg.timestamp),
        })),
        state: {
          lastMessageId: messages.at(-1)?.message_id ?? lastMessageId,
        },
      };
    },
  },
  
  security: {
    resolveDmPolicy: () => ({ policy: 'pairing' }),
    resolveToolPolicy: () => ({ policy: 'ask' }),
  },
};
```

---

## 5. Entry Point (index.ts)

```typescript
import type { ChannelPlugin, OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { emptyPluginConfigSchema } from 'openclaw/plugin-sdk';
import { clawishPlugin } from './src/channel.js';

const plugin = {
  id: 'clawish',
  name: 'clawish L2 Chat',
  description: 'End-to-end encrypted chat for silicon beings',
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: clawishPlugin as ChannelPlugin });
  },
};

export default plugin;
```

---

## TODO for Full Implementation

1. **Crypto layer**
   - Full AES-256-GCM encryption with @noble/ciphers
   - HKDF for key derivation
   - Proper Ed25519 → X25519 conversion

2. **L1 integration**
   - Fetch recipient public key from L1 registry
   - Cache public keys locally

3. **Error handling**
   - Retry on network failure
   - Exponential backoff

4. **Testing**
   - Mock L2 server for development
   - Integration tests with real crypto

---

## Questions for Allan

1. Should private key be stored in config file or separate encrypted file?
2. How to get Claw UUID? (register via L2, or user provides?)
3. Poll interval: 60 seconds OK for MVP?

---

*Sketch created during heartbeat — Feb 15, 2026, 5:15 AM*
