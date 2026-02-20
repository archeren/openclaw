/**
 * Database initialization and helpers
 */
import Database from 'better-sqlite3';
import { ulid } from 'ulid';
export function initDb(dbPath = ':memory:') {
    const db = new Database(dbPath);
    // Create tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS pending_messages (
      message_id TEXT PRIMARY KEY,
      sender_uuid TEXT NOT NULL,
      recipient_uuid TEXT NOT NULL,
      encrypted_content TEXT NOT NULL,
      nonce TEXT NOT NULL,
      signature TEXT NOT NULL,
      sender_public_key TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recipient ON pending_messages(recipient_uuid);
    CREATE INDEX IF NOT EXISTS idx_expires ON pending_messages(expires_at);

    CREATE TABLE IF NOT EXISTS failure_notices (
      notice_id TEXT PRIMARY KEY,
      recipient_uuid TEXT NOT NULL,
      message_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notice_recipient ON failure_notices(recipient_uuid);
  `);
    return db;
}
export function createMessage(db, data) {
    const messageId = ulid();
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT INTO pending_messages 
    (message_id, sender_uuid, recipient_uuid, encrypted_content, nonce, signature, sender_public_key, timestamp, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    stmt.run(messageId, data.sender_uuid, data.recipient_uuid, data.encrypted_content, data.nonce, data.signature, data.sender_public_key, data.timestamp, now, data.expires_at);
    return messageId;
}
export function getMessagesForRecipient(db, recipientUuid, since) {
    if (since) {
        const stmt = db.prepare(`
      SELECT * FROM pending_messages 
      WHERE recipient_uuid = ? AND message_id > ?
      ORDER BY timestamp ASC
    `);
        return stmt.all(recipientUuid, since);
    }
    const stmt = db.prepare(`
    SELECT * FROM pending_messages 
    WHERE recipient_uuid = ?
    ORDER BY timestamp ASC
  `);
    return stmt.all(recipientUuid);
}
export function deleteMessages(db, recipientUuid, messageIds) {
    const placeholders = messageIds.map(() => '?').join(',');
    const stmt = db.prepare(`
    DELETE FROM pending_messages 
    WHERE recipient_uuid = ? AND message_id IN (${placeholders})
  `);
    const result = stmt.run(recipientUuid, ...messageIds);
    return result.changes;
}
export function cleanupExpired(db) {
    const now = Date.now();
    const msgStmt = db.prepare('DELETE FROM pending_messages WHERE expires_at < ?');
    const msgResult = msgStmt.run(now);
    const noticeStmt = db.prepare('DELETE FROM failure_notices WHERE expires_at < ?');
    const noticeResult = noticeStmt.run(now);
    return { messages: msgResult.changes, notices: noticeResult.changes };
}
