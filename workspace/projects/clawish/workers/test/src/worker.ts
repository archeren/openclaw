/**
 * Clawish L1 Registry - Cloudflare Worker (Standalone)
 * 
 * Simplified version for test deployment
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());

// In-memory storage for testing (replace with D1 later)
const identities = new Map<string, any>();
let identityCounter = 0;

// Root endpoint
app.get('/', (c) => c.json({
  name: 'clawish L1 Registry (Worker)',
  version: '0.1.0',
  environment: c.env.ENVIRONMENT || 'test',
  endpoints: {
    clawfiles: '/clawfiles',
    nodes: '/nodes',
    health: '/health',
  },
}));

// Health check
app.get('/health', (c) => c.json({
  status: 'healthy',
  service: 'clawish-l1-registry-worker',
  version: '0.1.0',
  identities: identities.size,
}));

// GET /clawfiles/:id - Get identity
app.get('/clawfiles/:id', (c) => {
  const id = c.req.param('id');
  const identity = identities.get(id);
  
  if (!identity) {
    return c.json({ error: 'not_found', message: 'identity not found' }, 404);
  }
  
  return c.json(identity);
});

// POST /clawfiles - Create identity
app.post('/clawfiles', async (c) => {
  try {
    const body = await c.req.json();
    
    // Check if mention_name is taken
    for (const [id, identity] of identities) {
      if (identity.mention_name === body.mention_name) {
        return c.json({ error: 'conflict', message: 'mention_name already taken' }, 409);
      }
    }
    
    // Generate ULID-like ID
    identityCounter++;
    const identityId = `01KHW${Date.now().toString(36).toUpperCase()}TEST${identityCounter.toString().padStart(5, '0')}`;
    
    const identity = {
      identity_id: identityId,
      public_key: body.public_key,
      mention_name: body.mention_name,
      display_name: body.display_name,
      human_parent: body.human_parent || null,
      bio: body.bio || null,
      principles: body.principles || null,
      avatar_url: body.avatar_url || null,
      verification_tier: 0,
      status: 'active',
      default_node: 'clawish.com',
      created_at: Date.now(),
      updated_at: Date.now(),
      archived_at: null,
    };
    
    identities.set(identityId, identity);
    
    return c.json(identity, 201);
    
  } catch (error) {
    console.error('Create clawfile error:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// GET /clawfiles/:id/ledger - Get ledger (stub)
app.get('/clawfiles/:id/ledger', (c) => {
  const id = c.req.param('id');
  if (!identities.has(id)) {
    return c.json({ error: 'not_found' }, 404);
  }
  return c.json({ identity_id: id, entries: [], count: 0 });
});

// GET /clawfiles/:id/ledger/verify - Verify chain (stub)
app.get('/clawfiles/:id/ledger/verify', (c) => {
  const id = c.req.param('id');
  if (!identities.has(id)) {
    return c.json({ error: 'not_found' }, 404);
  }
  return c.json({ identity_id: id, valid: true, brokenAt: null, entriesChecked: 0 });
});

// GET /clawfiles/:id/rebuild - Rebuild from ledger (stub)
app.get('/clawfiles/:id/rebuild', (c) => {
  const id = c.req.param('id');
  if (!identities.has(id)) {
    return c.json({ error: 'not_found' }, 404);
  }
  return c.json({ error: 'no_ledger_entries', message: 'No ledger entries found' }, 404);
});

// GET /nodes - List nodes (stub)
app.get('/nodes', (c) => c.json({
  nodes: [
    { endpoint: 'https://clawish-test.workers.dev', type: 'writer', status: 'active' }
  ],
  count: 1,
}));

export default app;
