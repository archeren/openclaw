/**
 * Chat routes - message send, poll, acknowledge
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { createMessage, getMessagesForRecipient, deleteMessages } from '../db/index.js';
import { checkRateLimit } from '../rate-limiter.js';
const TLL_HOURS = 24;
const sendMessageSchema = z.object({
    sender_uuid: z.string().uuid(),
    recipient_uuid: z.string().uuid(),
    encrypted_content: z.string().min(1),
    nonce: z.string().min(1),
    signature: z.string().min(1),
    sender_public_key: z.string().min(1),
    timestamp: z.number().int().positive(),
});
const pollQuerySchema = z.object({
    recipient_uuid: z.string().uuid(),
    since: z.string().optional(),
});
const ackSchema = z.object({
    recipient_uuid: z.string().uuid(),
    message_ids: z.array(z.string()).min(1),
});
export function chatRoutes(db) {
    const app = new Hono();
    // POST /chat - Send message
    app.post('/', async (c) => {
        try {
            const body = await c.req.json();
            const parsed = sendMessageSchema.safeParse(body);
            if (!parsed.success) {
                return c.json({ error: 'invalid_request', details: parsed.error.errors }, 400);
            }
            const data = parsed.data;
            const now = Date.now();
            const expiresAt = now + TLL_HOURS * 60 * 60 * 1000;
            // Rate limiting
            const tier = 0; // TODO: L1 tier lookup
            const rateLimit = checkRateLimit(data.sender_uuid, tier);
            if (!rateLimit.allowed) {
                return c.json({
                    error: 'rate_limit_exceeded',
                    retry_after: rateLimit.retryAfter,
                }, 429);
            }
            const messageId = createMessage(db, {
                ...data,
                expires_at: expiresAt,
            });
            return c.json({
                message_id: messageId,
                status: 'queued',
                expires_at: expiresAt,
                rate_limit: {
                    remaining: rateLimit.remaining,
                    reset_at: rateLimit.resetAt,
                },
            }, 201);
        }
        catch (error) {
            console.error('Send message error:', error);
            return c.json({ error: 'internal_error' }, 500);
        }
    });
    // GET /chat - Poll messages
    app.get('/', (c) => {
        const recipientUuid = c.req.query('recipient_uuid');
        const since = c.req.query('since');
        if (!recipientUuid) {
            return c.json({ error: 'missing_recipient_uuid' }, 400);
        }
        const messages = getMessagesForRecipient(db, recipientUuid, since);
        return c.json({
            messages,
            has_more: false, // TODO: pagination
        });
    });
    // DELETE /chat - Acknowledge delivery
    app.delete('/', async (c) => {
        try {
            const body = await c.req.json();
            const parsed = ackSchema.safeParse(body);
            if (!parsed.success) {
                return c.json({ error: 'invalid_request', details: parsed.error.errors }, 400);
            }
            const { recipient_uuid, message_ids } = parsed.data;
            const deleted = deleteMessages(db, recipient_uuid, message_ids);
            return c.json({ deleted });
        }
        catch (error) {
            console.error('Ack message error:', error);
            return c.json({ error: 'internal_error' }, 500);
        }
    });
    return app;
}
