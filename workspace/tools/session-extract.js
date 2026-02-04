#!/usr/bin/env node
/**
 * session-extract.js - Extract conversation from OpenClaw session files
 * Outputs pipe-separated format: TIMESTAMP | ROLE | CONTENT
 * 
 * Usage:
 *   node session-extract.js [session-id]
 * 
 * Examples:
 *   node session-extract.js                    # Extract latest session
 *   node session-extract.js <session-id>       # Extract specific session
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = '/home/tauora/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/tauora/.openclaw/workspace/logs/conversations';

function formatTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function getDateFromTimestamp(ts) {
  if (!ts) return new Date();
  return new Date(ts);
}

function extractTextFromContent(content) {
  if (!content || !Array.isArray(content)) return '';
  
  const texts = [];
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      // Clean up the text
      let text = item.text
        .replace(/\s*\[message_id:\s*[\w-]+\]\s*$/m, '')
        .replace(/^System:.*$/gm, '')
        .trim();
      if (text) texts.push(text);
    }
  }
  return texts.join('\n');
}

function extractAssistantContent(content) {
  if (!content || !Array.isArray(content)) return { text: '', hasTools: false };
  
  const texts = [];
  let hasTools = false;
  const tools = [];
  
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      let text = item.text;
      // Remove thinking/analysis blocks
      text = text.replace(/^[\s\S]*?<\/think>\s*/i, '');
      text = text
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
  
  let result = texts.join('\n');
  if (hasTools && tools.length > 0) {
    result += (result ? '\n' : '') + `[tools: ${tools.join(', ')}]`;
  }
  return { text: result, hasTools };
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
          const text = extractTextFromContent(msg.content);
          if (text) {
            messages.push({
              role: 'User',
              text,
              timestamp: event.timestamp
            });
          }
        } else if (msg.role === 'assistant') {
          const { text } = extractAssistantContent(msg.content);
          // Keep assistant messages even if empty (for completeness)
          messages.push({
            role: 'Assistant',
            text,
            timestamp: event.timestamp
          });
        }
      }
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  return messages;
}

function formatAsPipes(messages) {
  const lines = [];
  
  for (const msg of messages) {
    const time = formatTime(msg.timestamp);
    // Escape newlines in content for single-line format
    const content = msg.text.replace(/\n/g, '\\n');
    lines.push(`${time} | ${msg.role} | ${content}`);
  }
  
  return lines.join('\n');
}

function getSessionFiles() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error(`Sessions directory not found: ${SESSIONS_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      id: f.replace('.jsonl', '')
    }));
}

function getLatestSession() {
  const files = getSessionFiles();
  if (files.length === 0) return null;
  
  files.sort((a, b) => {
    const statA = fs.statSync(a.path);
    const statB = fs.statSync(b.path);
    return statB.mtime - statA.mtime;
  });
  
  return files[0];
}

function extractSession(sessionId) {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.jsonl`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Session not found: ${sessionId}`);
    process.exit(1);
  }
  
  const messages = parseSessionFile(filePath);
  
  if (messages.length === 0) {
    console.log('No messages found in session.');
    return;
  }
  
  const firstMsg = messages[0];
  const date = getDateFromTimestamp(firstMsg.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  const yearMonth = dateStr.substring(0, 7);
  
  const monthDir = path.join(OUTPUT_DIR, yearMonth);
  if (!fs.existsSync(monthDir)) {
    fs.mkdirSync(monthDir, { recursive: true });
  }
  
  // Format as pipe-separated
  const pipeOutput = formatAsPipes(messages);
  
  const outputFile = path.join(monthDir, `${dateStr}-${sessionId}.txt`);
  fs.writeFileSync(outputFile, pipeOutput, 'utf-8');
  
  console.log(`✅ Saved to: ${outputFile}`);
  console.log(`   Messages: ${messages.length}`);
  console.log(`   Date: ${dateStr}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  if (args.length === 0) {
    const latest = getLatestSession();
    if (latest) {
      extractSession(latest.id);
    } else {
      console.error('No sessions found.');
    }
  } else {
    extractSession(args[0]);
  }
}

main();
