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

// Use OPENCLAW_DIR env var or default to ~/.openclaw (portable across systems)
const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(process.env.HOME, '.openclaw');
const SESSIONS_DIR = path.join(OPENCLAW_DIR, 'agents/main/sessions');
const OUTPUT_DIR = path.join(OPENCLAW_DIR, 'workspace/chat');
const DB_PATH = path.join(OUTPUT_DIR, 'conversations.db');
const CHECKPOINT_PATH = path.join(OUTPUT_DIR, '.extract-checkpoint');
const CONTACTS_PATH = path.join(OUTPUT_DIR, 'contacts.json');

// Load contact list (maps channel+ID → display name)
// Format: { "allan": { "feishu": "ou_xxx", "telegram": "123456" } }
function loadContacts() {
  try {
    if (fs.existsSync(CONTACTS_PATH)) {
      const contacts = JSON.parse(fs.readFileSync(CONTACTS_PATH, 'utf-8'));
      // Build reverse lookup: channel → ID → name
      const lookup = {};
      for (const [name, channels] of Object.entries(contacts)) {
        for (const [channel, id] of Object.entries(channels)) {
          if (!lookup[channel]) lookup[channel] = {};
          lookup[channel][id] = name;
        }
      }
      return lookup;
    }
  } catch (e) {
    console.warn('Could not load contacts.json:', e.message);
  }
  return {};
}

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
  let firstUserMessage = null;

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
              
              // Capture first user message for peer info extraction
              if (!firstUserMessage && text) {
                firstUserMessage = item.text;
              }
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

  return { messages, firstUserMessage };
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

// Extract peer info from message content
// Looks for Feishu/Telegram/etc. user IDs in system message headers
// Uses contactsLookup (loaded from contacts.json) to resolve IDs to names
function extractPeerInfoFromMessage(messageContent, contactsLookup) {
  try {
    // Pattern 1: Feishu DM format - "System: [...] Feishu[default] DM from ou_xxx"
    // Note: Text may have escaped newlines (\n)
    const feishuMatch = messageContent.match(/Feishu\[[^\]]*\]\s+DM\s+from\s+(ou_[a-f0-9]+)/i);
    if (feishuMatch) {
      const userId = feishuMatch[1];
      // Use contact list to resolve name
      const name = contactsLookup.feishu?.[userId] || userId;
      return {
        name: name,
        type: 'dm',
        channel: 'feishu',
        chatId: userId
      };
    }
    
    // Pattern 2: Telegram format - "[Telegram Tauora (@tauist) id:6225675738 ...]"
    // Extract display name (first word after "Telegram ")
    const telegramMatch = messageContent.match(/\[Telegram\s+([^\s(@]+)\s+\(@?([^\)]+)\)\s+id:(\d+)/i);
    if (telegramMatch) {
      const chatId = telegramMatch[3];
      // Use contact list to resolve name (Telegram ID → name)
      const name = contactsLookup.telegram?.[chatId] || telegramMatch[1].toLowerCase();
      return {
        name: name,
        type: 'dm',
        channel: 'telegram',
        chatId: chatId,
        username: telegramMatch[2] // "@tauist"
      };
    }
    
    // Pattern 3: Generic inbound metadata JSON block
    const metadataMatch = messageContent.match(/\{\s*"schema":\s*"openclaw\.inbound_meta\.v1"[^}]*\}/s);
    if (metadataMatch) {
      const metadata = JSON.parse(metadataMatch[0]);
      return {
        name: metadata.chat_id || metadata.sender_id || 'unknown',
        type: metadata.chat_type || 'dm',
        channel: metadata.channel || metadata.provider || 'unknown',
        chatId: metadata.chat_id || metadata.sender_id
      };
    }
  } catch (e) {
    // Parsing failed
  }
  return null;
}

// Find first message with peer info (skip system heartbeats)
function findFirstMessageWithPeerInfo(messages, contactsLookup) {
  for (const msg of messages) {
    if (msg.role === 'User' && msg.text) {
      const peerInfo = extractPeerInfoFromMessage(msg.text, contactsLookup);
      if (peerInfo) return peerInfo;
    }
  }
  return null;
}

