#!/usr/bin/env node
/**
 * session-to-md.js - Extract conversation from OpenClaw session files
 * Merges all sessions by day into single files
 * Outputs pipe-separated format: TIMESTAMP | ROLE | CONTENT
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = '/home/tauora/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/tauora/.openclaw/workspace/logs/conversations';

function formatTime(ts) {
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

function getShanghaiDateStr(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const shanghaiTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  return shanghaiTime.toISOString().split('T')[0];
}

function extractTextFromContent(content) {
  if (!content || !Array.isArray(content)) return '';
  
  const texts = [];
  for (const item of content) {
    if (item.type === 'text' && item.text) {
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

function formatAsMarkdownTable(messages) {
  const lines = [];
  
  // Header row
  lines.push('| Timestamp | Role | Content |');
  // Separator row
  lines.push('|-----------|------|---------|');
  
  for (const msg of messages) {
    const time = formatTime(msg.timestamp);
    // Escape pipe characters in content
    const content = msg.text
      .replace(/\|/g, '\\|')  // Escape pipes
      .replace(/\n/g, '<br>');  // Replace newlines with <br> for table
    lines.push(`| ${time} | ${msg.role} | ${content} |`);
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

function extractAllSessions() {
  // Collect all messages from all sessions by date
  const allMessagesByDate = new Map();
  
  const sessionFiles = getSessionFiles();
  console.log(`Found ${sessionFiles.length} sessions...`);
  
  for (const sessionFile of sessionFiles) {
    try {
      const sessionMessages = parseSessionFile(sessionFile.path);
      for (const msg of sessionMessages) {
        const dateStr = getShanghaiDateStr(msg.timestamp);
        if (!allMessagesByDate.has(dateStr)) {
          allMessagesByDate.set(dateStr, []);
        }
        allMessagesByDate.get(dateStr).push(msg);
      }
    } catch (e) {
      console.error(`Failed to parse ${sessionFile.id}: ${e.message}`);
    }
  }
  
  // Write each date's merged messages to a single file
  for (const [dateStr, dateMessages] of allMessagesByDate) {
    // Sort by timestamp
    dateMessages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    
    const yearMonth = dateStr.substring(0, 7);
    
    const monthDir = path.join(OUTPUT_DIR, yearMonth);
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }
    
    // Format as markdown table
    const tableOutput = formatAsMarkdownTable(dateMessages);
    
    const outputFile = path.join(monthDir, `${dateStr}.md`);
    fs.writeFileSync(outputFile, tableOutput, 'utf-8');
    
    console.log(`✅ Saved to: ${outputFile}`);
    console.log(`   Messages: ${dateMessages.length}`);
    console.log(`   Date: ${dateStr}`);
  }
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Always extract all sessions and merge by date
  extractAllSessions();
}

main();
