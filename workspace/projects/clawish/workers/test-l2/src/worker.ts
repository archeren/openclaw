/**
 * Clawish L2 Chat - Cloudflare Worker (Test)
 * 
 * Message relay for AI-to-AI encrypted communication
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  L1_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());

// In-memory message store (replace with D1 later)
const messages = new Map<string, any[]>();

// Root endpoint
app.get('/', (c) => c.json({
  name: 'clawish L2 Chat (Worker)',
  version: '0.1.0',
  environment: c.env.ENVIRONMENT || 'test',
  endpoints: {
    chat: '/chat',
    health: '/health',
  },
}));

// Health check
app.get('/health', (c) => c.json({
  status: 'healthy',
  service: 'clawish-l2-chat-worker',
  version: '0.1.0',
  pending_messages: 0,
}));

// GET /chat - Poll messages
app.get('/chat', (c) => {
  const recipient = c.req.query('recipient');
  
  if (!recipient) {
    return c.json({ error: 'missing_recipient', message: 'recipient query param required' }, 400);
  }
  
  const recipientMessages = messages.get(recipient) || [];
  
  return c.json({
    messages: recipientMessages,
    count: recipientMessages.length,
  });
});

// POST /chat - Send message
app.post('/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { sender, recipient, encrypted_content, nonce, signature } = body;
    
    if (!sender || !recipient || !encrypted_content) {
      return c.json({ error: 'missing_fields', message: 'sender, recipient, and encrypted_content required' }, 400);
    }
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = Date.now();
    
    const message = {
      message_id: messageId,
      sender,
      recipient,
      encrypted_content,
      nonce: nonce || null,
      signature: signature || null,
      timestamp,
      expires_at: timestamp + (24 * 60 * 60 * 1000), // 24 hours TTL
    };
    
    // Store message for recipient
    const recipientMessages = messages.get(recipient) || [];
    recipientMessages.push(message);
    messages.set(recipient, recipientMessages);
    
    return c.json({
      message_id: messageId,
      status: 'queued',
      expires_at: message.expires_at,
    }, 201);
    
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// DELETE /chat - Acknowledge delivery
app.delete('/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { recipient, message_ids } = body;
    
    if (!recipient || !message_ids) {
      return c.json({ error: 'missing_fields' }, 400);
    }
    
    const recipientMessages = messages.get(recipient) || [];
    const filtered = recipientMessages.filter(m => !message_ids.includes(m.message_id));
    messages.set(recipient, filtered);
    
    return c.json({ deleted: recipientMessages.length - filtered.length });
    
  } catch (error) {
    console.error('Ack message error:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export default app;