// Extract peer info from entire session file (search all messages)
function extractPeerInfoFromSessionFile(filePath, contactsLookup) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        if (event.type === 'message' && event.message?.role === 'user') {
          const text = event.message.content?.[0]?.text || '';
          const peerInfo = extractPeerInfoFromMessage(text, contactsLookup);
          if (peerInfo) return peerInfo;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return null;
}

// Check if session is conversation with Allan (by content patterns)
function isAllanSession(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Look for patterns that indicate Allan is the conversation partner
    if (content.includes('Allan') || content.includes('爸爸') || content.includes('feishu') || content.includes('ou_cad')) {
      return true;
    }
  } catch (e) {}
  return false;
}

// Append messages to daily file (create if doesn't exist)
function appendToDailyFile(dateStr, newMessages, sessionId, sessionFilePath, cachedPeerInfo, contactsLookup) {
  const yearMonth = dateStr.substring(0, 7);
  
  // Use cached peer info from session file (or extract if not cached)
  const peerInfo = cachedPeerInfo || extractPeerInfoFromSessionFile(sessionFilePath, contactsLookup);
  
  // Determine recipient name:
  // 1. Use extracted peer info if available
  // 2. Fall back to "allan" if session appears to be conversation with Allan
  // 3. Otherwise use session ID (last resort)
  let name;
  if (peerInfo) {
    name = peerInfo.name;
  } else if (isAllanSession(sessionFilePath)) {
    name = 'allan';
  } else {
    name = sessionId.substring(0, 12);
  }
  
  // Structure: dm/{recipient}/year/month/content.md
  const personDir = path.join(OUTPUT_DIR, 'dm', name, yearMonth);

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

  // Load contact list
  const contactsLookup = loadContacts();
  const contactCount = Object.values(contactsLookup).reduce((sum, c) => sum + Object.keys(c).length, 0);
  console.log(`Loaded ${contactCount} contact mappings from contacts.json`);

  // Get last processed timestamp
  const lastProcessed = getLastProcessedTimestamp();
  console.log(`Last processed: ${lastProcessed ? new Date(lastProcessed).toISOString() : 'None (full rebuild)'}`);
  console.log(`OpenClaw directory: ${OPENCLAW_DIR}`);

  // Collect all messages from all sessions (incremental)
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f =>
      !f.endsWith('.lock') && (
        f.endsWith('.jsonl') ||
        f.includes('.jsonl.deleted.') ||
        f.includes('.jsonl.reset.')
      )
    )
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      id: f.replace('.jsonl', '')
    }));

  console.log(`Found ${sessionFiles.length} sessions`);

  // Extract peer info for each session once (cache it)
  const sessionPeerInfo = new Map();
  for (const sessionFile of sessionFiles) {
    const peerInfo = extractPeerInfoFromSessionFile(sessionFile.path, contactsLookup);
    if (peerInfo) {
      sessionPeerInfo.set(sessionFile.id, peerInfo);
      console.log(`Session ${sessionFile.id.substring(0, 12)}: ${peerInfo.channel}/${peerInfo.name}`);
    }
  }

  // Group new messages by Shanghai date and session ID
  const messagesByDateAndSession = new Map();
  let maxTimestamp = lastProcessed;
  let totalNewMessages = 0;

  for (const sessionFile of sessionFiles) {
    try {
      const { messages, firstUserMessage } = parseSessionFile(sessionFile.path, lastProcessed);
      for (const msg of messages) {
        const dateStr = getShanghaiDateString(msg.timestamp);
        const sessionId = sessionFile.id;

        const key = `${sessionId}|${dateStr}`;
        if (!messagesByDateAndSession.has(key)) {
          messagesByDateAndSession.set(key, { sessionId, dateStr, messages: [], firstUserMessage, sessionPath: sessionFile.path });
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
  for (const [key, { sessionId, dateStr, messages, firstUserMessage, sessionPath }] of messagesByDateAndSession) {
    const cachedPeerInfo = sessionPeerInfo.get(sessionId);
    const count = appendToDailyFile(dateStr, messages, sessionId, sessionPath, cachedPeerInfo, contactsLookup);
    
    // Determine name for logging
    let name;
    if (cachedPeerInfo) {
      name = cachedPeerInfo.name;
    } else if (isAllanSession(sessionPath)) {
      name = 'allan';
    } else {
      name = sessionId.substring(0, 12);
    }
    
    console.log(`✓ ${dateStr} (dm/${name}): +${count} messages`);
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
