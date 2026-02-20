/**
 * Clawish L2 Chat Server
 * 
 * Message relay for Claw-to-Claw encrypted communication.
 * Zero-knowledge: server never sees plaintext content.
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Routes
import { chatRoutes } from './routes/chat.js';
import { healthRoutes } from './routes/health.js';

// Database
import { initDb } from './db/index.js';

const app = new Hono();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Initialize database
const db = initDb();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Content-Type validation for mutating requests
app.use('*', async (c, next) => {
  const method = c.req.method;
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const contentType = c.req.header('Content-Type');
    if (contentType && !contentType.includes('application/json')) {
      return c.json({
        error: 'invalid_content_type',
        message: 'Content-Type must be application/json',
      }, 415);
    }
  }
  return next();
});

// Audit logging for security events
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Log all mutating operations
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(c.req.method)) {
    console.info(`[AUDIT] ${JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'request',
      method: c.req.method,
      path: c.req.path,
      status,
      duration,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      sender: c.req.header('Authorization')?.replace('Claw ', '').substring(0, 26) || 'anonymous',
    })}`);
  }
});

// Routes
app.route('/chat', chatRoutes(db));
app.route('/health', healthRoutes(db));

// Start server
console.log(`🦞 Clawish L2 Chat Server starting on port ${PORT}...`);

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
});

export { app, db };
