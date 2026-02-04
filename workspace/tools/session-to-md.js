#!/usr/bin/env node
/**
 * session-to-md.js - Extract conversation from OpenClaw session files
 * Uses SQLite for reliable sorting, exports to markdown
 * 
 * Outputs: YYYY-MM-DD.md files with pipe-separated format
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

function formatAsMarkdownTable(messages) {
  const lines = [];
  lines.push('| Timestamp | Role | Content |');
  lines.push('|-----------|------|---------|');
  
  for (const msg of messages) {
    const time = formatTime(msg.timestamp);
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
              timestamp: event.timestamp
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
          
          let result = texts.join('\n');
          if (hasTools && tools.length > 0) {
            result += (result ? '\n' : '') + `[tools: ${tools.join(', ')}]`;
          }
          
          messages.push({
            role: 'Assistant',
            text: result,
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

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Collect all messages from all sessions
  const allMessagesByDate = new Map();
  
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      id: f.replace('.jsonl', '')
    }));
  
  console.log(`Found ${sessionFiles.length} sessions...`);
  
  for (const sessionFile of sessionFiles) {
    try {
      const sessionMessages = parseSessionFile(sessionFile.path);
      for (const msg of sessionMessages) {
        const dateStr = new Date(msg.timestamp).toISOString().split('T')[0];
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
    // Sort by UTC timestamp (canonical chronological order)
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

main();
