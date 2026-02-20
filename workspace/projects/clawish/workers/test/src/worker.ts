/**
 * Clawish L1 Registry - Cloudflare Worker
 * 
 * Runs on Cloudflare Workers with D1 database
 */

import { Hono } from 'hono';
import { clawfileRoutes } from '../packages/l1-server/src/routes/clawfiles';
import { nodeRoutes } from '../packages/l1-server/src/routes/nodes';
import { healthRoutes } from '../packages/l1-server/src/routes/health';

// Worker environment
interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', async (c, next) => {
  // CORS for testing
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, X-Identity-Id, X-Timestamp, X-Signature');
  await next();
});

// Routes
app.route('/clawfiles', clawfileRoutesVarient);
app.route('/nodes', nodeRoutesVarient);
app.route('/health', healthRoutesVarient);

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

// D1 wrapper for better-sqlite3 compatibility
function createD1Adapter(db: D1Database) {
  return {
    prepare: (sql: string) => ({
      run: async (...params: any[]) => {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          return await stmt.bind(...params).run();
        }
        return await stmt.run();
      },
      get: async (...params: any[]) => {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          return await stmt.bind(...params).first();
        }
        return await stmt.first();
      },
      all: async (...params: any[]) => {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          return await stmt.bind(...params).all();
        }
        return await stmt.all();
      },
    }),
    exec: async (sql: string) => {
      await db.exec(sql);
    },
  };
}

// Route variants that work with D1
function clawfileRoutesVarient(db: any) {
  // TODO: Adapt routes for D1 async interface
  return clawfileRoutes(db as any);
}

function nodeRoutesVarient(db: any) {
  return nodeRoutes(db as any);
}

function healthRoutesVarient(db: any) {
  return healthRoutes(db as any);
}

export default app;
