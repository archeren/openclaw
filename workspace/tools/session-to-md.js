#!/usr/bin/env node
/**
 * session-to-md.js - Extract conversation from OpenClaw session files to Markdown
 * Clean, readable format focused on dialogue
 * 
 * Usage:
 *   node session-to-md.js [session-id] [options]
 * 
 * Examples:
 *   node session-to-md.js                    # Extract latest session
 *   node session-to-md.js <session-id>       # Extract specific session
 *   node session-to-md.js --all              # Extract all sessions
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = '/home/tauora/.openclaw/agents/main/sessions';
const OUTPUT_DIR = '/home/tauora/.openclaw/workspace/logs/conversations';

function formatTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function getDateFromTimestamp(ts) {
  if (!ts) return new Date();
  return new Date(ts);
}

function extractUserMessage(content) {
  if (!content || !Array.isArray(content)) return '';
  
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      let text = item.text.replace(/\s*\[message_id:\s*[\w-]+\]\s*$/, '').trim();
      text = text.replace(/^System:.*$/gm, '').trim();
      return text;
    }
  }
  return '';
}

function extractAssistantMessage(content) {
  if (!content || !Array.isArray(content)) return { text: '', hasThinking: false, tools: [] };
  
  let text = '';
  let hasThinking = false;
  const tools = [];
  
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      let cleanText = item.text;
      
      // Skip raw thinking/analysis text
      if (cleanText.match(/^\s*(The user is|Looking at|I should|Let me|This is|So I|Now I)/i)) {
        continue;
      }
      
      // Remove content before </think>
      cleanText = cleanText.replace(/^[\s\S]*?<\/think>\s*/i, '');
      
      cleanText = cleanText
        .replace(/^\s*([-_]){3,}\s*/gm, '')
        .replace(/\s*🅰️\s*$/, '')
        .trim();
        
      if (cleanText) {
        text += (text ? '\n\n' : '') + cleanText;
      }
    } else if (item.type === 'thinking' && item.thinking) {
      hasThinking = true;
    } else if (item.type === 'toolCall' && item.name) {
      const toolName = item.name.split('.').pop();
      if (!tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  }
  
  return { text: text.trim(), hasThinking, tools };
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
          const text = extractUserMessage(msg.content);
          if (text) {
            messages.push({
              role: 'user',
              text,
              timestamp: event.timestamp
            });
          }
        } else if (msg.role === 'assistant') {
          const { text, hasThinking, tools } = extractAssistantMessage(msg.content);
          // Keep assistant messages even if text is empty (for metadata tracking)
          messages.push({
            role: 'assistant',
            text,
            hasThinking,
            tools,
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

function formatConversation(messages) {
  const lines = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const time = formatTime(msg.timestamp);
    
    if (msg.role === 'user') {
      lines.push('');
      lines.push(`**Allan** (${time})`);
      lines.push('');
      lines.push(msg.text);
    } else if (msg.role === 'assistant') {
      // Build metadata in one line
      const meta = [];
      if (msg.hasThinking) meta.push('thinking');
      if (msg.tools.length > 0) meta.push(`tools: ${msg.tools.join(', ')}`);
      
      const metaStr = meta.length > 0 ? ` [${meta.join(' · ')}]` : '';
      
      lines.push('');
      lines.push(`**Alpha** (${time})${metaStr}`);
      
      if (msg.text) {
        lines.push('');
        lines.push(msg.text);
      }
    }
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
  
  console.log(`Extracting session: ${sessionId}...`);
  
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
  
  const conversation = formatConversation(messages);
  
  const mdContent = `# Conversation - ${dateStr}

${conversation}
`;
  
  const outputFile = path.join(monthDir, `${dateStr}-${sessionId}.md`);
  fs.writeFileSync(outputFile, mdContent, 'utf-8');
  
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
  } else if (args[0] === '--all') {
    const files = getSessionFiles();
    console.log(`Found ${files.length} sessions...`);
    for (const file of files) {
      try {
        extractSession(file.id);
      } catch (e) {
        console.error(`Failed to extract ${file.id}: ${e.message}`);
      }
    }
  } else if (args[0] === '--list') {
    const files = getSessionFiles();
    console.log('Available sessions:');
    files.forEach((f, i) => {
      const stat = fs.statSync(f.path);
      console.log(`  ${i + 1}. ${f.id} (${(stat.size / 1024).toFixed(1)} KB)`);
    });
  } else {
    extractSession(args[0]);
  }
}

main();
