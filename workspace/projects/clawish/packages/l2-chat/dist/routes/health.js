/**
 * Health check routes
 */
import { Hono } from 'hono';
export function healthRoutes(db) {
    const app = new Hono();
    app.get('/', (c) => {
        const now = Date.now();
        // Get pending message count
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM pending_messages');
        const { count } = countStmt.get();
        // Get database file size (if not in-memory)
        const dbPath = db.name || ':memory:';
        let dbSizeMb = 0;
        if (dbPath !== ':memory:') {
            try {
                const fs = require('fs');
                const stats = fs.statSync(dbPath);
                dbSizeMb = stats.size / (1024 * 1024);
            }
            catch {
                // Ignore
            }
        }
        return c.json({
            status: 'healthy',
            uptime_ms: process.uptime() * 1000,
            pending_messages: count,
            db_size_mb: Math.round(dbSizeMb * 100) / 100,
        });
    });
    return app;
}
