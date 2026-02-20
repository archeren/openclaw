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
