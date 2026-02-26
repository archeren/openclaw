#!/usr/bin/env node
/**
 * extract-chat.js - Incremental chat extraction from OpenClaw session files
 * Outputs:
 *   - conversations.db (SQLite database)
 *   - YYYY-MM/YYYY-MM-DD.md files (markdown tables with Shanghai time display)
 *
 * Features:
 *   - Incremental: Only processes new messages since last run
 *   - Uses checkpoint file to track last processed timestamp
 *   - Daily files organized by Shanghai local time
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/chat';
const DB_PATH = path.join(OUTPUT_DIR, 'conversations.db');
const CHECKPOINT_PATH = path.join(OUTPUT_DIR, '.extract-checkpoint');

// Get last processed timestamp from checkpoint file
function getLastProcessedTimestamp() {
  try {
    if (fs.existsSync(CHECKPOINT_PATH)) {
      const data = fs.readFileSync(CHECKPOINT_PATH, 'utf-8');
      return parseInt(data.trim(), 10) || 0;
    }
  } catch (e) {
    console.warn('Could not read checkpoint file, starting fresh');
  }
  return 0;
}

// Save checkpoint timestamp
function saveCheckpoint(timestamp) {
  try {
    fs.writeFileSync(CHECKPOINT_PATH, timestamp.toString(), 'utf-8');
  } catch (e) {
    console.error('Failed to save checkpoint:', e.message);
  }
}

// Format timestamp for Shanghai timezone display
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

// Get Shanghai date string for grouping (YYYY-MM-DD)
function getShanghaiDateString(ts) {
  const date = new Date(ts);
  const year = date.toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric'
  });
  const month = date.toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit'
  });
  const day = date.toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    day: '2-digit'
  });
  return `${year}-${month}-${day}`;
}

// Parse messages from a session file, filtering by timestamp
function parseSessionFile(filePath, minTimestamp) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const messages = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line);

      // Skip if message is older than our checkpoint
      const msgTimestamp = new Date(event.timestamp).getTime();
      if (msgTimestamp <= minTimestamp) continue;

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
              timestamp: msgTimestamp
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
              timestamp: msgTimestamp
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

// Format messages as markdown table
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

// Parse timestamp from Shanghai time string (MM-DD-YYYY, HH:mm:ss)
function parseShanghaiTime(timeStr) {
  if (!timeStr || timeStr.trim() === '') return 0;
  try {
    // Format: 02-23-2026, 11:30:45
    const match = timeStr.match(/(\d{2})-(\d{2})-(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, month, day, year, hour, minute, second] = match;
      // Create date in Shanghai timezone
      const shanghaiDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`);
      return shanghaiDate.getTime();
    }
  } catch (e) {
    // Fallback: return 0 if parsing fails
  }
  return 0;
}

// Load recipient mapping from recipients.json
function loadRecipientsMapping() {
  const recipientsPath = path.join(OUTPUT_DIR, 'recipients.json');
  try {
    if (fs.existsSync(recipientsPath)) {
      return JSON.parse(fs.readFileSync(recipientsPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not load recipients.json, using default');
  }
  return {};
}

// Get recipient info from session ID
function getRecipientInfo(sessionId, recipientsMap) {
  const info = recipientsMap[sessionId];
  if (info && info.name && info.type) {
    return info;
  }
  // Fallback to default
  return { name: 'allan', type: 'dm' };
}

// Append messages to daily file (create if doesn't exist)
function appendToDailyFile(dateStr, newMessages, sessionId, recipientsMap) {
  const yearMonth = dateStr.substring(0, 7);
  const recipientInfo = getRecipientInfo(sessionId, recipientsMap);
  const personDir = path.join(OUTPUT_DIR, recipientInfo.type, recipientInfo.name, yearMonth);

  if (!fs.existsSync(personDir)) {
    fs.mkdirSync(personDir, { recursive: true });
  }

  const outputFile = path.join(personDir, `${dateStr}.md`);

  // Read existing messages if file exists
  let existingMessages = [];
  if (fs.existsSync(outputFile)) {
    const existingContent = fs.readFileSync(outputFile, 'utf-8');
    // Parse existing table rows
    const lines = existingContent.split('\n');
    for (let i = 2; i < lines.length; i++) { // Skip header rows
      const line = lines[i].trim();
      if (line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 3) {
          // Parse timestamp from the time string
          const parsedTimestamp = parseShanghaiTime(parts[0]);
          existingMessages.push({
            timestamp: parsedTimestamp,
            role: parts[1],
            text: parts[2].replace(/<br>/g, '\n').replace(/\\\|/g, '|')
          });
        }
      }
    }
  }

  // Combine and sort by timestamp
  const allMessages = [...existingMessages, ...newMessages];
  allMessages.sort((a, b) => a.timestamp - b.timestamp);

  // Remove duplicates based on content similarity
  const uniqueMessages = [];
  const seen = new Set();
  for (const msg of allMessages) {
    const key = `${msg.role}|${msg.text.substring(0, 100)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMessages.push(msg);
    }
  }

  // Write updated file
  const tableOutput = formatAsMarkdownTable(uniqueMessages);
  fs.writeFileSync(outputFile, tableOutput, 'utf-8');

  return newMessages.length;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get last processed timestamp
  const lastProcessed = getLastProcessedTimestamp();
  console.log(`Last processed: ${lastProcessed ? new Date(lastProcessed).toISOString() : 'None (full rebuild)'}`);

  // Load recipients mapping
  const recipientsMap = loadRecipientsMapping();
  console.log(`Loaded ${Object.keys(recipientsMap).length} recipient mappings`);

  // Collect all messages from all sessions (incremental)
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      id: f.replace('.jsonl', '')
    }));

  console.log(`Found ${sessionFiles.length} sessions`);

  // Group new messages by Shanghai date and session ID
  const messagesByDateAndSession = new Map();
  let maxTimestamp = lastProcessed;
  let totalNewMessages = 0;

  for (const sessionFile of sessionFiles) {
    try {
      const sessionMessages = parseSessionFile(sessionFile.path, lastProcessed);
      for (const msg of sessionMessages) {
        const dateStr = getShanghaiDateString(msg.timestamp);
        const sessionId = sessionFile.id;

        const key = `${sessionId}|${dateStr}`;
        if (!messagesByDateAndSession.has(key)) {
          messagesByDateAndSession.set(key, { sessionId, dateStr, messages: [] });
        }
        messagesByDateAndSession.get(key).messages.push(msg);

        if (msg.timestamp > maxTimestamp) {
          maxTimestamp = msg.timestamp;
        }
        totalNewMessages++;
      }
    } catch (e) {
      console.error(`Failed to process ${sessionFile.id}:`, e.message);
    }
  }

  console.log(`Found ${totalNewMessages} new messages`);

  // Update daily files (grouped by session)
  for (const [key, { sessionId, dateStr, messages }] of messagesByDateAndSession) {
    const count = appendToDailyFile(dateStr, messages, sessionId, recipientsMap);
    console.log(`✓ ${dateStr} (${sessionId}): +${count} messages`);
  }

  // Save checkpoint
  if (maxTimestamp > lastProcessed) {
    saveCheckpoint(maxTimestamp);
    console.log(`Checkpoint saved: ${new Date(maxTimestamp).toISOString()}`);
  }

  // Also update SQLite database (for querying)
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp)`);

    // Insert new messages
    const insertStmt = db.prepare('INSERT INTO messages (timestamp, role, content) VALUES (?, ?, ?)');
    for (const [key, { messages }] of messagesByDateAndSession) {
      for (const msg of messages) {
        insertStmt.run(msg.timestamp, msg.role, msg.text);
      }
    }
    insertStmt.finalize();

    console.log(`\n🦞 Database: ${DB_PATH}`);
    db.close();
  });
}

main();
