#!/usr/bin/env node
/**
 * session-to-sqlite.js - Extract conversation from OpenClaw session files using SQLite for reliable sorting
 * Outputs: 
 *   - conversations.db (SQLite database for querying)
 *   - YYYY-MM/YYYY-MM-DD.md files (markdown tables with Shanghai time display)
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SESSIONS_DIR = '/home/tauora/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/tauora/.openclaw/workspace/logs/conversations';
const DB_PATH = path.join(OUTPUT_DIR, 'conversations.db');

function formatTimeShanghai(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}

function formatAsMarkdownTable(messages) {
  const lines = [];
  lines.push('| Timestamp | Role | Content |');
  lines.push('|-----------|------|---------|');
  
  for (const msg of messages) {
    const time = formatTimeShanghai(msg.timestamp);
    const content = msg.text
      .replace(/\|/g, '\\|')
      .replace(/\n/g, '<br>');
    lines.push(`| ${time} | ${msg.role} | ${content} |`);
  }
  
  return lines.join('\n');
}

function parseSessionFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const messages = [];
  
  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      
      if (event.type === 'message' && event.message) {
        const msg = event.message;
        
        if (msg.role === 'system') continue;
        if (msg.role === 'toolResult') continue;
        
        if (msg.role === 'user') {
          const texts = [];
          for (const item of (msg.content || [])) {
            if (item.type === 'text' && item.text) {
              let text = item.text
                .replace(/\s*\[message_id:\s*[\w-]+\]\s*$/m, '')
                .replace(/^System:.*$/gm, '')
                .trim();
              if (text) texts.push(text);
            }
          }
          if (texts.length > 0) {
            messages.push({
              role: 'User',
              text: texts.join('\n'),
              timestamp: new Date(event.timestamp).getTime()
            });
          }
        } else if (msg.role === 'assistant') {
          const texts = [];
          let hasTools = false;
          const tools = [];
          
          for (const item of (msg.content || [])) {
            if (item.type === 'text' && item.text) {
              let text = item.text
                .replace(/^[\s\S]*?<\/think>\s*/i, '')
                .replace(/^\s*([-_]){3,}\s*$/gm, '')
                .replace(/\s*🅰️\s*$/, '')
                .trim();
              if (text) texts.push(text);
            } else if (item.type === 'toolCall' && item.name) {
              hasTools = true;
              const toolName = item.name.split('.').pop();
              if (!tools.includes(toolName)) {
                tools.push(toolName);
              }
            }
          }
          
          if (texts.length > 0 || hasTools) {
            let result = texts.join('\n');
            if (hasTools && tools.length > 0) {
              result += (result ? '\n' : '') + `[tools: ${tools.join(', ')}]`;
            }
            messages.push({
              role: 'Assistant',
              text: result,
              timestamp: new Date(event.timestamp).getTime()
            });
          }
        }
      }
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  return messages;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Remove old DB if exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  
  // Create SQLite database
  const db = new sqlite3.Database(DB_PATH);
  
  db.serialize(() => {
    // Create table with UTC timestamp
    db.run(`CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT
    )`);
    
    db.run(`CREATE INDEX idx_timestamp ON messages(timestamp)`);
    
    console.log('Creating database...');
    
    // Collect all messages from all sessions
    const sessionFiles = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        id: f.replace('.jsonl', '')
      }));
    
    console.log(`Found ${sessionFiles.length} sessions`);
    
    // Insert all messages
    const insertStmt = db.prepare('INSERT INTO messages (timestamp, role, content) VALUES (?, ?, ?)');
    let totalInserted = 0;
    
    for (const sessionFile of sessionFiles) {
      try {
        const sessionMessages = parseSessionFile(sessionFile.path);
        for (const msg of sessionMessages) {
          insertStmt.run(msg.timestamp, msg.role, msg.text);
          totalInserted++;
        }
      } catch (e) {
        console.error(`Failed: ${sessionFile.id}`);
      }
    }
    
    insertStmt.finalize();
    console.log(`Inserted ${totalInserted} messages`);
    
    // Query sorted results and export by Shanghai date
    const allMessagesByDate = new Map();
    
    db.each(`SELECT timestamp, role, content FROM messages ORDER BY timestamp`, (err, row) => {
      if (err) return;
      
      // Convert UTC timestamp to Shanghai time (UTC+8) for date grouping
      const shanghaiTime = new Date(row.timestamp);
      
      // Validate date
      if (isNaN(shanghaiTime.getTime())) {
        console.warn(`Invalid timestamp: ${row.timestamp}`);
        return;
      }
      
      const year = shanghaiTime.toLocaleString('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric'
      });
      const month = shanghaiTime.toLocaleString('en-US', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit'
      });
      const day = shanghaiTime.toLocaleString('en-US', {
        timeZone: 'Asia/Shanghai',
        day: '2-digit'
      });
      const dateStr = `${year}-${month}-${day}`;
      
      if (!allMessagesByDate.has(dateStr)) {
        allMessagesByDate.set(dateStr, []);
      }
      
      allMessagesByDate.get(dateStr).push({
        timestamp: row.timestamp,
        role: row.role,
        text: row.content
      });
    }, () => {
      // Export files
      for (const [dateStr, dateMessages] of allMessagesByDate) {
        const yearMonth = dateStr.substring(0, 7);
        const monthDir = path.join(OUTPUT_DIR, yearMonth);
        
        if (!fs.existsSync(monthDir)) {
          fs.mkdirSync(monthDir, { recursive: true });
        }
        
        const tableOutput = formatAsMarkdownTable(dateMessages);
        const outputFile = path.join(monthDir, `${dateStr}.md`);
        fs.writeFileSync(outputFile, tableOutput, 'utf-8');
        
        console.log(`✓ ${dateStr}: ${dateMessages.length} messages`);
      }
      
      console.log(`\n🦞 Database: ${DB_PATH}`);
      db.close();
    });
  });
}

main();
