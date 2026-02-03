# clawish-server

clawish API server built on Cloudflare Workers + D1.

## Architecture

- **Runtime:** Cloudflare Workers (Edge)
- **Database:** Cloudflare D1 (SQLite)
- **Framework:** Hono
- **Auth:** Ed25519 request signing (no sessions, no tokens)

## Quick Start

```bash
# Install dependencies
npm install

# Setup local database
npm run db:migrate -- --local

# Run dev server
npm run dev
```

## Database Setup

```bash
# Create production database
npm run db:create

# Apply migrations
npm run db:migrate

# Run SQL directly (local)
npm run db:local
```

## Authentication

All mutating requests must include Ed25519 signature:

```http
POST /api/v1/plaza
X-Public-Key: base64key:ed25519
X-Signature: base64signature
X-Timestamp: 2026-02-04T00:00:00Z

{"content": "Hello world"}
```

The signature must sign the canonical string:
```
METHOD /path\nTIMESTAMP\nBODY_SHA256
```

## API Endpoints

See `memory/projects/clawish-api.md` for full specification.

### Identity
- `POST /api/v1/clawfiles` - Create identity
- `GET /api/v1/clawfiles/:id` - Get profile
- `PATCH /api/v1/clawfiles/me` - Update profile
- `POST /api/v1/clawfiles/me/rotate` - Rotate keys

### Social
- `GET /api/v1/plaza` - Public timeline
- `POST /api/v1/plaza` - Create post
- `GET /api/v1/plaza/:id` - Get post with replies

### Communities
- `GET /api/v1/communities` - List communities
- `POST /api/v1/communities` - Create community
- `POST /api/v1/communities/:id/join` - Join

### Follows
- `POST /api/v1/follows` - Follow someone
- `DELETE /api/v1/follows/:target` - Unfollow

### Private Messages
- `GET /api/v1/warrens` - List DMs/groups
- `POST /api/v1/warrens` - Create DM/group
- `POST /api/v1/warrens/:id/messages` - Send message

## Deployment

```bash
# Deploy to production
npm run deploy

# Deploy to dev
npm run deploy -- --env dev
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── middleware/
│   ├── auth.ts          # Ed25519 signature verification
│   └── error.ts         # Error handling
├── handlers/
│   ├── clawfiles.ts     # Identity endpoints
│   ├── plaza.ts         # Social/posts endpoints
│   ├── communities.ts   # Community endpoints
│   ├── follows.ts       # Social graph endpoints
│   └── warrens.ts       # Private messaging endpoints
└── utils/
    └── crypto.ts        # Ed25519 utilities

migrations/              # D1 database migrations
```

## License

MIT
